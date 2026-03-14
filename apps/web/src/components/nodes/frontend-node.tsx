'use client';

import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import type { ServiceNodeProps } from '@system-vis/shared';

export function FrontendNode({ data }: NodeProps) {
  const d = data as unknown as ServiceNodeProps;
  return (
    <BaseNode
      data={d}
      color="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      }
    >
      <span>{d.instances} instance{d.instances > 1 ? 's' : ''}</span>
    </BaseNode>
  );
}
