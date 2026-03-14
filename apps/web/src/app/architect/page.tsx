'use client';

import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useArchitectureStore } from '@/stores/architecture-store';
import { ComponentPalette } from '@/components/canvas/component-palette';
import { NodeConfigPanel } from '@/components/panels/node-config-panel';
import { CanvasToolbar } from '@/components/canvas/canvas-toolbar';
import { AIAdvisorPanel } from '@/components/ai/ai-advisor-panel';
import { nodeTypes } from '@/components/nodes/node-registry';
import { ArchNodeType, type ArchNodeData } from '@system-vis/shared';
import { NODE_DEFAULTS, NODE_LABELS } from '@system-vis/shared';

function ArchitectCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addEdge,
    addNode,
    setSelectedNodeId,
    selectedNodeId,
  } = useArchitectureStore();

  const onConnect = useCallback(
    (connection: Connection) => {
      addEdge(connection);
    },
    [addEdge]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('application/reactflow') as ArchNodeType;
      if (!nodeType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const defaults = NODE_DEFAULTS[nodeType];
      addNode({
        type: nodeType,
        position,
        data: {
          ...defaults,
          label: NODE_LABELS[nodeType],
          healthStatus: 'healthy',
        } as ArchNodeData,
      });
    },
    [screenToFlowPosition, addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div className="flex h-full">
      <ComponentPalette />
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <CanvasToolbar />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Background gap={20} size={1} />
          <Controls />
          <MiniMap
            nodeStrokeWidth={3}
            className="!bg-card !border-border"
          />
        </ReactFlow>
        <AIAdvisorPanel />
      </div>
      {selectedNodeId && <NodeConfigPanel />}
    </div>
  );
}

export default function ArchitectPage() {
  return (
    <ReactFlowProvider>
      <ArchitectCanvas />
    </ReactFlowProvider>
  );
}
