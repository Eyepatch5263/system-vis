import { SimEventType, type SimEvent, type CacheNodeProps } from '@system-vis/shared';
import { ComponentModel } from '../component-model.js';

export class CacheModel extends ComponentModel {
  private hits = 0;
  private misses = 0;

  getCacheHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }

  getMemoryUtilization(): number {
    // Cache nodes are memory-bound: they keep data in RAM regardless of active requests.
    // Memory baseline correlates with hitRate (more data cached = more memory used).
    const config = this.config as CacheNodeProps;
    const baselineMemory = Math.min(config.hitRate * 70, 70); // up to 70% baseline
    return Math.min(baselineMemory + this.state.cpuUtilization * 0.3, 100);
  }

  handleEvent(event: SimEvent): SimEvent[] {
    if (event.type !== SimEventType.REQUEST_ARRIVE && event.type !== SimEventType.REQUEST_ROUTE) {
      return [];
    }

    const config = this.config as CacheNodeProps;
    this.state.activeRequests++;
    this.state.totalProcessed++;
    this.updateUtilization();
    const processingTime = this.getProcessingTime();

    if (Math.random() < config.hitRate) {
      this.hits++;
      this.state.completedLatencies.push(processingTime);
      return [{
        id: `evt_cache_hit_${event.requestId}`,
        type: SimEventType.REQUEST_COMPLETE,
        timestamp: event.timestamp + processingTime,
        requestId: event.requestId,
        nodeId: event.nodeId,
        metadata: { cacheHit: true },
      }];
    }

    // Cache miss — route to downstream (usually database)
    this.misses++;
    return this.routeToDownstream(event.requestId, event.timestamp + processingTime);
  }

  resetTickCounters(): void {
    this.state.activeRequests = 0;
    super.resetTickCounters();
  }
}
