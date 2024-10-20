// src/CustomEdge.tsx

import React from "react";
import { EdgeProps, getBezierPath } from "reactflow";

const CustomEdge = (props: EdgeProps) => {
  console.log("Rendering edge:", props.id, props.source, props.target);
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
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <path
      id={id}
      style={{
        stroke: style.stroke || "red",
        strokeWidth: style.strokeWidth || 2,
        pointerEvents: "visiblePainted",
      }}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
};

export default CustomEdge;
