import { SimEvent, SimEventType } from '@system-vis/shared';
import { ComponentModel } from '../component-model.js';
import { sampleNormal } from '../component-model.js';

export class MLModelServiceModel extends ComponentModel {
  handleEvent(event: SimEvent): SimEvent[] {
    switch (event.type) {
      case SimEventType.REQUEST_ARRIVE: {
        // Inference request
        if (this.state.activeRequests >= (this.config.maxConcurrentRequests || 500)) {
          // Capacity exceeded
          this.state.totalFailed++;
          return [];
        }

        if (Math.random() < (this.config.failureRate || 0)) {
          this.state.totalFailed++;
          return [];
        }

        const inferenceTime = sampleNormal(this.config.baseLatencyMs, this.config.latencyStdDevMs);
        this.state.activeRequests++;

        const completeEvent: SimEvent = {
          id: `evt_ml_complete_${event.requestId}`,
          type: SimEventType.REQUEST_COMPLETE as any,
          timestamp: event.timestamp + inferenceTime,
          requestId: event.requestId,
          nodeId: this.config.label || 'ml-service',
          metadata: { success: true, prediction: Math.random() },
        };

        return [completeEvent];
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
