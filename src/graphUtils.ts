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
  const nodeParentMap = new Map<string, string | undefined>();

  // 用于生成唯一的边 ID
  let edgeIdCounter = 0;

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
          isParent: false,
          isExpanded: expandedNodes.has(node.id),
        },
      };

      nodeMap.set(node.id, elkNode);
      nodeParentMap.set(node.id, parentId); // 保存节点的父节点

      // 检查是否有子节点
      if (node.children && node.children.length > 0) {
        elkNode.properties.isParent = true;

        if (expandedNodes.has(node.id)) {
          const childResult = processNodes(node.children, node.id);
          elkNode.children = childResult.nodes;
          elkNode.edges = childResult.edges;
        }
      }

      resultNodes.push(elkNode);
    });

    // 收集当前层次结构中涉及的边
    jsonData.edges.forEach((edge: JsonEdge) => {
      const sourceNode = nodeMap.get(edge.source_id);
      const targetNode = nodeMap.get(edge.target_id);

      if (sourceNode && targetNode) {
        // 边的源和目标节点都在当前层级，直接添加
        resultEdges.push({
          id: `edge-${edgeIdCounter++}`, // 使用计数器生成唯一的边 ID
          sources: [edge.source_id],
          targets: [edge.target_id],
        });
      } else if (sourceNode || targetNode) {
        // 边的源或目标节点缺失，尝试调整到父节点
        let adjustedSource = edge.source_id;
        let adjustedTarget = edge.target_id;

        if (!sourceNode) {
          const parentSourceId = nodeParentMap.get(edge.source_id);
          if (parentSourceId) {
            adjustedSource = parentSourceId;
          } else {
            // 无法找到有效的源节点，跳过该边
            return;
          }
        }

        if (!targetNode) {
          const parentTargetId = nodeParentMap.get(edge.target_id);
          if (parentTargetId) {
            adjustedTarget = parentTargetId;
          } else {
            // 无法找到有效的目标节点，跳过该边
            return;
          }
        }

        resultEdges.push({
          id: `edge-${edgeIdCounter++}`, // 使用计数器生成唯一的边 ID
          sources: [adjustedSource],
          targets: [adjustedTarget],
        });
      }
      // 如果源和目标节点都缺失，跳过该边
    });

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

  function traverseElkNode(
    elkNode: any,
    parentPosition = { x: 0, y: 0 },
    parentId?: string
  ) {
    // 忽略根节点
    if (elkNode.id === "root") {
      // 递归遍历子节点
      if (elkNode.children && elkNode.children.length > 0) {
        elkNode.children.forEach((child: any) => {
          traverseElkNode(child, parentPosition, undefined);
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

    // 处理节点的边
    if (elkNode.edges) {
      elkNode.edges.forEach((elkEdge: any) => {
        // 调整边的控制点位置
        const sections = elkEdge.sections || [];
        sections.forEach((section: any) => {
          if (section.startPoint) {
            section.startPoint.x += parentPosition.x;
            section.startPoint.y += parentPosition.y;
          }
          if (section.endPoint) {
            section.endPoint.x += parentPosition.x;
            section.endPoint.y += parentPosition.y;
          }
          if (section.bendPoints) {
            section.bendPoints = section.bendPoints.map((point: any) => ({
              x: point.x + parentPosition.x,
              y: point.y + parentPosition.y,
            }));
          }
        });

        edges.push({
          id: elkEdge.id,
          source: elkEdge.sources[0],
          target: elkEdge.targets[0],
          type: "default", // 使用 React Flow 默认的边类型
        });
      });
    }

    // 递归遍历子节点
    if (elkNode.children && elkNode.children.length > 0) {
      elkNode.children.forEach((child: any) => {
        traverseElkNode(child, position, id);
      });
    }
  }

  // 开始遍历 ELK 图
  traverseElkNode(elkGraph);

  return { nodes, edges };
}
