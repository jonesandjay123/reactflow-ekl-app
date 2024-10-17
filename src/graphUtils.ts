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
}

export interface ElkNode {
  id: string;
  width: number;
  height: number;
  labels: { text: string }[];
  properties: any;
  children?: ElkNode[];
  edges?: ElkExtendedEdge[];
}

export interface ElkGraph {
  id: string;
  layoutOptions: any;
  children: ElkNode[];
  edges: ElkExtendedEdge[];
}

export function parseJsonData(
  jsonData: any,
  expandedNodes: Set<string>
): ElkGraph {
  const nodeMap = new Map<string, ElkNode>();
  const parentMap = new Map<string, string | null>();
  const includedNodeIds = new Set<string>();

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

      parentMap.set(node.id, parentId);

      const styleMatch = node.value.style
        ? node.value.style.match(/fill:(#[0-9a-fA-F]{3,6})/)
        : null;
      const backgroundColor = styleMatch ? styleMatch[1] : "#fff";

      const isExpanded = expandedNodes.has(node.id);

      const elkNode: ElkNode = {
        id: node.id,
        width: 100,
        height: 50,
        labels: [{ text: node.value.label || "" }],
        properties: {
          backgroundColor: backgroundColor,
          borderRadius: node.value.rx ? `${node.value.rx}px` : "0px",
          isParent: !!node.children && node.children.length > 0,
          isExpanded: isExpanded,
        },
      };

      nodeMap.set(node.id, elkNode);

      includedNodeIds.add(node.id);

      if (elkNode.properties.isParent && isExpanded) {
        // Node is expanded, process its children
        if (node.children && node.children.length > 0) {
          elkNode.children = processNodes(node.children, node.id);
        }
      }
      // If the node is collapsed, we don't process its children

      resultNodes.push(elkNode);
    });

    return resultNodes;
  }

  // Build parentMap and includedNodeIds
  const nodes = processNodes(jsonData.nodes.children);

  // Now process edges
  const resultEdges: ElkExtendedEdge[] = [];

  jsonData.edges.forEach((edge: JsonEdge) => {
    let sourceId = adjustNodeId(edge.source_id);
    let targetId = adjustNodeId(edge.target_id);

    if (!sourceId || !targetId) {
      // Cannot include this edge, as source or target node does not exist
      return;
    }

    if (sourceId === targetId) {
      // Avoid self-loop
      return;
    }

    resultEdges.push({
      id: `edge-${sourceId}-${targetId}`,
      sources: [sourceId],
      targets: [targetId],
    });
  });

  function adjustNodeId(nodeId: string): string | null {
    if (includedNodeIds.has(nodeId)) {
      return nodeId;
    }
    // Node is not included, find its nearest included ancestor
    let currentId = nodeId;
    while (currentId) {
      const parentId = parentMap.get(currentId);
      if (!parentId) {
        // Reached root and didn't find an included ancestor
        return null;
      }
      if (includedNodeIds.has(parentId)) {
        return parentId;
      }
      currentId = parentId;
    }
    return null;
  }

  const elkGraph: ElkGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": jsonData.arrange === "LR" ? "RIGHT" : "DOWN",
      "elk.layered.hierarchyHandling": "INCLUDE_CHILDREN",
      "elk.spacing.nodeNode": "50",
      "elk.layered.spacing.nodeNodeBetweenLayers": "50",
    },
    children: nodes,
    edges: resultEdges,
  };

  return elkGraph;
}

// 辅助函数，查找节点的可见父节点
function findVisibleParent(nodeId: string, nodes: JsonNode[]): string | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return null; // 该节点本身已在可见节点集合中，但被折叠了
    }
    if (node.children && node.children.length > 0) {
      if (node.children.some((child) => child.id === nodeId)) {
        return node.id; // 找到父节点
      }
      const parentId = findVisibleParent(nodeId, node.children);
      if (parentId) {
        return parentId;
      }
    }
  }
  return null;
}

export function transformElkGraphToReactFlow(
  elkGraph: any,
  onNodeDoubleClick: (nodeId: string) => void
) {
  const nodes: any[] = [];
  const edges: any[] = [];

  function traverseElkNode(
    elkNode: any,
    parentPosition = { x: 0, y: 0 },
    parentId?: string
  ) {
    // Ignore root node
    if (elkNode.id === "root") {
      // Recursively traverse child nodes
      if (elkNode.children && elkNode.children.length > 0) {
        elkNode.children.forEach((child: any) => {
          traverseElkNode(child, parentPosition, undefined);
        });
      }

      // Collect edges at root level
      if (elkNode.edges) {
        elkNode.edges.forEach((elkEdge: any) => {
          edges.push({
            id: elkEdge.id,
            source: elkEdge.sources[0],
            target: elkEdge.targets[0],
            type: "default",
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
      },
      sourcePosition: "right",
      targetPosition: "left",
    };

    if (parentId) {
      node.parentNode = parentId;
      node.extent = "parent";
    }

    nodes.push(node);

    // Recursively traverse child nodes
    if (elkNode.children && elkNode.children.length > 0) {
      elkNode.children.forEach((child: any) => {
        traverseElkNode(child, position, id);
      });
    }

    // Collect edges at this node level
    if (elkNode.edges) {
      elkNode.edges.forEach((elkEdge: any) => {
        edges.push({
          id: elkEdge.id,
          source: elkEdge.sources[0],
          target: elkEdge.targets[0],
          type: "default",
        });
      });
    }
  }

  // Start traversing from the root
  traverseElkNode(elkGraph);

  return { nodes, edges };
}
