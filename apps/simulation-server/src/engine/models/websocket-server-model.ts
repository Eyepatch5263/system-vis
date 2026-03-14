import { SimEvent, SimEventType } from '@system-vis/shared';
import { ComponentModel } from '../component-model.js';
import { sampleNormal } from '../component-model.js';

export class WebSocketServerModel extends ComponentModel {
  private activeConnections = 0;
  private messageQueue = 0;

  handleEvent(event: SimEvent): SimEvent[] {
    switch (event.type) {
      case SimEventType.REQUEST_ARRIVE: {
        // WebSocket connection/message
        if (Math.random() < (this.config.failureRate || 0)) {
          this.state.totalFailed++;
          return [];
        }

        const latency = sampleNormal(this.config.baseLatencyMs, this.config.latencyStdDevMs);
        this.state.activeRequests++;
        this.activeConnections++;
        this.state.completedLatencies.push(latency);

        // Simulate broadcast to multiple clients
        const broadcastDelay = latency + sampleNormal(10, 5);
        const completeEvent: SimEvent = {
          id: `evt_complete_${event.requestId}`,
          type: SimEventType.REQUEST_COMPLETE as any,
          timestamp: event.timestamp + broadcastDelay,
          requestId: event.requestId,
          nodeId: this.config.label || 'websocket',
          metadata: { success: true },
        };

        return [completeEvent];
      }

      case SimEventType.REQUEST_COMPLETE: {
        this.state.activeRequests--;
        this.activeConnections--;
        this.state.totalProcessed++;
        return [];
      }

      default:
        return [];
    }
  }
}
