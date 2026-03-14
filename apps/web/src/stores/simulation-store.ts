import { create } from 'zustand';
import type {
  SimulationStatus,
  SimulationTickResult,
  BottleneckInfo,
  ComponentMetrics,
  TrafficPattern,
} from '@system-vis/shared';

interface SimulationState {
  status: SimulationStatus;
  simulationId: string | null;
  currentTick: number;
  currentTimeSec: number;
  trafficPattern: TrafficPattern;

  // Metrics
  componentMetrics: Record<string, ComponentMetrics>;
  metricsHistory: SimulationTickResult[];
  bottlenecks: BottleneckInfo[];
  globalMetrics: {
    totalRPS: number;
    avgLatencyMs: number;
    p99LatencyMs: number;
    errorRate: number;
  };

  // Node labels mapping for display
  nodeLabels: Record<string, string>;

  // Actions
  setStatus: (status: SimulationStatus) => void;
  setSimulationId: (id: string | null) => void;
  setTrafficPattern: (pattern: TrafficPattern) => void;
  applyTick: (tick: SimulationTickResult) => void;
  setBottlenecks: (bottlenecks: BottleneckInfo[]) => void;
  setNodeLabels: (labels: Record<string, string>) => void;
  reset: () => void;
}

const initialGlobalMetrics = {
  totalRPS: 0,
  avgLatencyMs: 0,
  p99LatencyMs: 0,
  errorRate: 0,
};

export const useSimulationStore = create<SimulationState>((set) => ({
  status: 'idle',
  simulationId: null,
  currentTick: 0,
  currentTimeSec: 0,
  trafficPattern: { type: 'constant', rps: 1000 },
  componentMetrics: {},
  metricsHistory: [],
  bottlenecks: [],
  globalMetrics: initialGlobalMetrics,
  nodeLabels: {},

  setStatus: (status) => set({ status }),
  setSimulationId: (id) => set({ simulationId: id }),
  setTrafficPattern: (pattern) => set({ trafficPattern: pattern }),

  applyTick: (tick) =>
    set((state) => ({
      currentTick: tick.tick,
      currentTimeSec: tick.timeSec,
      componentMetrics: tick.componentMetrics,
      metricsHistory: [...state.metricsHistory.slice(-299), tick],
      bottlenecks: tick.bottlenecks,
      globalMetrics: tick.globalMetrics,
    })),

  setBottlenecks: (bottlenecks) => set({ bottlenecks }),

  setNodeLabels: (labels) => set({ nodeLabels: labels }),

  reset: () =>
    set({
      status: 'idle',
      simulationId: null,
      currentTick: 0,
      currentTimeSec: 0,
      componentMetrics: {},
      metricsHistory: [],
      bottlenecks: [],
      globalMetrics: initialGlobalMetrics,
      nodeLabels: {},
    }),
}));
