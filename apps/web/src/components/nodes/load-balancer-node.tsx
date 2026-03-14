'use client';

import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import type { LoadBalancerNodeProps } from '@system-vis/shared';

export function LoadBalancerNode({ data }: NodeProps) {
  const d = data as unknown as LoadBalancerNodeProps;
  return (
    <BaseNode
      data={d}
      color="bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      }
    >
      <span>{d.algorithm.replace('_', ' ')}</span>
    </BaseNode>
  );
}
