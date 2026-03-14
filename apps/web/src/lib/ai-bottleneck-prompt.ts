import type { ArchNodeType, NODE_LABELS } from '@system-vis/shared';

/**
 * Build a prompt that instructs the AI to analyze bottlenecks in the current
 * architecture and return an optimized version with detailed insights.
 */
export function buildBottleneckAnalysisPrompt(params: {
  architectureJson: string;
  bottlenecks: Array<{
    nodeId: string;
    severity: string;
    reason: string;
    metric: string;
    value: number;
    threshold: number;
  }>;
  globalMetrics: {
    totalRPS: number;
    avgLatencyMs: number;
    p99LatencyMs: number;
    errorRate: number;
  };
  componentMetrics: Record<string, {
    nodeId: string;
    requestsPerSecond: number;
    cpuUtilization: number;
    latencyP50Ms: number;
    latencyP95Ms: number;
    latencyP99Ms: number;
    errorRate: number;
    queueDepth: number;
    activeRequests: number;
  }>;
  nodeLabels: Record<string, string>;
}): string {
  const { architectureJson, bottlenecks, globalMetrics, componentMetrics, nodeLabels } = params;

  const bottleneckSummary = bottlenecks.map((b) => {
    const name = nodeLabels[b.nodeId] || b.nodeId;
    return `- **${name}** (${b.nodeId}): ${b.reason} [severity: ${b.severity}, metric: ${b.metric}, value: ${b.value.toFixed(1)}, threshold: ${b.threshold}]`;
  }).join('\n');

  const metricsSummary = Object.entries(componentMetrics).map(([nodeId, m]) => {
    const name = nodeLabels[nodeId] || nodeId;
    return `- **${name}** (${nodeId}): RPS=${m.requestsPerSecond.toFixed(0)}, CPU=${m.cpuUtilization.toFixed(1)}%, P50=${m.latencyP50Ms.toFixed(0)}ms, P95=${m.latencyP95Ms.toFixed(0)}ms, P99=${m.latencyP99Ms.toFixed(0)}ms, errors=${(m.errorRate * 100).toFixed(1)}%, queueDepth=${m.queueDepth}, activeReqs=${m.activeRequests}`;
  }).join('\n');

  return `You are a system architecture expert analyzing simulation results. A simulation was run on the architecture below, and bottlenecks were detected.

YOUR TASK:
1. Analyze each bottleneck and identify the root cause
2. Suggest concrete improvements for each
3. Generate an OPTIMIZED version of the architecture that fixes these bottlenecks

CURRENT ARCHITECTURE (JSON):
${architectureJson}

SIMULATION GLOBAL METRICS:
- Total RPS: ${globalMetrics.totalRPS.toFixed(0)}
- Average Latency: ${globalMetrics.avgLatencyMs.toFixed(0)}ms
- P99 Latency: ${globalMetrics.p99LatencyMs.toFixed(0)}ms
- Error Rate: ${(globalMetrics.errorRate * 100).toFixed(1)}%

DETECTED BOTTLENECKS:
${bottleneckSummary}

PER-COMPONENT METRICS:
${metricsSummary}

OUTPUT FORMAT: You MUST respond with ONLY valid JSON matching this exact schema. No markdown, no explanation outside the JSON.

{
  "insights": [
    {
      "nodeId": "<id of the bottleneck node>",
      "nodeName": "<label of the node>",
      "issue": "<1-sentence description of the problem>",
      "rootCause": "<1-2 sentence explanation of WHY this bottleneck occurred>",
      "suggestion": "<1-2 sentence concrete fix>",
      "priority": "<critical | high | medium>"
    }
  ],
  "summary": "<2-3 sentence overall analysis of the architecture's performance and the key improvements needed>",
  "optimizedArchitecture": {
    "nodes": [<same schema as input nodes, with fixes applied — increased instances, added replicas, added new components, tuned parameters, etc.>],
    "edges": [<same schema as input edges, with any new connections for added components>]
  },
  "changes": [
    "<human-readable description of change 1, e.g. 'Increased database read replicas from 0 to 2'>",
    "<change 2>",
    "..."
  ]
}

RULES FOR THE OPTIMIZED ARCHITECTURE:
- Keep the same node IDs for existing nodes (so the user can see what changed)
- You MAY add NEW nodes (e.g., a cache layer, read replicas) with new IDs like "node_new_1"
- You MAY add NEW edges to connect new nodes
- You MUST fix the specific bottlenecks identified above
- Tune numeric parameters: instances, maxRPS, maxConnections, readReplicas, consumerCount, maxQueueDepth, etc.
- Every node MUST keep its existing "requestResponseTemplate" if present
- Maintain the same position layout style (top-to-bottom flow, y increments of 150)
- Keep the "changes" array concise — one entry per significant change

POSITIONING FOR NEW NODES: Place new nodes logically relative to the nodes they connect to. Use x increments of 250. Shift existing nodes down if needed to make room.`;
}
