import type { Architecture, SimulationConfig, SimulationTickResult, TrafficPattern } from '@system-vis/shared';
import { ArchNodeType } from '@system-vis/shared';
import { EventQueue } from './event-queue.js';
import { generateArrivals, InternalTrafficGenerator } from './traffic-generator.js';
import { collectMetrics } from './metrics-collector.js';
import { detectBottlenecks } from './bottleneck-detector.js';
import { ComponentModel } from './component-model.js';
import { ServiceModel } from './models/service-model.js';
import { LoadBalancerModel } from './models/load-balancer-model.js';
import { DatabaseModel } from './models/database-model.js';
import { CacheModel } from './models/cache-model.js';
import { QueueModel } from './models/queue-model.js';
import { CDNModel } from './models/cdn-model.js';
import { GatewayModel } from './models/gateway-model.js';
import { WebSocketServerModel } from './models/websocket-server-model.js';
import { SearchEngineModel } from './models/search-engine-model.js';
import { StreamProcessorModel } from './models/stream-processor-model.js';
import { MLModelServiceModel } from './models/ml-model-service-model.js';
import { PaymentGatewayModel } from './models/payment-gateway-model.js';
import { NotificationServiceModel } from './models/notification-service-model.js';
import { AnalyticsServiceModel } from './models/analytics-service-model.js';
import { RealTimeDBModel } from './models/realtime-db-model.js';

export class SimulationEngine {
  private eventQueue = new EventQueue();
  private models = new Map<string, ComponentModel>();
  private config: SimulationConfig;
  private architecture: Architecture;
  private internalTrafficGenerator?: InternalTrafficGenerator;
  private tickCount = 0;
  private simulationTimeMs = 0;
  private totalRequests = 0;
  private completedRequests = 0;
  private failedRequests = 0;

  constructor(architecture: Architecture, config: SimulationConfig) {
    this.architecture = architecture;
    this.config = config;
    this._initModels();
    this._initTrafficGenerators();
  }

  private _initTrafficGenerators(): void {
    // Initialize internal traffic generator if enabled
    if (this.config.trafficGeneration?.internal?.enabled) {
      this.internalTrafficGenerator = new InternalTrafficGenerator(this.architecture);
    }
  }

  private _initModels(): void {
    for (const node of this.architecture.nodes) {
      const downstreamIds = this.architecture.edges
        .filter((e) => e.source === node.id)
        .map((e) => e.target);

      const data = node.data;
      let model: ComponentModel;

      switch (data.nodeType) {
        case ArchNodeType.LOAD_BALANCER:
          model = new LoadBalancerModel(data, downstreamIds);
          break;
        case ArchNodeType.DATABASE:
          model = new DatabaseModel(data, downstreamIds);
          break;
        case ArchNodeType.CACHE:
          model = new CacheModel(data, downstreamIds);
          break;
        case ArchNodeType.QUEUE:
          model = new QueueModel(data, downstreamIds);
          break;
        case ArchNodeType.CDN:
          model = new CDNModel(data, downstreamIds);
          break;
        case ArchNodeType.API_GATEWAY:
          model = new GatewayModel(data, downstreamIds);
          break;
        case ArchNodeType.WEBSOCKET_SERVER:
          model = new WebSocketServerModel(data, downstreamIds);
          break;
        case ArchNodeType.SEARCH_ENGINE:
          model = new SearchEngineModel(data, downstreamIds);
          break;
        case ArchNodeType.STREAM_PROCESSOR:
          model = new StreamProcessorModel(data, downstreamIds);
          break;
        case ArchNodeType.ML_MODEL_SERVICE:
          model = new MLModelServiceModel(data, downstreamIds);
          break;
        case ArchNodeType.PAYMENT_GATEWAY:
          model = new PaymentGatewayModel(data, downstreamIds);
          break;
        case ArchNodeType.NOTIFICATION_SERVICE:
          model = new NotificationServiceModel(data, downstreamIds);
          break;
        case ArchNodeType.ANALYTICS_SERVICE:
          model = new AnalyticsServiceModel(data, downstreamIds);
          break;
        case ArchNodeType.REAL_TIME_DB:
          model = new RealTimeDBModel(data, downstreamIds);
          break;
        default:
          model = new ServiceModel(data, downstreamIds);
          break;
      }

      this.models.set(node.id, model);
    }
  }

  tick(): SimulationTickResult {
    this.tickCount++;
    const tickDurationMs = this.config.tickIntervalMs;
    const tickStartMs = this.simulationTimeMs;
    this.simulationTimeMs += tickDurationMs;

    // 1. Generate arrivals from external traffic injection (Locust)
    const externalArrivals = generateArrivals(
      this.config.trafficPattern,
      tickStartMs,
      tickDurationMs,
      this.config.entryNodeId
    );

    // 2. Generate arrivals from internal traffic simulation
    let internalArrivals: typeof externalArrivals = [];
    if (this.internalTrafficGenerator) {
      internalArrivals = this.internalTrafficGenerator.generateArrivals(
        this.config.trafficGeneration!.internal!.loadPattern,
        tickStartMs,
        tickDurationMs
      );
    }

    // 3. Merge both traffic sources
    const allArrivals = [...externalArrivals, ...internalArrivals];
    this.totalRequests += allArrivals.length;
    for (const evt of allArrivals) {
      this.eventQueue.push(evt);
    }

    // 4. Process event queue
    let processedEvents = 0;
    const maxEventsPerTick = 50000;
    while (this.eventQueue.length > 0 && processedEvents < maxEventsPerTick) {
      const event = this.eventQueue.peek()!;
      if (event.timestamp > this.simulationTimeMs) break;

      this.eventQueue.pop();
      processedEvents++;

      const model = this.models.get(event.nodeId);
      if (!model) continue;

      const resultEvents = model.handleEvent(event);
      for (const re of resultEvents) {
        if (re.type === 'REQUEST_COMPLETE' as any) {
          if (re.metadata?.success === false) {
            this.failedRequests++;
          } else {
            this.completedRequests++;
          }
        } else if (re.type === 'REQUEST_FAIL' as any) {
          // Will be processed by the model
          this.eventQueue.push(re);
        } else {
          this.eventQueue.push(re);
        }
      }
    }

    // 5. Update utilization for all models
    for (const model of this.models.values()) {
      model.updateUtilization();
    }

    // 6. Collect metrics
    const timeSec = this.simulationTimeMs / 1000;
    const componentMetrics = collectMetrics(this.models, timeSec, tickDurationMs / 1000);

    // 7. Detect bottlenecks
    const bottlenecks = detectBottlenecks(componentMetrics);

    // 8. Compute global metrics
    const allLatencies: number[] = [];
    let totalRPS = 0;
    let totalErrors = 0;
    let totalProcessed = 0;
    for (const m of Object.values(componentMetrics)) {
      totalRPS += m.requestsPerSecond;
      totalErrors += m.errorCount;
      totalProcessed += m.throughput;
      allLatencies.push(m.latencyP50Ms);
    }

    const avgLatency = allLatencies.length > 0
      ? allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length
      : 0;

    return {
      tick: this.tickCount,
      timeSec,
      componentMetrics,
      activePackets: [],
      bottlenecks,
      globalMetrics: {
        totalRPS: allArrivals.length / (tickDurationMs / 1000),
        avgLatencyMs: avgLatency,
        p99LatencyMs: Math.max(...Object.values(componentMetrics).map((m) => m.latencyP99Ms), 0),
        errorRate: totalProcessed > 0 ? totalErrors / totalProcessed : 0,
      },
    };
  }

  isComplete(): boolean {
    return this.simulationTimeMs >= this.config.durationSec * 1000;
  }

  getSimulationTimeMs(): number {
    return this.simulationTimeMs;
  }
}
