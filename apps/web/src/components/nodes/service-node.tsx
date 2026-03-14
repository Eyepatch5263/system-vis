'use client';

import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import type { ServiceNodeProps } from '@system-vis/shared';

export function ServiceNode({ data }: NodeProps) {
  const d = data as unknown as ServiceNodeProps;
  return (
    <BaseNode
      data={d}
      color="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
        </svg>
      }
    >
      <div className="flex justify-between">
        <span>{d.instances} instance{d.instances > 1 ? 's' : ''}</span>
        {d.autoScale && <span>Auto-scale</span>}
      </div>
    </BaseNode>
  );
}
