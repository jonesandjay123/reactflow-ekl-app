// src/graphUtils.ts

import ELK, { ElkExtendedEdge } from "elkjs/lib/elk.bundled.js";

export interface JsonNode {
  id: string;
  value: {
    label?: string;
    class?: string;
    style?: string;
    status?: string;
    startTimestamp?: string;
    isDelayed?: boolean;
    [key: string]: any; //allow for any other properties
  };
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
        // Skip nodes without an ID
        return;
      }

      const isOpen = expandedNodes.has(node.id);
      const childIds = node.children ? getNestedChildIds(node.children) : [];
      const isJoinNode = node.id.includes("join_id");
      const isGateNode =
        node.value.class === "or-gate" || node.value.class === "and-gate";

      // adjust node dimensions based on node type
      const labelText = node.value.label || "";
      const labelLength = getTextWidth(labelText, font);
      let width = Math.max(labelLength + 20, 200); // Minimum width of 200
      let height = 80;

      // Adjust node dimensions based on node type
      if (isJoinNode) {
        width = 10;
        height = 10;
      } else if (isGateNode) {
        width = 30;
        height = 30;
      }

      // Extract the background color from the node's style if available
      const styleMatch = node.value.style
        ? node.value.style.match(/fill:([^;]+)/)
        : null;
      const backgroundColor = styleMatch ? styleMatch[1] : "#fff";

      // Construct the node's label, adding an arrow if it has children
      let label = node.value.label || "";
      const hasChildren = node.children && node.children.length > 0;
      if (hasChildren) {
        label += isOpen ? " ▲" : " ▼";
      }

      // Extract additional properties from the node
      const { status, startTimestamp, isDelayed } = node.value;

      if (isOpen && hasChildren) {
        // Node is expanded; include its children and internal edges
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
            isJoinNode,
            status,
            startTimestamp,
            isDelayed,
          },
          width,
          height,
          children: node.children ? processNodes(node.children, node.id) : [],
          edges: filteredEdges
            .filter((e) => {
              return (
                childIds.includes(e.source_id) && childIds.includes(e.target_id)
              );
            })
            .map((e) => formatEdge(e, font)),
        };

        // Remove internal edges from the global edge list
        filteredEdges = filteredEdges.filter(
          (e) =>
            !(childIds.includes(e.source_id) && childIds.includes(e.target_id))
        );

        resultNodes.push(elkNode);
      } else {
        // Node is collapsed or has no children; adjust edges to point to this node
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
            isJoinNode,
            status,
            startTimestamp,
            isDelayed,
          },
          width,
          height,
        };

        resultNodes.push(elkNode);
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
      hierarchyHandling: "INCLUDE_CHILDREN",
      "elk.direction": jsonData.arrange === "LR" ? "RIGHT" : "DOWN",
      "spacing.edgeLabel": "10.0",
      "elk.core.options.EdgeLabelPlacement": "CENTER",
      algorithm: "layered",
      "layering.strategy": "INTERACTIVE",
      "crossingMinimization.semiInteractive": "true",
      "spacing.nodeNodeBetweenLayers": "40.0",
      "spacing.edgeNodeBetweenLayers": "10.0",
      "spacing.edgeEdgeBetweenLayers": "10.0",
      "spacing.edgeNode": "10.0",
      "spacing.edgeEdge": "10.0",
      "spacing.nodeNode": "20.0",
      "elk.edgeRouting": "ORTHOGONAL", // POLYLINE
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

  const nodeIds = new Set<string>();

  // using map to store the absolute position of each node
  const nodePositions = new Map<string, { x: number; y: number }>();

  function traverseNodes(elkNode: any, parentPosition = { x: 0, y: 0 }) {
    if (elkNode.id === "root") {
      if (elkGraph.children && elkGraph.children.length > 0) {
        elkGraph.children.forEach((child: any) => {
          traverseNodes(child, parentPosition);
        });
      }
      return;
    }

    const { id, x, y, width, height, labels, properties } = elkNode;

    // calculate the absolute position of the node
    const absolutePosition = {
      x: (x || 0) + parentPosition.x,
      y: (y || 0) + parentPosition.y,
    };

    const { status, startTimestamp, isDelayed } = properties || {};

    const data = {
      label: labels && labels[0] ? labels[0].text : "",
      isParent: properties?.isParent || false,
      onDoubleClick: onNodeDoubleClick,
      status,
      startTimestamp,
      isDelayed,
      style: {
        backgroundColor: properties?.backgroundColor || "#fff",
        borderRadius: properties?.borderRadius || "0px",
        opacity: properties?.isJoinNode ? 0 : 1,
        pointerEvents: properties?.isJoinNode ? "none" : "auto",
      },
    };

    const node: any = {
      id,
      position: absolutePosition, // use the absolute position
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

    if (!nodeIds.has(id)) {
      nodes.push(node);
      nodeIds.add(id);
      nodePositions.set(id, absolutePosition); // save the absolute position
    }

    if (elkNode.children && elkNode.children.length > 0) {
      elkNode.children.forEach((child: any) => {
        traverseNodes(child, absolutePosition); // pass the absolute position
      });
    }
  }

  traverseNodes(elkGraph);

  function traverseEdges(elkNode: any) {
    // get the absolute position of the node
    const elkNodePosition = nodePositions.get(elkNode.id) || { x: 0, y: 0 };

    if (elkNode.edges && elkNode.edges.length > 0) {
      elkNode.edges.forEach((elkEdge: any) => {
        const sourceId = elkEdge.sources[0];
        const targetId = elkEdge.targets[0];
        if (nodeIds.has(sourceId) && nodeIds.has(targetId)) {
          if (!edges.find((e) => e.id === elkEdge.id)) {
            // adjust the edge points based on the node's absolute position
            const sections = elkEdge.sections || [];
            let points: { x: number; y: number }[] = [];
            sections.forEach((section: any) => {
              const adjustPoint = (point: { x: number; y: number }) => ({
                x: point.x + elkNodePosition.x,
                y: point.y + elkNodePosition.y,
              });

              points.push(adjustPoint(section.startPoint));
              if (section.bendPoints) {
                points = points.concat(section.bendPoints.map(adjustPoint));
              }
              points.push(adjustPoint(section.endPoint));
            });

            edges.push({
              id: elkEdge.id,
              source: sourceId,
              target: targetId,
              type: "custom",
              data: {
                label: elkEdge.labels?.[0]?.text || "",
                points, // the adjusted points
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
