import { SimEventType, type SimEvent, type CDNNodeProps } from '@system-vis/shared';
import { ComponentModel } from '../component-model.js';

export class CDNModel extends ComponentModel {
  private hits = 0;
  private misses = 0;

  getCacheHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }

  getMemoryUtilization(): number {
    // CDN edge nodes keep cached assets in memory — memory is proportional to cache hit rate.
    const config = this.config as CDNNodeProps;
    const baselineMemory = Math.min(config.cacheHitRate * 65, 65);
    return Math.min(baselineMemory + this.state.cpuUtilization * 0.25, 100);
  }

  handleEvent(event: SimEvent): SimEvent[] {
    if (event.type !== SimEventType.REQUEST_ARRIVE && event.type !== SimEventType.REQUEST_ROUTE) {
      return [];
    }

    const config = this.config as CDNNodeProps;
    this.state.activeRequests++;
    this.state.totalProcessed++;
    this.updateUtilization();
    const processingTime = this.getProcessingTime();

    if (Math.random() < config.cacheHitRate) {
      this.hits++;
      this.state.completedLatencies.push(processingTime);
      return [{
        id: `evt_cdn_hit_${event.requestId}`,
        type: SimEventType.REQUEST_COMPLETE,
        timestamp: event.timestamp + processingTime,
        requestId: event.requestId,
        nodeId: event.nodeId,
        metadata: { cacheHit: true },
      }];
    }

    // Cache miss — route to origin
    this.misses++;
    return this.routeToDownstream(event.requestId, event.timestamp + processingTime);
  }

  resetTickCounters(): void {
    this.state.activeRequests = 0;
    super.resetTickCounters();
  }
}
