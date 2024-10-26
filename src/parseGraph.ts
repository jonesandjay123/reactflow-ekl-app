// parseGraph.ts

export interface JsonNode {
  id: string | null;
  value: any;
  children?: JsonNode[];
}

export interface JsonEdge {
  source_id: string;
  target_id: string;
}

export interface JsonData {
  arrange: string;
  edges: JsonEdge[];
  nodes: {
    children: JsonNode[];
  };
}

export interface SimplifiedJsonData {
  arrange: string;
  edges: JsonEdge[];
  nodes: {
    children: JsonNode[];
  };
}

export function parseGraph(jsonData: JsonData): SimplifiedJsonData {
  // 提取最外层节点的 ID
  const topLevelNodeIds = new Set<string>();

  jsonData.nodes.children.forEach((node) => {
    if (node.id !== null && node.id !== undefined) {
      topLevelNodeIds.add(node.id);
    }
  });

  // 提取与最外层节点相关的边
  const simplifiedEdges: JsonEdge[] = [];
  const edgeSet = new Set<string>(); // 用于去除重复的边

  jsonData.edges.forEach((edge) => {
    const sourceTopNodeId = getTopLevelNodeId(edge.source_id, topLevelNodeIds);
    const targetTopNodeId = getTopLevelNodeId(edge.target_id, topLevelNodeIds);

    if (
      sourceTopNodeId &&
      targetTopNodeId &&
      sourceTopNodeId !== targetTopNodeId
    ) {
      const edgeKey = `${sourceTopNodeId}->${targetTopNodeId}`;
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        simplifiedEdges.push({
          source_id: sourceTopNodeId,
          target_id: targetTopNodeId,
        });
      }
    }
  });

  // 构建简化后的节点列表
  const simplifiedNodes: JsonNode[] = jsonData.nodes.children
    .filter((node) => node.id !== null && node.id !== undefined)
    .map((node) => ({
      id: node.id,
      value: node.value,
    }));

  const simplifiedJsonData: SimplifiedJsonData = {
    arrange: jsonData.arrange,
    edges: simplifiedEdges,
    nodes: {
      children: simplifiedNodes,
    },
  };

  return simplifiedJsonData;
}

function getTopLevelNodeId(
  nodeId: string,
  topLevelNodeIds: Set<string>
): string | null {
  // 如果节点 ID 本身就是顶层节点，直接返回
  if (topLevelNodeIds.has(nodeId)) {
    return nodeId;
  }

  // 如果节点 ID 包含 '.'，尝试提取顶层节点 ID
  if (nodeId.includes(".")) {
    const topNodeId = nodeId.split(".")[0];
    if (topLevelNodeIds.has(topNodeId)) {
      return topNodeId;
    }
  }

  // 否则，返回 null，表示不是顶层节点
  return null;
}
