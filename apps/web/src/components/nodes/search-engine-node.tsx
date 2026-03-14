'use client';

import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import type { SearchEngineNodeProps } from '@system-vis/shared';

export function SearchEngineNode({ data }: NodeProps) {
  const d = data as unknown as SearchEngineNodeProps;
  return (
    <BaseNode
      data={d}
      color="bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
    >
      <div className="flex justify-between text-xs">
        <span>{d.shardCount} shards</span>
        <span>{d.replicaCount} replicas</span>
      </div>
    </BaseNode>
  );
}
