// src/Graph.tsx

import React, { useEffect, useState } from "react";
import ReactFlow, { ReactFlowProvider, Background } from "reactflow";
import ELK from "elkjs/lib/elk.bundled.js";
import "reactflow/dist/style.css";
import { jsonData } from "./data";

const elk = new ELK();

const Graph: React.FC = () => {
  const [elements, setElements] = useState<{ nodes: any[]; edges: any[] }>({
    nodes: [],
    edges: [],
  });

  useEffect(() => {
    async function buildGraph() {
      // 解析 JSON 数据并构建 ELK 图形结构
      const elkGraph = parseJsonData(jsonData);

      // 使用 ELK 计算布局
      try {
        const elkLayout = await elk.layout(elkGraph);

        // 将 ELK 布局结果转换为 React Flow 的节点和边
        const { nodes, edges } = transformElkGraphToReactFlow(elkLayout);

        setElements({ nodes, edges });
      } catch (error) {
        console.error("ELK layout error:", error);
      }
    }

    buildGraph();
  }, []);

  return (
    <ReactFlowProvider>
      <div style={{ width: "100%", height: "100vh" }}>
        <ReactFlow nodes={elements.nodes} edges={elements.edges} fitView>
          <Background />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default Graph;

// 解析 JSON 数据并构建 ELK 图形结构的函数
function parseJsonData(jsonData: any): any {
  const nodeMap = new Map<string, any>(); // 用于存储节点，便于查找
  const elkNodes: any[] = [];
  const elkEdges: any[] = [];

  function processNodes(nodes: any[], parentId?: string): any[] {
    const resultNodes: any[] = [];

    nodes.forEach((node: any) => {
      // 如果节点的 ID 为 null，则跳过或为其生成唯一 ID
      if (!node.id) {
        console.warn("Node with null or undefined id found and skipped:", node);
        return;
      }

      const styleMatch = node.value.style
        ? node.value.style.match(/fill:(#[0-9a-fA-F]{3,6})/)
        : null;
      const backgroundColor = styleMatch ? styleMatch[1] : "#fff";

      const elkNode: any = {
        id: node.id,
        width: 100,
        height: 50,
        labels: [{ text: node.value.label || "" }],
        properties: {
          backgroundColor: backgroundColor,
          borderRadius: node.value.rx ? `${node.value.rx}px` : "0px",
        },
        children: [], // 初始化 children 数组
      };

      // 将节点存储在 Map 中
      nodeMap.set(node.id, elkNode);

      // 如果有子节点，递归处理
      if (node.children && node.children.length > 0) {
        const childNodes = processNodes(node.children, node.id);
        elkNode.children = childNodes;
      }

      resultNodes.push(elkNode);
    });

    return resultNodes;
  }

  // 开始处理节点
  const topLevelNodes = processNodes(jsonData.nodes.children);
  elkNodes.push(...topLevelNodes);

  // 处理边
  jsonData.edges.forEach((edge: any) => {
    // 验证 source_id 和 target_id 是否存在
    if (nodeMap.has(edge.source_id) && nodeMap.has(edge.target_id)) {
      elkEdges.push({
        id: `${edge.source_id}-${edge.target_id}`,
        sources: [edge.source_id],
        targets: [edge.target_id],
      });
    } else {
      console.warn(
        `Edge references missing node(s): ${edge.source_id} -> ${edge.target_id}`
      );
    }
  });

  const elkGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": jsonData.arrange === "LR" ? "RIGHT" : "DOWN",
    },
    children: elkNodes,
    edges: elkEdges,
  };

  return elkGraph;
}

// 将 ELK 布局结果转换为 React Flow 格式的函数
function transformElkGraphToReactFlow(elkGraph: any) {
  const nodes: any[] = [];
  const edges: any[] = [];

  function traverseElkNode(elkNode: any, parentId?: string) {
    const { id, x, y, width, height, labels, properties } = elkNode;
    const position = { x: x || 0, y: y || 0 };
    const data = { label: labels && labels[0] ? labels[0].text : "" };
    const style = {
      width,
      height,
      backgroundColor: properties?.backgroundColor || "#fff",
      borderRadius: properties?.borderRadius || "0px",
    };

    const node: any = {
      id,
      position,
      data,
      style,
      type: "default",
    };

    if (parentId) {
      node.parentNode = parentId;
      node.extent = "parent";
    }

    nodes.push(node);

    if (elkNode.children && elkNode.children.length > 0) {
      elkNode.children.forEach((child: any) => {
        traverseElkNode(child, id);
      });
    }
  }

  if (elkGraph.children) {
    elkGraph.children.forEach((elkNode: any) => {
      traverseElkNode(elkNode);
    });
  }

  // 处理边
  if (elkGraph.edges) {
    elkGraph.edges.forEach((elkEdge: any) => {
      edges.push({
        id: elkEdge.id,
        source: elkEdge.sources[0],
        target: elkEdge.targets[0],
        type: "default",
      });
    });
  }

  return { nodes, edges };
}
