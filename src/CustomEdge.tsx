// src/CustomEdge.tsx

import React from "react";
import { EdgeProps } from "reactflow";

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

  // ensure bendPoints are valid
  const validBendPoints = bendPoints.filter(
    (bp: any) => bp && typeof bp.x === "number" && typeof bp.y === "number"
  );

  // if no bendPoints, draw a straight line
  let path = "";
  if (validBendPoints.length === 0) {
    path = `M${sourceX},${sourceY} L${targetX},${targetY}`;
  } else {
    // draw a line with bendPoints
    const points = [
      { x: sourceX, y: sourceY },
      ...validBendPoints,
      { x: targetX, y: targetY },
    ];

    path = `M${points.map((p) => `${p.x},${p.y}`).join(" L")}`;
  }

  return (
    <>
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
      {validBendPoints.map((bp: { x: number; y: number }, index: number) => (
        <circle key={index} cx={bp.x} cy={bp.y} r={3} fill="blue" />
      ))}
    </>
  );
};

export default CustomEdge;
