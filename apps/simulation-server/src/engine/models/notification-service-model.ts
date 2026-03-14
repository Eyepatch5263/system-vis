import { SimEvent, SimEventType } from '@system-vis/shared';
import { ComponentModel } from '../component-model.js';
import { sampleNormal } from '../component-model.js';

export class NotificationServiceModel extends ComponentModel {
  private notificationQueue = 0;

  handleEvent(event: SimEvent): SimEvent[] {
    switch (event.type) {
      case SimEventType.REQUEST_ARRIVE: {
        // Notification enqueue request
        if (this.notificationQueue > 50000) {
          // Queue overflow
          this.state.totalFailed++;
          return [];
        }

        if (Math.random() < (this.config.failureRate || 0.01)) {
          this.state.totalFailed++;
          return [];
        }

        const enqueueTime = sampleNormal(10, 5); // Quick enqueue
        this.state.activeRequests++;
        this.notificationQueue++;

        const completeEvent: SimEvent = {
          id: `evt_notif_${event.requestId}`,
          type: SimEventType.REQUEST_COMPLETE as any,
          timestamp: event.timestamp + enqueueTime,
          requestId: event.requestId,
          nodeId: this.config.label || 'notifications',
          metadata: { success: true, queued: true },
        };

        return [completeEvent];
      }

      case SimEventType.REQUEST_COMPLETE: {
        this.state.activeRequests--;
        this.notificationQueue = Math.max(0, this.notificationQueue - 1);
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
