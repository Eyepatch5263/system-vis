'use client';

import { MetricsDashboard } from '@/components/metrics/metrics-dashboard';

export default function MetricsPage() {
  return (
    <div className="h-full overflow-auto p-6">
      <MetricsDashboard />
    </div>
  );
}
