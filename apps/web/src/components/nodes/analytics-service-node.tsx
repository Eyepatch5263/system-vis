'use client';

import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import type { AnalyticsServiceNodeProps } from '@system-vis/shared';

export function AnalyticsServiceNode({ data }: NodeProps) {
  const d = data as unknown as AnalyticsServiceNodeProps;
  return (
    <BaseNode
      data={d}
      color="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      }
    >
      <div className="flex justify-between text-xs">
        <span>{d.dataWarehouse}</span>
        <span>{d.instances} instances</span>
      </div>
    </BaseNode>
  );
}
