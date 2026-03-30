import { SimEventType, type SimEvent, type MLModelServiceNodeProps } from '@system-vis/shared';
import { ComponentModel, sampleNormal } from '../component-model.js';

export class MLModelServiceModel extends ComponentModel {
  protected getTotalCapacity(): number {
    const config = this.config as MLModelServiceNodeProps;
    return Math.max(config.instances, 1) * Math.max(config.maxConcurrentRequests, 1);
  }

  getMemoryUtilization(): number {
    // ML inference is GPU/memory-bound: memory tracks closely with CPU (model weights always loaded).
    return Math.min(this.state.cpuUtilization * 0.85 + 15, 100);
  }

  handleEvent(event: SimEvent): SimEvent[] {
    switch (event.type) {
      case SimEventType.REQUEST_ARRIVE:
      case SimEventType.REQUEST_ROUTE: {
        const config = this.config as MLModelServiceNodeProps;

        if (this.state.activeRequests >= this.getTotalCapacity()) {
          this.state.totalFailed++;
          return [];
        }

        this.state.activeRequests++;
        this.updateUtilization();

        const mean = Math.max(1, config.inferenceLatencyMs ?? config.baseLatencyMs);
        const inferenceTime = sampleNormal(mean, config.latencyStdDevMs);

        if (this.shouldFail()) {
          return [{
            id: `evt_ml_fail_${event.requestId}`,
            type: SimEventType.REQUEST_FAIL,
            timestamp: event.timestamp + inferenceTime,
            requestId: event.requestId,
            nodeId: event.nodeId,
          }];
        }

        return [{
          id: `evt_ml_end_${event.requestId}`,
          type: SimEventType.REQUEST_PROCESS_END,
          timestamp: event.timestamp + inferenceTime,
          requestId: event.requestId,
          nodeId: event.nodeId,
          metadata: { arrivalTime: event.timestamp },
        }];
      }

      case SimEventType.REQUEST_PROCESS_END: {
        this.state.activeRequests = Math.max(0, this.state.activeRequests - 1);
        this.state.totalProcessed++;

        const arrivalTime = (event.metadata?.arrivalTime as number | undefined) ?? event.timestamp;
        this.state.completedLatencies.push(event.timestamp - arrivalTime);
        this.updateUtilization();

        return this.routeToDownstream(event.requestId, event.timestamp);
      }

      case SimEventType.REQUEST_FAIL: {
        this.state.activeRequests = Math.max(0, this.state.activeRequests - 1);
        this.state.totalFailed++;
        this.updateUtilization();
        return [];
      }

      default:
        return [];
    }
  }
}
