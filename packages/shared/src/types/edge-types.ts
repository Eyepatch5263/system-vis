export interface ArchEdgeData {
  [key: string]: unknown;
  protocol: 'http' | 'grpc' | 'websocket' | 'tcp' | 'amqp' | 'kafka';
  bandwidthMbps: number;
  latencyOverheadMs: number;
  encrypted: boolean;
  label?: string;
}

export interface ArchEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  data: ArchEdgeData;
  animated?: boolean;
}
