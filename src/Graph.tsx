// src/Graph.tsx

import React, { useEffect, useState } from "react";
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
`;

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
  }, [expandedNodes]);

  return (
    <ThemeProvider theme={darkTheme}>
      <ReactFlowProvider>
        <div style={{ width: "100%", height: "100vh" }}>
          <ReactFlowStyled
            nodes={elements.nodes}
            edges={elements.edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          >
            <Background />
          </ReactFlowStyled>
        </div>
      </ReactFlowProvider>
    </ThemeProvider>
  );
};

export default Graph;
