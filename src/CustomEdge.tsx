// src/CustomEdge.tsx

import React from "react";
import { EdgeProps } from "reactflow";

const CustomEdge = ({ data }: EdgeProps) => {
  const elkEdge = data.elkEdge;

  if (!elkEdge.sections || elkEdge.sections.length === 0) {
    return null;
  }

  const paths = elkEdge.sections.map((section: any, index: number) => {
    const points = [
      section.startPoint,
      ...(section.bendPoints || []),
      section.endPoint,
    ];

    const pathData = points
      .map((point: any, idx: number) => {
        const command = idx === 0 ? "M" : "L";
        return `${command} ${point.x} ${point.y}`;
      })
      .join(" ");

    return (
      <path
        key={index}
        d={pathData}
        fill="none"
        stroke="#222"
        strokeWidth={2}
        markerEnd="url(#react-flow__arrowclosed)"
      />
    );
  });

  return <>{paths}</>;
};

export default CustomEdge;
