import { SimEventType, type SimEvent, type DatabaseNodeProps } from '@system-vis/shared';
import { ComponentModel, sampleNormal } from '../component-model.js';

export class DatabaseModel extends ComponentModel {
  protected getTotalCapacity(): number {
    const config = this.config as DatabaseNodeProps;
    // Databases are connection-pool bound, not instance-multiplied.
    return Math.max(config.maxConnections, 1);
  }

  getMemoryUtilization(): number {
    // Databases use memory for buffer pools and query caches independent of active connections.
    const connPressure = this.state.cpuUtilization * 0.5;
    return Math.min(connPressure + 25, 100); // 25% baseline for buffer pool
  }

  handleEvent(event: SimEvent): SimEvent[] {
    if (event.type !== SimEventType.REQUEST_ARRIVE && event.type !== SimEventType.REQUEST_ROUTE) {
      if (event.type === SimEventType.REQUEST_PROCESS_END) {
        this.state.activeRequests = Math.max(0, this.state.activeRequests - 1);
        this.state.totalProcessed++;
        const arrivalTime = (event.metadata?.arrivalTime as number | undefined) ?? event.timestamp;
        this.state.completedLatencies.push(event.timestamp - arrivalTime);
        this.updateUtilization();
        return this.routeToDownstream(event.requestId, event.timestamp);
      }
      if (event.type === SimEventType.REQUEST_FAIL) {
        this.state.activeRequests = Math.max(0, this.state.activeRequests - 1);
        this.state.totalFailed++;
        this.updateUtilization();
        return [];
      }
      return [];
    }

    const config = this.config as DatabaseNodeProps;
    if (this.state.activeRequests >= config.maxConnections) {
      this.state.queueDepth++;
      this.state.totalFailed++;
      return [{
        id: `evt_db_connlimit_${event.requestId}`,
        type: SimEventType.REQUEST_FAIL,
        timestamp: event.timestamp,
        requestId: event.requestId,
        nodeId: event.nodeId,
        metadata: { reason: 'connection_limit_exceeded' },
      }];
    }

    this.state.activeRequests++;
    this.updateUtilization();
    const queryTime = sampleNormal(config.avgQueryLatencyMs, config.avgQueryLatencyMs * 0.3);

    if (this.shouldFail()) {
      return [{
        id: `evt_db_fail_${event.requestId}`,
        type: SimEventType.REQUEST_FAIL,
        timestamp: event.timestamp + queryTime,
        requestId: event.requestId,
        nodeId: event.nodeId,
      }];
    }

    return [{
      id: `evt_db_done_${event.requestId}`,
      type: SimEventType.REQUEST_PROCESS_END,
      timestamp: event.timestamp + queryTime,
      requestId: event.requestId,
      nodeId: event.nodeId,
      metadata: { arrivalTime: event.timestamp },
    }];
  }
}
