'use client';

import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import type { PaymentGatewayNodeProps } from '@system-vis/shared';

export function PaymentGatewayNode({ data }: NodeProps) {
  const d = data as unknown as PaymentGatewayNodeProps;
  return (
    <BaseNode
      data={d}
      color="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      }
    >
      <div className="flex justify-between text-xs">
        <span>{d.provider}</span>
        <span>99.9% uptime</span>
      </div>
    </BaseNode>
  );
}
