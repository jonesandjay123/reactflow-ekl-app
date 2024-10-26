import React from "react";
import { EdgeProps } from "reactflow";

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  data,
  markerEnd,
}: EdgeProps) => {
  let { points, _label } = data;

  if (!points || points.length === 0) {
    // if no points are provided, calculate a straight line
    points = [
      { x: sourceX, y: sourceY },
      { x: targetX, y: targetY },
    ];
  }

  // construct the path data
  let pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }

  return (
    <>
      <path
        id={id}
        style={{
          stroke: "#fff", // default color
          strokeWidth: style.strokeWidth || 2,
          fill: "none",
          pointerEvents: "visibleStroke",
        }}
        d={pathData}
        markerEnd={markerEnd}
      />
    </>
  );
};

export default CustomEdge;
