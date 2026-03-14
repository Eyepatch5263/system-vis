'use client';

import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import type { WebSocketServerNodeProps } from '@system-vis/shared';

export function WebSocketServerNode({ data }: NodeProps) {
  const d = data as unknown as WebSocketServerNodeProps;
  return (
    <BaseNode
      data={d}
      color="bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      }
    >
      <div className="flex justify-between text-xs">
        <span>{d.instances} instances</span>
        <span>{d.maxConnections?.toLocaleString()} max</span>
      </div>
    </BaseNode>
  );
}
