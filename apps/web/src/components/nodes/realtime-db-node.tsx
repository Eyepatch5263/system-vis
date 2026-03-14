'use client';

import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import type { RealTimeDBNodeProps } from '@system-vis/shared';

export function RealTimeDBNode({ data }: NodeProps) {
  const d = data as unknown as RealTimeDBNodeProps;
  return (
    <BaseNode
      data={d}
      color="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      }
    >
      <div className="flex justify-between text-xs">
        <span>{d.dbType}</span>
        <span>{d.maxConnections?.toLocaleString()} max</span>
      </div>
    </BaseNode>
  );
}
