import { SimEvent, SimEventType } from '@system-vis/shared';
import { ComponentModel } from '../component-model.js';
import { sampleNormal } from '../component-model.js';

export class RealTimeDBModel extends ComponentModel {
  private activeSubscriptions = 0;

  handleEvent(event: SimEvent): SimEvent[] {
    switch (event.type) {
      case SimEventType.REQUEST_ARRIVE: {
        // Real-time database operation (read/write/subscribe)
        if (this.state.activeRequests >= (this.config.maxConcurrentRequests || 10000)) {
          this.state.totalFailed++;
          return [];
        }

        if (Math.random() < (this.config.failureRate || 0.002)) {
          this.state.totalFailed++;
          return [];
        }

        const opTime = sampleNormal(this.config.baseLatencyMs, this.config.latencyStdDevMs);
        this.state.activeRequests++;

        // Track subscriptions (long-lived connections)
        if (Math.random() < 0.3) {
          this.activeSubscriptions++;
        }

        const completeEvent: SimEvent = {
          id: `evt_rtdb_${event.requestId}`,
          type: SimEventType.REQUEST_COMPLETE as any,
          timestamp: event.timestamp + opTime,
          requestId: event.requestId,
          nodeId: this.config.label || 'realtime-db',
          metadata: {
            success: true,
            subscriptions: this.activeSubscriptions,
            replicated: true,
          },
        };

        return [completeEvent];
      }

      case SimEventType.REQUEST_COMPLETE: {
        this.state.activeRequests--;
        this.state.totalProcessed++;

        // Occasional subscription cleanup
        if (Math.random() < 0.05) {
          this.activeSubscriptions = Math.max(0, this.activeSubscriptions - 1);
        }

        const latencies = [...this.state.completedLatencies];
        latencies.push(sampleNormal(this.config.baseLatencyMs, this.config.latencyStdDevMs));
        this.state.completedLatencies = latencies.slice(-1000);
        return [];
      }

      default:
        return [];
    }
  }
}
