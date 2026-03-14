import { ArchNodeType } from '@system-vis/shared';
import { CDNNode } from './cdn-node';
import { LoadBalancerNode } from './load-balancer-node';
import { FrontendNode } from './frontend-node';
import { APIGatewayNode } from './api-gateway-node';
import { ServiceNode } from './service-node';
import { DatabaseNode } from './database-node';
import { CacheNode } from './cache-node';
import { QueueNode } from './queue-node';
import { WebSocketServerNode } from './websocket-server-node';
import { SearchEngineNode } from './search-engine-node';
import { StreamProcessorNode } from './stream-processor-node';
import { MLModelServiceNode } from './ml-model-service-node';
import { PaymentGatewayNode } from './payment-gateway-node';
import { NotificationServiceNode } from './notification-service-node';
import { AnalyticsServiceNode } from './analytics-service-node';
import { RealTimeDBNode } from './realtime-db-node';

export const nodeTypes = {
  [ArchNodeType.CDN]: CDNNode,
  [ArchNodeType.LOAD_BALANCER]: LoadBalancerNode,
  [ArchNodeType.FRONTEND]: FrontendNode,
  [ArchNodeType.API_GATEWAY]: APIGatewayNode,
  [ArchNodeType.AUTH_SERVICE]: ServiceNode,
  [ArchNodeType.ORDER_SERVICE]: ServiceNode,
  [ArchNodeType.CUSTOM_SERVICE]: ServiceNode,
  [ArchNodeType.DATABASE]: DatabaseNode,
  [ArchNodeType.CACHE]: CacheNode,
  [ArchNodeType.QUEUE]: QueueNode,
  [ArchNodeType.WEBSOCKET_SERVER]: WebSocketServerNode,
  [ArchNodeType.SEARCH_ENGINE]: SearchEngineNode,
  [ArchNodeType.STREAM_PROCESSOR]: StreamProcessorNode,
  [ArchNodeType.ML_MODEL_SERVICE]: MLModelServiceNode,
  [ArchNodeType.PAYMENT_GATEWAY]: PaymentGatewayNode,
  [ArchNodeType.NOTIFICATION_SERVICE]: NotificationServiceNode,
  [ArchNodeType.ANALYTICS_SERVICE]: AnalyticsServiceNode,
  [ArchNodeType.REAL_TIME_DB]: RealTimeDBNode,
};
