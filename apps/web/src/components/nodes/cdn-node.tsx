'use client';

import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './base-node';
import type { CDNNodeProps } from '@system-vis/shared';

export function CDNNode({ data }: NodeProps) {
  const d = data as unknown as CDNNodeProps;
  return (
    <BaseNode
      data={d}
      color="bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300"
      icon={
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
    >
      <div className="flex justify-between">
        <span>Hit Rate: {(d.cacheHitRate * 100).toFixed(0)}%</span>
        <span>{d.maxRPS.toLocaleString()} RPS</span>
      </div>
    </BaseNode>
  );
}
