// src/Graph.tsx

import React, { useEffect, useState, useRef } from "react";
import ReactFlow, { ReactFlowProvider, Background } from "reactflow";
import ELK from "elkjs/lib/elk.bundled.js";
import "reactflow/dist/style.css";
import { jsonData } from "./data";
import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";

import { parseJsonData, transformElkGraphToReactFlow } from "./graphUtils";
import styled, { ThemeProvider } from "styled-components";
import { darkTheme } from "./theme";

const elk = new ELK();

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

const ReactFlowStyled = styled(ReactFlow)`
  background-color: ${(props) => props.theme.bg};
  /* 移除 z-index 設置 */
`;

const Graph: React.FC = () => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 使用 ref 來控制 ReactFlow instance
  const reactFlowInstance = useRef<any>(null);

  // 双击事件处理函数
  const onNodeDoubleClick = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    async function buildGraph() {
      const elkGraph = parseJsonData(jsonData, expandedNodes);

      try {
        const elkLayout = await elk.layout(elkGraph);
        console.log("ELK layout result:", elkLayout);
        const { nodes: transformedNodes, edges: transformedEdges } =
          transformElkGraphToReactFlow(elkLayout, onNodeDoubleClick);
        console.log("Transformed nodes:", transformedNodes);
        console.log("Transformed edges:", transformedEdges);
        setNodes(transformedNodes);
        setEdges(transformedEdges);
      } catch (error) {
        console.error("ELK layout error:", error);
      }
    }

    buildGraph();
  }, [expandedNodes]);

  const onLoad = (rfi: any) => {
    reactFlowInstance.current = rfi;
    rfi.fitView();
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <ReactFlowProvider>
        <div style={{ width: "100%", height: "100vh" }}>
          <ReactFlowStyled
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            onLoad={onLoad}
          >
            <Background />
          </ReactFlowStyled>
        </div>
      </ReactFlowProvider>
    </ThemeProvider>
  );
};

export default Graph;
