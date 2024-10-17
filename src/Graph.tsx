import React, { useEffect, useState } from "react";
import ReactFlow, { ReactFlowProvider, Background } from "reactflow";
import ELK from "elkjs/lib/elk.bundled.js";
import "reactflow/dist/style.css";
import { jsonData } from "./data";
import CustomNode from "./CustomNode"; // 引入自定义节点组件

const elk = new ELK();

const nodeTypes = { custom: CustomNode }; // 注册自定义节点类型

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

// 修改 parseJsonData 函数
function parseJsonData(jsonData: any, expandedNodes: Set<string>): any {
  const nodeMap = new Map<string, any>();
  const elkNodes: any[] = [];
  const elkEdges: any[] = [];

  function processNodes(nodes: any[], parentId?: string): any[] {
    const resultNodes: any[] = [];

    nodes.forEach((node: any) => {
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
          isParent: false, // 默认不是父节点
        },
      };

      nodeMap.set(node.id, elkNode);

      // 检查是否有子节点
      if (node.children && node.children.length > 0) {
        elkNode.properties.isParent = true; // 标记为父节点

        // 如果节点已展开，处理子节点
        if (expandedNodes.has(node.id)) {
          const childNodes = processNodes(node.children, node.id);
          elkNode.children = childNodes;
        }
      }

      resultNodes.push(elkNode);
    });

    return resultNodes;
  }

  const topLevelNodes = processNodes(jsonData.nodes.children);
  elkNodes.push(...topLevelNodes);

  // 处理边
  jsonData.edges.forEach((edge: any) => {
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

// 修改 transformElkGraphToReactFlow 函数
function transformElkGraphToReactFlow(
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
        width,
        height,
      },
    };

    const node: any = {
      id,
      position,
      data,
      type: "custom", // 使用自定义节点类型
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
