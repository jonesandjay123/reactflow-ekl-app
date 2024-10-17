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

  function processNodes(
    nodes: JsonNode[],
    parentId?: string
  ): { nodes: ElkNode[]; edges: ElkExtendedEdge[] } {
    const resultNodes: ElkNode[] = [];
    const resultEdges: ElkExtendedEdge[] = [];

    nodes.forEach((node: JsonNode) => {
      if (!node.id) {
        console.warn("Node with null or undefined id found and skipped:", node);
        return;
      }

      const styleMatch = node.value.style
        ? node.value.style.match(/fill:(#[0-9a-fA-F]{3,6})/)
        : null;
      const backgroundColor = styleMatch ? styleMatch[1] : "#fff";

      const elkNode: ElkNode = {
        id: node.id,
        width: 100,
        height: 50,
        labels: [{ text: node.value.label || "" }],
        properties: {
          backgroundColor: backgroundColor,
          borderRadius: node.value.rx ? `${node.value.rx}px` : "0px",
          isParent: false, // 默认不是父节点
        },
      };

      nodeMap.set(node.id, elkNode);

      // 检查是否有子节点
      if (node.children && node.children.length > 0) {
        elkNode.properties.isParent = true;

        if (expandedNodes.has(node.id)) {
          const childResult = processNodes(node.children, node.id);
          elkNode.children = childResult.nodes;
          // 子节点的边需要添加到当前节点的边中
          elkNode.edges = childResult.edges;
        }
      }

      resultNodes.push(elkNode);
    });

    // 收集当前层次结构中涉及的边
    const edgesAtThisLevel = jsonData.edges
      .filter((edge: JsonEdge) => {
        return (
          nodeMap.has(edge.source_id) &&
          nodeMap.has(edge.target_id) &&
          (nodeMap.get(edge.source_id)?.id === parentId ||
            nodeMap.get(edge.target_id)?.id === parentId)
        );
      })
      .map((edge: JsonEdge) => ({
        id: `${edge.source_id}-${edge.target_id}`,
        sources: [edge.source_id],
        targets: [edge.target_id],
      }));

    // 将当前层次的边添加到结果中
    resultEdges.push(...edgesAtThisLevel);

    return { nodes: resultNodes, edges: resultEdges };
  }

  const result = processNodes(jsonData.nodes.children);

  const elkGraph: ElkGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": jsonData.arrange === "LR" ? "RIGHT" : "DOWN",
      "elk.layered.hierarchyHandling": "INCLUDE_CHILDREN",
      "elk.spacing.nodeNode": "50",
      "elk.layered.spacing.nodeNodeBetweenLayers": "50",
    },
    children: result.nodes,
    edges: result.edges,
  };

  return elkGraph;
}

export function transformElkGraphToReactFlow(
  elkGraph: any,
  onNodeDoubleClick: (nodeId: string) => void
) {
  const nodes: any[] = [];
  const edges: any[] = [];

  function traverseElkNode(elkNode: any, parentId?: string) {
    const { id, x, y, width, height, labels, properties } = elkNode;
    const position = { x: x || 0, y: y || 0 };
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
      type: "custom", // 使用自定义节点类型
      style: {
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      },
      sourcePosition: "right", // 设置源位置为右侧
      targetPosition: "left", // 设置目标位置为左侧
    };

    if (parentId) {
      node.parentNode = parentId;
      node.extent = "parent";
    }

    nodes.push(node);

    // 处理节点的边
    if (elkNode.edges) {
      elkNode.edges.forEach((elkEdge: any) => {
        edges.push({
          id: elkEdge.id,
          source: elkEdge.sources[0],
          target: elkEdge.targets[0],
          type: "smoothstep",
        });
      });
    }

    // 递归遍历子节点
    if (elkNode.children && elkNode.children.length > 0) {
      elkNode.children.forEach((child: any) => {
        traverseElkNode(child, id);
      });
    }
  }

  // 开始遍历 ELK 图
  traverseElkNode(elkGraph);

  return { nodes, edges };
}
