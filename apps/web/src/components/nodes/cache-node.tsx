'use client';

import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import type { CacheNodeProps } from '@system-vis/shared';

export function CacheNode({ data }: NodeProps) {
  const d = data as unknown as CacheNodeProps;
  return (
    <BaseNode
      data={d}
      color="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      }
    >
      <div className="flex justify-between">
        <span>{d.cacheType}</span>
        <span>Hit: {(d.hitRate * 100).toFixed(0)}%</span>
      </div>
    </BaseNode>
  );
}
