'use client';

import { ReactFlowProvider, ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useArchitectureStore } from '@/stores/architecture-store';
import { nodeTypes } from '@/components/nodes/node-registry';
import { SimulationControlPanel } from '@/components/panels/simulation-control-panel';
import { BottleneckHighlighter } from '@/components/simulation/bottleneck-highlighter';

function SimulateCanvas() {
  const { nodes, edges } = useArchitectureStore();

  return (
    <div className="flex flex-col h-full">
      <SimulationControlPanel />
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges.map(e => ({ ...e, animated: true }))}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          fitView
          className="bg-background"
        >
          <Background gap={20} size={1} />
          <Controls />
        </ReactFlow>
        <BottleneckHighlighter />
      </div>
    </div>
  );
}

export default function SimulatePage() {
  return (
    <ReactFlowProvider>
      <SimulateCanvas />
    </ReactFlowProvider>
  );
}
