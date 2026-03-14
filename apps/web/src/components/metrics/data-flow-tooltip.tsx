import type { ComponentMetrics } from '@system-vis/shared';

interface DataFlowTooltipProps {
  nodeId: string;
  metrics: ComponentMetrics;
  nodeLabel?: string;
}

export function DataFlowTooltip({ nodeId, metrics, nodeLabel }: DataFlowTooltipProps) {
  const template = metrics.requestTemplate;
  const requests = metrics.recentRequests || [];

  return (
    <div className="p-4 bg-card border border-border rounded-lg shadow-lg max-w-md text-xs">
      {/* Component Header */}
      <div className="mb-3 pb-2 border-b border-border">
        <h3 className="font-bold text-sm">{nodeLabel || nodeId}</h3>
        <p className="text-muted-foreground text-xs">Data Flow Analysis</p>
      </div>

      {/* Request Template */}
      {template && (
        <div className="mb-3 space-y-1">
          <p className="font-semibold text-muted-foreground">Expected Input:</p>
          <p className="text-xs text-muted-foreground mb-1">
            {template.requestTemplate.description}
          </p>
          <div className="bg-muted rounded p-2 font-mono text-xs overflow-auto max-h-24">
            <code className="text-foreground break-all">
              {JSON.stringify(template.requestTemplate.sample, null, 2)}
            </code>
          </div>
        </div>
      )}

      {/* Response Template */}
      {template && (
        <div className="mb-3 space-y-1">
          <p className="font-semibold text-muted-foreground">Expected Output:</p>
          <p className="text-xs text-muted-foreground mb-1">
            {template.responseTemplate.description}
          </p>
          <div className="bg-muted rounded p-2 font-mono text-xs overflow-auto max-h-24">
            <code className="text-foreground break-all">
              {JSON.stringify(template.responseTemplate.sample, null, 2)}
            </code>
          </div>
        </div>
      )}

      {/* Live Examples */}
      {requests.length > 0 && (
        <div className="space-y-1.5">
          <p className="font-semibold text-muted-foreground">Live Examples:</p>
          <div className="space-y-1 max-h-32 overflow-auto">
            {requests.map((req, idx) => (
              <div key={idx} className="bg-muted rounded p-2 text-xs space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-yellow-600 font-semibold">[{req.stage}]</span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(req.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <code className="text-foreground block break-all max-h-16 overflow-auto">
                  {JSON.stringify(req.data, null, 1)}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data */}
      {requests.length === 0 && (
        <div className="text-muted-foreground italic text-xs">
          No sample requests yet...
        </div>
      )}
    </div>
  );
}
