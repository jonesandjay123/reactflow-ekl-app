import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

export interface CustomNodeData {
  label: string;
  status?: string;
  startTimestamp?: string;
  isDelayed?: boolean;
  isParent: boolean;
  onDoubleClick: (id: string) => void;
  style?: {
    backgroundColor?: string;
    borderRadius?: string;
    opacity?: number;
  };
}

export interface CustomNodeProps {
  id: string;
  data: CustomNodeData;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ id, data }) => {
  const { label, status, startTimestamp, isDelayed, isParent, onDoubleClick } =
    data;

  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick(id);
    }
  };

  const renderContent = () => {
    return (
      <div>
        some extra content...
        {status && <div>Status: {status}</div>}
        {startTimestamp && <div>Start Timestamp: {startTimestamp}</div>}
      </div>
    );
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      style={{
        padding: 10,
        backgroundColor: data.style?.backgroundColor || "#fff",
        border: "1px solid #000",
        textAlign: "center",
        borderRadius: data.style?.borderRadius || "0px",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        opacity: data.style?.opacity || 1, // Add opacity to hide the node
      }}
    >
      <span style={{ color: "black" }}>{label}</span>
      <Handle
        type="target"
        position={Position.Left}
        style={{ visibility: data.style?.opacity === 0 ? "hidden" : "visible" }}
      />
      {renderContent()}
      <Handle
        type="source"
        position={Position.Right}
        style={{ visibility: data.style?.opacity === 0 ? "hidden" : "visible" }}
      />
    </div>
  );
};

export default CustomNode;
