// src/Graph.tsx

import React, { useEffect, useState } from "react";
import ReactFlow, { ReactFlowProvider, Background } from "reactflow";
import ELK from "elkjs/lib/elk.bundled.js";
import "reactflow/dist/style.css";
import { jsonData } from "./data"; // 或者 './data'
import CustomNode from "./CustomNode"; // 引入自定义节点组件

import { parseJsonData, transformElkGraphToReactFlow } from "./graphUtils"; // 导入函数

const elk = new ELK();

const nodeTypes = { custom: CustomNode };

const Graph: React.FC = () => {
  const [elements, setElements] = useState<{ nodes: any[]; edges: any[] }>({
    nodes: [],
    edges: [],
  });
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 双击事件处理函数
  const onNodeDoubleClick = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId); // 已展开，折叠节点
      } else {
        newSet.add(nodeId); // 未展开，展开节点
      }
      return newSet;
    });
  };

  useEffect(() => {
    async function buildGraph() {
      const elkGraph = parseJsonData(jsonData, expandedNodes);

      try {
        const elkLayout = await elk.layout(elkGraph);

        const { nodes, edges } = transformElkGraphToReactFlow(
          elkLayout,
          onNodeDoubleClick
        );

        setElements({ nodes, edges });
      } catch (error) {
        console.error("ELK layout error:", error);
      }
    }

    buildGraph();
  }, [expandedNodes]); // 当展开状态改变时，重新构建图形

  return (
    <ReactFlowProvider>
      <div style={{ width: "100%", height: "100vh" }}>
        <ReactFlow
          nodes={elements.nodes}
          edges={elements.edges}
          nodeTypes={nodeTypes} // 指定节点类型
          fitView
        >
          <Background />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default Graph;
