'use client';

import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import type { NotificationServiceNodeProps } from '@system-vis/shared';

export function NotificationServiceNode({ data }: NodeProps) {
  const d = data as unknown as NotificationServiceNodeProps;
  return (
    <BaseNode
      data={d}
      color="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      }
    >
      <div className="flex justify-between text-xs">
        <span>{d.channels.length} channels</span>
        <span>{d.instances} instances</span>
      </div>
    </BaseNode>
  );
}
