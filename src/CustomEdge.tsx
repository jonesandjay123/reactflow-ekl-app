// src/CustomEdge.tsx

import React from "react";
import { EdgeProps, getBezierPath } from "reactflow";

const CustomEdge = (props: EdgeProps) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
  } = props;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <path
      id={id}
      style={{
        stroke: style.stroke || "red",
        strokeWidth: style.strokeWidth || 2,
        pointerEvents: "visiblePainted",
        ...style,
      }}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
};

export default CustomEdge;
