// src/Graph.tsx

import React, { useEffect, useState, useRef } from "react";
import ReactFlow, { ReactFlowProvider, Background } from "reactflow";
import ELK from "elkjs/lib/elk.bundled.js";
import "reactflow/dist/style.css";
import { jsonData } from "./data1";
import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";

import { parseJsonData, transformElkGraphToReactFlow } from "./graphUtils";
import styled, { ThemeProvider } from "styled-components";
import { darkTheme } from "./theme";

// import { parseGraph } from "./parseGraph";

const elk = new ELK();

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

const ReactFlowStyled = styled(ReactFlow)`
  background-color: ${(props) => props.theme.bg};

  .react-flow__renderer {
    position: relative !important;
  }

  .react-flow__edges {
    position: absolute !important;
    z-index: 2 !important; /* Above nodes */
  }

  .react-flow__nodes {
    position: absolute !important;
    z-index: 1 !important; /* Below edges */
  }
`;

const Graph: React.FC = () => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

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
    // const simplifiedJsonData = parseGraph(jsonData);
    // console.log(JSON.stringify(simplifiedJsonData, null, 2));

    async function buildGraph() {
      const elkGraph = parseJsonData(jsonData, expandedNodes);

      try {
        const elkLayout = await elk.layout(elkGraph);
        const { nodes: transformedNodes, edges: transformedEdges } =
          transformElkGraphToReactFlow(elkLayout, onNodeDoubleClick);
        setNodes(transformedNodes);
        setEdges(transformedEdges);
      } catch (error) {
        console.error("ELK layout error:", error);
      }
    }

    buildGraph();
  }, [expandedNodes]);

  return (
    <ThemeProvider theme={darkTheme}>
      <ReactFlowProvider>
        <div style={{ width: "100%", height: "100vh", position: "relative" }}>
          <ReactFlowStyled
            nodes={nodes}
            edges={edges}
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
