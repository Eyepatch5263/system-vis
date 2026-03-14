'use client';

import { useSimulationStore } from '@/stores/simulation-store';
import { useArchitectureStore } from '@/stores/architecture-store';
import { cn } from '@/lib/utils';

export function BottleneckHighlighter() {
  const { bottlenecks, status } = useSimulationStore();
  const { nodes } = useArchitectureStore();

  if (status !== 'running' || bottlenecks.length === 0) return null;

  return (
    <div className="absolute top-14 right-4 z-10 space-y-2 max-w-xs">
      {bottlenecks.map((b) => {
        const node = nodes.find((n) => n.id === b.nodeId);
        return (
          <div
            key={`${b.nodeId}-${b.metric}`}
            className={cn(
              'rounded-lg border px-3 py-2 text-xs shadow-lg',
              b.severity === 'critical'
                ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
            )}
          >
            <div className="font-medium">
              {b.severity === 'critical' ? '🔴' : '🟡'} {node?.data?.label ?? b.nodeId}
            </div>
            <div className="mt-0.5">{b.reason}</div>
          </div>
        );
      })}
    </div>
  );
}
