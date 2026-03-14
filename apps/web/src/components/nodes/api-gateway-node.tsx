'use client';

import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import type { APIGatewayNodeProps } from '@system-vis/shared';

export function APIGatewayNode({ data }: NodeProps) {
  const d = data as unknown as APIGatewayNodeProps;
  return (
    <BaseNode
      data={d}
      color="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      }
    >
      <span>Rate limit: {d.rateLimitRPS.toLocaleString()} RPS</span>
    </BaseNode>
  );
}
