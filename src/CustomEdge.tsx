// src/CustomEdge.tsx

import React from "react";
import { EdgeProps, getBezierPath } from "reactflow";

const CustomEdge: React.FC<EdgeProps> = (props) => {
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
        stroke: "gray",
        strokeWidth: 2,
        ...style,
      }}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
};

export default CustomEdge;
