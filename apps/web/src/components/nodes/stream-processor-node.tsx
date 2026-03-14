'use client';

import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import type { StreamProcessorNodeProps } from '@system-vis/shared';

export function StreamProcessorNode({ data }: NodeProps) {
  const d = data as unknown as StreamProcessorNodeProps;
  return (
    <BaseNode
      data={d}
      color="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6" />
        </svg>
      }
    >
      <div className="flex justify-between text-xs">
        <span>{d.processorType}</span>
        <span>{d.instances} instances</span>
      </div>
    </BaseNode>
  );
}
