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
    data: { bendPoints = [] },
  } = props;

  // Check if there are valid bendPoints
  const validBendPoints = bendPoints.filter(
    (bp: any) => bp && typeof bp.x === "number" && typeof bp.y === "number"
  );

  let path = "";
  if (validBendPoints.length === 0) {
    // If no bendPoints, use Bezier curve
    const [edgePath] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });
    path = edgePath;
  } else {
    // If there are bendPoints, use polyline
    const points = [
      { x: sourceX, y: sourceY },
      ...validBendPoints,
      { x: targetX, y: targetY },
    ];
    path = `M${points.map((p) => `${p.x},${p.y}`).join(" L")}`;
  }

  return (
    <path
      id={id}
      style={{
        stroke: style.stroke || "red",
        strokeWidth: style.strokeWidth || 2,
        pointerEvents: "visiblePainted",
      }}
      className="react-flow__edge-path"
      d={path}
      markerEnd={markerEnd}
    />
  );
};

export default CustomEdge;
