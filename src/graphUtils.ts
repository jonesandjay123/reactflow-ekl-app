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

const getDirection = (arrange: string): string => {
  switch (arrange) {
    case "RL":
      return "LEFT";
    case "TB":
      return "DOWN";
    case "BT":
      return "UP";
    case "LR":
    default:
      return "RIGHT";
  }
};

export function getTextWidth(text: string, font: string): number {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) {
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }
  return text.length * 10; // Fallback if context is not available
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
        return;
      }

      const isOpen = expandedNodes.has(node.id);
      const childIds = node.children ? getNestedChildIds(node.children) : [];

      if (isOpen && node.children?.length) {
        const elkNode: ElkNode = {
          id: node.id,
          labels: [{ text: node.value.label || "" }],
          layoutOptions: {
            "elk.padding": "[top=80,left=15,bottom=15,right=15]",
          },
          properties: {
            isOpen: true,
            backgroundColor:
              node.value.style?.match(/fill:([^;]+)/)?.[1] || "#fff",
          },
          width: 200,
          height: 80,
          children: node.children ? processNodes(node.children, node.id) : [],
          edges: filteredEdges
            .filter((e) => {
              if (
                childIds.indexOf(e.source_id) > -1 &&
                childIds.indexOf(e.target_id) > -1
              ) {
                // Remove internal edges
                filteredEdges = filteredEdges.filter(
                  (fe) =>
                    !(
                      fe.source_id === e.source_id &&
                      fe.target_id === e.target_id
                    )
                );
                return true;
              }
              return false;
            })
            .map((e) => formatEdge(e, font)),
        };

        resultNodes.push(elkNode);
      } else {
        // handle non-expanded or leaf nodes
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

        resultNodes.push({
          id: node.id,
          labels: [{ text: node.value.label || "" }],
          width: 200,
          height: 80,
          properties: {
            backgroundColor:
              node.value.style?.match(/fill:([^;]+)/)?.[1] || "#fff",
          },
        });
      }
    });

    return resultNodes;
  }

  // Remove nodes with null or undefined IDs
  const nodesData = jsonData.nodes.children.filter(
    (node: JsonNode) => node.id !== null && node.id !== undefined
  );

  const nodes = processNodes(nodesData);

  const edges = filteredEdges.map((e) => formatEdge(e, font));

  const elkGraph: ElkGraph = {
    id: "root",
    layoutOptions: {
      "elk.hierarchyHandling": "INCLUDE_CHILDREN",
      "elk.direction": getDirection(jsonData.arrange), // 使用 getDirection 方法
      "elk.layering.strategy": "INTERACTIVE", // 保持交互式佈局
      "elk.edgeRouting": "SPLINE", // 使用曲線繞行邊
      "elk.spacing.nodeNodeBetweenLayers": "50.0",
      "elk.spacing.edgeNodeBetweenLayers": "20.0",
      "elk.spacing.edgeEdgeBetweenLayers": "20.0",
      "elk.spacing.edgeNode": "20.0",
      "elk.spacing.edgeEdge": "20.0",
      "elk.spacing.nodeNode": "40.0",
      "elk.spacing.edgeLabel": "10.0",
      "elk.separateConnectedComponents": "true", // 分離連接的組件
      "crossingMinimization.semiInteractive": "true", // 減少交叉
      "elk.core.options.EdgeLabelPlacement": "CENTER",
    },
    children: nodes,
    edges: filteredEdges.map((e) => formatEdge(e, font)),
  };

  return elkGraph;
}

export function transformElkGraphToReactFlow(
  elkGraph: any,
  onNodeDoubleClick: (nodeId: string) => void
) {
  const nodes: any[] = [];
  const edges: any[] = [];

  const nodeIds = new Set<string>();

  function traverseNodes(elkNode: any, parentId?: string) {
    if (elkNode.id === "root") {
      if (elkGraph.children && elkGraph.children.length > 0) {
        elkGraph.children.forEach((child: any) => {
          traverseNodes(child, undefined);
        });
      }
      return;
    }

    const { id, x, y, width, height, labels, properties } = elkNode;
    const position = { x: x || 0, y: y || 0 };

    const data = {
      label: labels && labels[0] ? labels[0].text : "",
      isParent: properties?.isParent || false,
      onDoubleClick: onNodeDoubleClick,
      style: {
        backgroundColor: properties?.backgroundColor || "#fff",
        borderRadius: properties?.borderRadius || "0px",
        opacity: properties?.isJoinNode ? 0 : 1,
        pointerEvents: properties?.isJoinNode ? "none" : "auto",
      },
    };

    const node: any = {
      id,
      position,
      data,
      type: "custom",
      style: {
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
        backgroundColor: properties?.backgroundColor || "#fff",
        opacity: properties?.isJoinNode ? 0 : 1,
        pointerEvents: properties?.isJoinNode ? "none" : "auto",
      },
      sourcePosition: "right",
      targetPosition: "left",
    };

    if (parentId) {
      node.parentNode = parentId;
      node.extent = "parent";
    }

    if (!nodeIds.has(id)) {
      nodes.push(node);
      nodeIds.add(id);
    }

    if (elkNode.children && elkNode.children.length > 0) {
      elkNode.children.forEach((child: any) => {
        traverseNodes(child, id);
      });
    }
  }

  traverseNodes(elkGraph);

  function traverseEdges(elkNode: any) {
    if (elkNode.edges && elkNode.edges.length > 0) {
      elkNode.edges.forEach((elkEdge: any) => {
        const sourceId = elkEdge.sources[0];
        const targetId = elkEdge.targets[0];
        if (nodeIds.has(sourceId) && nodeIds.has(targetId)) {
          if (!edges.find((e) => e.id === elkEdge.id)) {
            edges.push({
              id: elkEdge.id,
              source: sourceId,
              target: targetId,
              type: "custom",
              data: {
                label: elkEdge.labels?.[0]?.text || "",
              },
              style: elkEdge.style,
            });
          }
        }
      });
    }

    if (elkNode.children && elkNode.children.length > 0) {
      elkNode.children.forEach((child: any) => {
        traverseEdges(child);
      });
    }
  }

  traverseEdges(elkGraph);

  return { nodes, edges };
}
