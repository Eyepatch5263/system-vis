import { SimEvent, SimEventType } from '@system-vis/shared';
import { ComponentModel } from '../component-model.js';
import { sampleNormal } from '../component-model.js';

export class AnalyticsServiceModel extends ComponentModel {
  private bufferedEvents = 0;
  private aggregationBuffer = 1000;

  handleEvent(event: SimEvent): SimEvent[] {
    switch (event.type) {
      case SimEventType.REQUEST_ARRIVE: {
        // Analytics event (usually async, so fast enqueue)
        const bufferTime = sampleNormal(5, 2);
        this.state.activeRequests++;
        this.bufferedEvents++;

        // When buffer is full, trigger aggregation
        let events: SimEvent[] = [];
        if (this.bufferedEvents >= this.aggregationBuffer) {
          const aggregationTime = sampleNormal(this.config.baseLatencyMs, this.config.latencyStdDevMs);

          const aggregateEvent: SimEvent = {
            id: `evt_agg_${Date.now()}`,
            type: SimEventType.REQUEST_COMPLETE as any,
            timestamp: event.timestamp + aggregationTime,
            requestId: `batch_${this.bufferedEvents}`,
            nodeId: this.config.label || 'analytics',
            metadata: { success: true, eventsProcessed: this.bufferedEvents },
          };

          events.push(aggregateEvent);
          this.bufferedEvents = 0;
        }

        const bufferEvent: SimEvent = {
          id: `evt_buf_${event.requestId}`,
          type: SimEventType.REQUEST_COMPLETE as any,
          timestamp: event.timestamp + bufferTime,
          requestId: event.requestId,
          nodeId: this.config.label || 'analytics',
          metadata: { success: true, buffered: true },
        };

        events.push(bufferEvent);
        return events;
      }

      case SimEventType.REQUEST_COMPLETE: {
        this.state.activeRequests--;
        this.state.totalProcessed++;

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
