import { Background, ReactFlow } from "@xyflow/react";

export default function Canvas({ nodes, edges, nodeTypes, onNodeClick, onNodesChange }) {
  return (
    <div className="canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onNodesChange={onNodesChange}
        fitView
      >
        <Background color="#2f3342" gap={24} />
      </ReactFlow>
    </div>
  );
}
