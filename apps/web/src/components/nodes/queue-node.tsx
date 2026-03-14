'use client';

import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import type { QueueNodeProps } from '@system-vis/shared';

export function QueueNode({ data }: NodeProps) {
  const d = data as unknown as QueueNodeProps;
  return (
    <BaseNode
      data={d}
      color="bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      }
    >
      <div className="flex justify-between">
        <span>{d.queueType}</span>
        <span>{d.consumerCount} consumers</span>
      </div>
    </BaseNode>
  );
}
