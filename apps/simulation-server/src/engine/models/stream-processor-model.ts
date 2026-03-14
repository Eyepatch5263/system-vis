import { SimEvent, SimEventType } from '@system-vis/shared';
import { ComponentModel } from '../component-model.js';
import { sampleNormal } from '../component-model.js';

export class StreamProcessorModel extends ComponentModel {
  private processedEvents = 0;
  private lagMs = 0;

  handleEvent(event: SimEvent): SimEvent[] {
    switch (event.type) {
      case SimEventType.REQUEST_ARRIVE: {
        //Stream event
        if (this.state.queueDepth > 5000) {
          // Overloaded, reject
          this.state.totalFailed++;
          return [];
        }

        if (Math.random() < (this.config.failureRate || 0)) {
          this.state.totalFailed++;
          return [];
        }

        const processingTime = sampleNormal(this.config.baseLatencyMs, this.config.latencyStdDevMs);
        this.state.activeRequests++;
        this.state.queueDepth++;
        this.lagMs = Math.max(0, this.lagMs + processingTime);

        const completeEvent: SimEvent = {
          id: `evt_stream_complete_${event.requestId}`,
          type: SimEventType.REQUEST_COMPLETE as any,
          timestamp: event.timestamp + processingTime,
          requestId: event.requestId,
          nodeId: this.config.label || 'stream-processor',
          metadata: { success: true, processed: true },
        };

        return [completeEvent];
      }

      case SimEventType.REQUEST_COMPLETE: {
        this.state.activeRequests--;
        this.state.queueDepth = Math.max(0, this.state.queueDepth - 1);
        this.state.totalProcessed++;
        this.processedEvents++;

        // Reduce lag
        this.lagMs = Math.max(0, this.lagMs - 10);

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
