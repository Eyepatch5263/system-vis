import { SimEvent, SimEventType } from '@system-vis/shared';
import { ComponentModel } from '../component-model.js';
import { sampleNormal } from '../component-model.js';

export class SearchEngineModel extends ComponentModel {
  private indexingQueue = 0;

  handleEvent(event: SimEvent): SimEvent[] {
    switch (event.type) {
      case SimEventType.REQUEST_ARRIVE: {
        // Search query
        if (this.state.queueDepth > 1000) {
          // Queue full, reject
          this.state.totalFailed++;
          return [];
        }

        if (Math.random() < (this.config.failureRate || 0)) {
          this.state.totalFailed++;
          return [];
        }

        const latency = sampleNormal(this.config.baseLatencyMs, this.config.latencyStdDevMs);
        this.state.activeRequests++;
        this.state.queueDepth++;

        const completeEvent: SimEvent = {
          id: `evt_complete_${event.requestId}`,
          type: SimEventType.REQUEST_COMPLETE as any,
          timestamp: event.timestamp + latency,
          requestId: event.requestId,
          nodeId: this.config.label || 'search',
          metadata: { success: true },
        };

        return [completeEvent];
      }

      case SimEventType.REQUEST_COMPLETE: {
        this.state.activeRequests--;
        this.state.queueDepth = Math.max(0, this.state.queueDepth - 1);
        this.state.totalProcessed++;
        const latencies = [...this.state.completedLatencies];
        latencies.push(sampleNormal(this.config.baseLatencyMs, this.config.latencyStdDevMs));
        this.state.completedLatencies = latencies;
        return [];
      }

      default:
        return [];
    }
  }
}
