import { SimEvent, SimEventType } from '@system-vis/shared';
import { ComponentModel } from '../component-model.js';
import { sampleNormal } from '../component-model.js';

export class PaymentGatewayModel extends ComponentModel {
  private successRate = 0.98; // 2% transaction failure rate

  handleEvent(event: SimEvent): SimEvent[] {
    switch (event.type) {
      case SimEventType.REQUEST_ARRIVE: {
        // Payment transaction
        if (this.state.activeRequests >= (this.config.maxConcurrentRequests || 1000)) {
          this.state.totalFailed++;
          return [];
        }

        const success = Math.random() < this.successRate;
        if (!success && Math.random() < 0.5) {
          // 50% of failures are transient retries
          this.state.totalFailed++;
          return [];
        }

        const transactionTime = sampleNormal(
          this.config.baseLatencyMs,
          this.config.latencyStdDevMs
        );
        this.state.activeRequests++;

        const completeEvent: SimEvent = {
          id: `evt_payment_${event.requestId}`,
          type: SimEventType.REQUEST_COMPLETE as any,
          timestamp: event.timestamp + transactionTime,
          requestId: event.requestId,
          nodeId: this.config.label || 'payment',
          metadata: { success, transactionId: Math.random().toString(36) },
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
