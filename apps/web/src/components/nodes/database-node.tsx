'use client';

import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import type { DatabaseNodeProps } from '@system-vis/shared';

export function DatabaseNode({ data }: NodeProps) {
  const d = data as unknown as DatabaseNodeProps;
  return (
    <BaseNode
      data={d}
      color="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      }
    >
      <div className="flex justify-between">
        <span>{d.dbType}</span>
        <span>{d.maxConnections} conns</span>
      </div>
    </BaseNode>
  );
}
