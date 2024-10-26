import React from "react";
import { EdgeProps } from "reactflow";

const CustomEdge = ({ id, data, style = {}, markerEnd }: EdgeProps) => {
  const { points, label } = data;

  if (!points || points.length === 0) {
    return null;
  }

  // 構建路徑字符串
  let pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }

  return (
    <>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="5"
          markerHeight="3.5"
          refX="4"
          refY="1.75"
          orient="auto"
        >
          <polygon points="0 0, 5 1.75, 0 3.5" fill="#fff" />
        </marker>
      </defs>
      <path
        id={id}
        style={{
          stroke: "#fff", // 邊的顏色設為白色
          strokeWidth: style.strokeWidth || 2,
          fill: "none",
          pointerEvents: "visibleStroke",
        }}
        d={pathData}
        markerEnd="url(#arrowhead)" // 添加箭頭
      />
    </>
  );
};

export default CustomEdge;
