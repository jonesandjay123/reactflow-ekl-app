// src/graphUtils.ts

import ELK, { ElkExtendedEdge } from "elkjs/lib/elk.bundled.js";

export interface JsonNode {
  id: string;
  value: any;
  children?: JsonNode[];
}

export interface JsonEdge {
  source_id: string;
  target_id: string;
  label?: string;
}

export interface ElkNode {
  id: string;
  width?: number;
  height?: number;
  labels?: { text: string }[];
  properties?: any;
  layoutOptions?: Record<string, string>;
  children?: ElkNode[];
  edges?: ElkExtendedEdge[];
}

export interface ElkGraph {
  id: string;
  layoutOptions: Record<string, string>;
  children: ElkNode[];
  edges: ElkExtendedEdge[];
}

export function getTextWidth(text: string, font: string): number {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) {
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }
  return text.length * 10;
}

export function formatEdge(edge: JsonEdge, font: string): ElkExtendedEdge {
  const label = edge.label || "";
  const labelWidth = getTextWidth(label, font);

  return {
    id: `${edge.source_id}-${edge.target_id}`,
    sources: [edge.source_id],
    targets: [edge.target_id],
    labels: label
      ? [
          {
            id: `label-${edge.source_id}-${edge.target_id}`,
            text: label,
            width: labelWidth,
            height: 16,
          },
        ]
      : [],
  };
}

export function parseJsonData(
  jsonData: any,
  expandedNodes: Set<string>
): ElkGraph {
  const font = "bold 16px Arial";
  let filteredEdges: JsonEdge[] = [...jsonData.edges];

  function getNestedChildIds(nodes: JsonNode[]): string[] {
    let childIds: string[] = [];
    nodes.forEach((node) => {
      if (node.id) {
        childIds.push(node.id);
        if (node.children) {
          childIds = [...childIds, ...getNestedChildIds(node.children)];
        }
      }
    });
    return childIds;
  }

  function processNodes(
    nodes: JsonNode[],
    parentId: string | null = null
  ): ElkNode[] {
    const resultNodes: ElkNode[] = [];

    nodes.forEach((node: JsonNode) => {
      if (!node.id) {
        console.warn("Node with null or undefined id found and skipped:", node);
        return;
      }

      const isOpen = expandedNodes.has(node.id);
      const childIds = node.children ? getNestedChildIds(node.children) : [];
      const isJoinNode = node.id.includes("join_id");
      const isGateNode =
        node.value.class === "or-gate" || node.value.class === "and-gate";

      let width = 200;
      let height = 80;

      if (isJoinNode) {
        width = 10;
        height = 10;
      } else if (isGateNode) {
        width = 30;
        height = 30;
      } else {
        const labelText = node.value.label || "";
        const labelLength = getTextWidth(labelText, font);
        width = labelLength > 200 ? labelLength : 200;
      }

      // 提取节点的背景颜色
      const styleMatch = node.value.style
        ? node.value.style.match(/fill:([^;]+)/)
        : null;
      const backgroundColor = styleMatch ? styleMatch[1] : "#fff";

      // 构建节点的标签，并添加箭头符号
      let label = node.value.label || "";
      const hasChildren = node.children && node.children.length > 0;
      if (hasChildren) {
        label += isOpen ? " ▲" : " ▼";
      }

      if (isOpen && hasChildren) {
        // Node is expanded
        const elkNode: ElkNode = {
          id: node.id,
          labels: [{ text: label }],
          layoutOptions: {
            "elk.padding": "[top=80,left=15,bottom=15,right=15]",
          },
          properties: {
            isOpen: true,
            backgroundColor,
            isParent: true,
          },
          width,
          height,
          children: node.children ? processNodes(node.children, node.id) : [],
          edges: [],
        };

        // Collect internal edges for this node
        const internalEdges = filteredEdges.filter(
          (e) =>
            childIds.includes(e.source_id) && childIds.includes(e.target_id)
        );

        // Remove internal edges from global edge list
        filteredEdges = filteredEdges.filter(
          (e) =>
            !(childIds.includes(e.source_id) && childIds.includes(e.target_id))
        );

        elkNode.edges = internalEdges.map((e) => formatEdge(e, font));

        resultNodes.push(elkNode);
      } else {
        // Node is collapsed or has no children
        // Adjust edges to point to this node instead of its children
        filteredEdges = filteredEdges
          .filter(
            (e) =>
              !(
                childIds.includes(e.source_id) && childIds.includes(e.target_id)
              )
          )
          .map((e) => ({
            ...e,
            source_id: childIds.includes(e.source_id) ? node.id : e.source_id,
            target_id: childIds.includes(e.target_id) ? node.id : e.target_id,
          }));

        const elkNode: ElkNode = {
          id: node.id,
          labels: [{ text: label }],
          properties: {
            isOpen: false,
            backgroundColor,
            isParent: hasChildren,
          },
          width,
          height,
        };

        resultNodes.push(elkNode);
      }
    });

    return resultNodes;
  }

  // 移除 id 为 null 的节点
  const nodesData = jsonData.nodes.children.filter(
    (node: JsonNode) => node.id !== null && node.id !== undefined
  );

  const nodes = processNodes(nodesData);

  const edges = filteredEdges.map((e) => formatEdge(e, font));

  const elkGraph: ElkGraph = {
    id: "root",
    layoutOptions: {
      hierarchyHandling: "INCLUDE_CHILDREN",
      "elk.algorithm": "layered",
      "elk.direction": jsonData.arrange === "LR" ? "RIGHT" : "DOWN",
      "spacing.edgeLabel": "10.0",
      "elk.edgeLabels.inline": "true",
      "elk.padding": "[top=80,left=15,bottom=15,right=15]",
    },
    children: nodes,
    edges: edges,
  };

  return elkGraph;
}

export function transformElkGraphToReactFlow(
  elkGraph: any,
  onNodeDoubleClick: (nodeId: string) => void
) {
  const nodes: any[] = [];
  const edges: any[] = [];

  function traverseElkNode(
    elkNode: any,
    parentId?: string,
    parentPosition = { x: 0, y: 0 }
  ) {
    // Ignore root node
    if (elkNode.id === "root") {
      // Recursively traverse child nodes
      if (elkNode.children && elkNode.children.length > 0) {
        elkNode.children.forEach((child: any) => {
          traverseElkNode(child, undefined, { x: 0, y: 0 });
        });
      }

      // Collect edges at root level
      if (elkNode.edges) {
        elkNode.edges.forEach((elkEdge: any) => {
          edges.push({
            id: elkEdge.id,
            source: elkEdge.sources[0],
            target: elkEdge.targets[0],
            type: "custom",
            data: {
              label: elkEdge.labels?.[0]?.text || "",
            },
          });
        });
      }
      return;
    }

    const { id, x, y, width, height, labels, properties } = elkNode;
    const position = {
      x: (x || 0) + parentPosition.x,
      y: (y || 0) + parentPosition.y,
    };
    const data = {
      label: labels && labels[0] ? labels[0].text : "",
      isParent: properties?.isParent || false,
      onDoubleClick: onNodeDoubleClick,
      style: {
        backgroundColor: properties?.backgroundColor || "#fff",
        borderRadius: properties?.borderRadius || "0px",
        overflow: properties?.isParent ? "visible" : "hidden",
      },
    };

    const nodeStyle: any = {
      width: width ? `${width}px` : undefined,
      height: height ? `${height}px` : undefined,
      backgroundColor: properties?.backgroundColor || "#fff",
      overflow: properties?.isParent ? "visible" : "hidden",
    };

    const node: any = {
      id,
      position,
      data,
      type: "custom",
      style: nodeStyle,
      sourcePosition: "right",
      targetPosition: "left",
    };

    nodes.push(node);

    // Recursively traverse child nodes
    if (elkNode.children && elkNode.children.length > 0) {
      elkNode.children.forEach((child: any) => {
        traverseElkNode(child, id, position);
      });
    }

    // Collect edges at this node level
    if (elkNode.edges) {
      elkNode.edges.forEach((elkEdge: any) => {
        edges.push({
          id: elkEdge.id,
          source: elkEdge.sources[0],
          target: elkEdge.targets[0],
          type: "custom",
          data: {
            label: elkEdge.labels?.[0]?.text || "",
          },
        });
      });
    }
  }

  // Start traversing from the root
  traverseElkNode(elkGraph);

  return { nodes, edges };
}
