'use client';

import { useState } from 'react';
import { useSimulationStore } from '@/stores/simulation-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { DataFlowTooltip } from './data-flow-tooltip';

export function MetricsDashboard() {
  const { status, globalMetrics, componentMetrics, metricsHistory, bottlenecks, currentTimeSec, nodeLabels } = useSimulationStore();
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  if (status === 'idle' && metricsHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-4">−</div>
          <h2 className="text-lg font-semibold">No Simulation Data</h2>
          <p className="text-sm mt-1">Go to the Simulate tab and run a simulation to see metrics here.</p>
        </div>
      </div>
    );
  }

  // Health score calculation
  const getHealthScore = (metrics: any) => {
    const cpu = Math.min(metrics.cpuUtilization / 100, 1);
    const error = Math.min(metrics.errorRate * 10, 1);
    const queue = Math.min(metrics.queueDepth / 100, 1);
    const score = Math.max(0, 100 - (cpu * 30 + error * 40 + queue * 30));
    return Math.round(score);
  };

  const healthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const healthBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-950/30';
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-950/30';
    if (score >= 40) return 'bg-orange-50 dark:bg-orange-950/30';
    return 'bg-red-50 dark:bg-red-950/30';
  };

  const MetricRow = ({ icon, label, value, unit = '', subtext = '', color = 'text-muted-foreground' }: any) => (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 text-xs">
        <div>
          <div className="text-muted-foreground">{label}</div>
          {subtext && <div className="text-xs text-muted-foreground/70">{subtext}</div>}
        </div>
      </div>
      <div className={cn('font-mono font-semibold text-sm', color)}>
        {value}<span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>
      </div>
    </div>
  );

  const ProgressBar = ({ value, max = 100, color = 'bg-blue-500' }: any) => (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all', color)}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  );

  const metricCards = [
    { icon: '', label: 'Total RPS', value: globalMetrics.totalRPS.toLocaleString(), unit: 'req/s' },
    { icon: '', label: 'Avg Latency', value: globalMetrics.avgLatencyMs.toFixed(1), unit: 'ms' },
    { icon: '', label: 'P99 Latency', value: globalMetrics.p99LatencyMs.toFixed(1), unit: 'ms' },
    { icon: '', label: 'Error Rate', value: (globalMetrics.errorRate * 100).toFixed(2), unit: '%' },
    { icon: '', label: 'Sim Time', value: currentTimeSec.toFixed(1), unit: 's' },
    { icon: '', label: 'Bottlenecks', value: bottlenecks.length.toString(), unit: '' },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Metrics Dashboard</h1>
        <p className="text-sm text-muted-foreground">Real-time system performance monitoring</p>
      </div>

      {/* Global metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricCards.map((card) => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground font-medium">{card.label}</div>
              <div className="text-2xl font-bold mt-3">
                {card.value}
                <span className="text-xs font-normal text-muted-foreground ml-1">{card.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Component Health Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Component Health</h2>
        <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(componentMetrics).map(([nodeId, metrics]: [string, any]) => {
              const bottleneck = bottlenecks.find((b) => b.nodeId === nodeId);
              const score = getHealthScore(metrics);
              const isExpanded = expandedNode === nodeId;

              return (
                <Tooltip key={nodeId}>
                  <TooltipTrigger>
                    <Card
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md',
                        healthBg(score),
                        bottleneck?.severity === 'critical' && 'border-red-500 border-2',
                        bottleneck?.severity === 'warning' && 'border-yellow-500 border-2',
                      )}
                      onClick={() => setExpandedNode(isExpanded ? null : nodeId)}
                    >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm truncate flex-1">
                      {nodeLabels[nodeId] || nodeId}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {bottleneck && (
                        <Badge
                          variant={bottleneck.severity === 'critical' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {bottleneck.severity}
                        </Badge>
                      )}
                      <div className={cn('text-lg font-bold', healthColor(score))}>
                        {score}%
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  {/* Quick Metrics */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">CPU</span>
                      <span className="font-mono font-semibold">{metrics.cpuUtilization.toFixed(1)}%</span>
                    </div>
                    <ProgressBar
                      value={metrics.cpuUtilization}
                      color={
                        metrics.cpuUtilization > 90
                          ? 'bg-red-500'
                          : metrics.cpuUtilization > 75
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Memory</span>
                    <span className="font-mono font-semibold">{metrics.memoryUtilization.toFixed(1)}%</span>
                  </div>
                  <ProgressBar
                    value={metrics.memoryUtilization}
                    color={
                      metrics.memoryUtilization > 90
                        ? 'bg-red-500'
                        : metrics.memoryUtilization > 75
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                    }
                  />

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-muted-foreground">RPS</span>
                    <span className="font-mono font-semibold">{metrics.requestsPerSecond.toFixed(0)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">P50 / P99</span>
                    <span className="font-mono font-semibold">
                      {metrics.latencyP50Ms.toFixed(1)}ms / {metrics.latencyP99Ms.toFixed(1)}ms
                    </span>
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                      <MetricRow
                        label="Active Requests"
                        value={metrics.activeRequests}
                        color="text-blue-600 dark:text-blue-400"
                      />
                      <MetricRow
                        label="Queue Depth"
                        value={metrics.queueDepth}
                        color={metrics.queueDepth > 50 ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}
                      />
                      <MetricRow
                        label="Error Rate"
                        value={(metrics.errorRate * 100).toFixed(2)}
                        unit="%"
                        color={metrics.errorRate > 0.01 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}
                      />
                      <MetricRow
                        label="Error Count"
                        value={metrics.errorCount}
                        color="text-muted-foreground"
                      />
                      <MetricRow
                        label="Connection Pool"
                        value={metrics.connectionPoolUsage.toFixed(1)}
                        unit="%"
                        color={metrics.connectionPoolUsage > 80 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}
                      />
                      <MetricRow
                        label="Cache Hit Rate"
                        value={metrics.cacheHitRate > 0 ? (metrics.cacheHitRate * 100).toFixed(1) : 'N/A'}
                        unit={metrics.cacheHitRate > 0 ? '%' : ''}
                        color={metrics.cacheHitRate > 0.7 ? 'text-green-600 dark:text-green-400' : metrics.cacheHitRate > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}
                      />
                      <MetricRow
                        label="Throughput"
                        value={metrics.throughput.toFixed(0)}
                        unit="ops/s"
                        color="text-purple-600 dark:text-purple-400"
                      />
                      <MetricRow
                        label="P95 Latency"
                        value={metrics.latencyP95Ms.toFixed(1)}
                        unit="ms"
                        color="text-blue-600 dark:text-blue-400"
                      />
                    </div>
                  )}

                  {/* Click hint */}
                  {!isExpanded && (
                    <div className="text-xs text-muted-foreground/60 pt-2 italic text-center">
                      Click to see more details
                    </div>
                  )}
                </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="p-0">
                    <DataFlowTooltip
                      nodeId={nodeId}
                      metrics={metrics}
                      nodeLabel={nodeLabels[nodeId]}
                    />
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>

      {/* Bottleneck details */}
      {bottlenecks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Bottleneck Details ({bottlenecks.length})</h2>
          <div className="space-y-2">
            {bottlenecks.map((b, i) => (
              <Card
                key={i}
                className={cn(
                  'border-l-4',
                  b.severity === 'critical'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                    : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-1">
                        {nodeLabels[b.nodeId] || b.nodeId}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{b.reason}</div>
                      <div className="text-xs font-mono bg-black/10 dark:bg-white/10 rounded px-2 py-1 w-fit">
                        {b.metric}: {b.value.toFixed(1)} {b.severity === 'critical' ? '>' : '≈'} {b.threshold}
                      </div>
                    </div>
                    <Badge
                      variant={b.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="shrink-0"
                    >
                      {b.severity}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
