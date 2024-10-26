// src/CustomEdge.tsx

import React from "react";
import { EdgeProps } from "reactflow";

const CustomEdge = ({ id, data, style = {} }: EdgeProps) => {
  const { points, label } = data;

  if (!points || points.length === 0) {
    return null;
  }

  // create path's data string
  let pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }

  return (
    <path
      id={id}
      style={{
        stroke: "#fff", // edge color
        strokeWidth: style.strokeWidth || 2,
        fill: "none",
        pointerEvents: "visibleStroke",
      }}
      d={pathData}
    />
  );
};

export default CustomEdge;
