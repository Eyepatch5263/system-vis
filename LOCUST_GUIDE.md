# 🔥 Locust Load Testing Guide for System-Vis

This guide explains how to use Locust to stress test your simulated system architectures in real-time.

## Overview

Locust is a Python-based load testing tool that simulates realistic user behavior. When integrated with your system-vis simulation engine, you can:

- ✅ Generate realistic traffic patterns from distributed users
- ✅ Test architectures under controlled stress conditions
- ✅ Watch bottlenecks appear in real-time on the canvas
- ✅ Measure response times and failure rates
- ✅ Simulate different user behavior scenarios (e.g., spike traffic)

## Quick Start

### 1. Install Locust

```bash
pip install locust
```

Or if you have requirements file:
```bash
pip install -r requirements.txt
```

### 2. Start Your Simulation

First, you need to start a simulation in the web UI:

1. Go to **http://localhost:3000**
2. Click **Architect** page
3. Click **"📋 Sample"** to load the sample architecture (or generate your own via AI)
4. Click the **Simulate** tab
5. Select a traffic pattern (e.g., "Moderate Load")
6. Click **"Start Simulation"**

Watch the console for the output - you'll see something like:
```
Simulation server running on port 3001
- WebSocket: ws://localhost:3001
- HTTP API: http://localhost:3001/api/traffic/inject
```

### 3. Run Locust

In a **new terminal**, run:

```bash
locust -f locust-loadtest.py --host=http://localhost:3001
```

This will start the Locust web UI on **http://localhost:8089**

### 4. Configure and Start Load Test

In the Locust web UI:

1. Set **Number of users (peak concurrency)**: 50-100 (start low)
2. Set **Spawn rate (users started/sec)**: 5-10
3. Click **"Start swarming"**

Watch your system-vis canvas as the simulation receives traffic from Locust!

## Understanding the Metrics

### In System-Vis:
- **RPS** (Requests Per Second) - Total throughput
- **Latency** - P50, P95, P99 percentiles
- **Error Rate** - Percentage of failed requests
- **Bottlenecks** - Components under stress (CPU > 80%, Queue depth high, etc.)

### In Locust:
- **RPS** - Requests per second
- **Response Time** - Min, Average, Max, Median
- **Failures** - Failed requests and reasons
- **Charts** - Real-time visualization of load

## Load Testing Scenarios

### Scenario 1: Gradual Increase (Ramp-up)
```bash
locust -f locust-loadtest.py --host=http://localhost:3001 \
  -u 100 --spawn-rate 5  # Start with 100 users at 5 users/sec
```

This simulates gradual increase in users - good for finding breaking points.

### Scenario 2: Sustained Load
```bash
locust -f locust-loadtest.py --host=http://localhost:3001 \
  -u 50 --spawn-rate 50 # Burst to 50 users immediately
```

All users spawn instantly - good for stress testing known scales.

### Scenario 3: Spike Load
```bash
# In locust-loadtest.py, modify the LoadTestShape
# or use the SpikeBehaviorUser class
```

Sudden spike in traffic - good for testing auto-scaling.

### Scenario 4: Long-running Test
```bash
locust -f locust-loadtest.py --host=http://localhost:3001 \
  -u 100 --spawn-rate 5 \
  -t 5m  # Run for 5 minutes
```

Tests stability and memory leaks over time.

## Customizing the Test

### Edit User Behavior

In `locust-loadtest.py`, modify the task weights to change behavior:

```python
@task(4)  # This task runs 4 times for every 1 time other tasks run
def browse_products(self):
    """Most common action"""
    pass

@task(0.5)  # Less common
def checkout(self):
    """Rare action"""
    pass
```

### Add Custom Scenarios

```python
class HighValueCustomerUser(HttpUser):
    """Simulates high-value customers who buy frequently."""

    wait_time = between(0.5, 1.5)  # Lower wait time

    @task(8)
    def add_to_cart(self):
        # Adds to cart more frequently
        pass

    @task(4)
    def checkout(self):
        # Checks out 2x more often
        pass
```

## Advanced: Custom Load Shape

For realistic traffic patterns over time:

```python
from locust import LoadTestShape

class CustomLoadShape(LoadTestShape):
    """Custom load pattern - ramp up, sustain, spike."""

    def tick(self):
        run_time = self.get_run_time()

        if run_time < 60:
            # First minute: ramp up
            user_count = int(run_time)
            return (user_count, 10)

        elif run_time < 180:
            # Minutes 1-3: sustain at 60 users
            return (60, 10)

        elif run_time < 240:
            # Minute 3-4: spike to 200
            return (200, 50)

        else:
            # Stop the test
            return None
```

## Monitoring Performance

### Watch Both Consoles

**System-Vis Console:**
```
sim:tick received - RPS: 1250, Latency: 145ms, Errors: 0.2%
bottleneck detected: database CPU at 92%
```

**Locust Console:**
```
Total Requests: 2,500 | Failures: 5 | Avg Response: 142ms
```

### Export Results

From Locust UI, download CSV reports:
- **Summary Stats** - Overall metrics
- **Response Times** - Latency distribution
- **Failures** - Error analysis

## Troubleshooting

### "Connection refused"
```
Error: Connection refused to http://localhost:3001
```

**Solution:** Make sure simulation server is running
```bash
npm run dev --workspace=apps/simulation-server
```

### Requests not appearing in simulation
```
Problem: Locust running but simulation not receiving traffic
```

**Solution:** Ensure the `simulationId` in locust-loadtest.py matches your active simulation.

###High failure rate
```
Problem: Many requests failing with 5xx errors
```

**Solution:**
1. Lower the spawn rate
2. Reduce number of users
3. Check if components reached max capacity
4. Review bottleneck warnings in simulation

## Best Practices

1. **Start Small** - Begin with 10-20 users before ramping up
2. **Watch the Metrics** - Monitor both Locust and System-Vis dashboards
3. **Identify Bottlenecks** - Note which components fail first
4. **Test Realistic Scenarios** - Use actual user behavior patterns
5. **Document Results** - Save performance baselines
6. **Iterate** - Redesign architecture based on findings

## Example: Complete Test Flow

```bash
# Terminal 1: Start simulation server
npm run dev --workspace=apps/simulation-server

# Terminal 2: Start web app with simulation
npm run dev --workspace=apps/web

# Terminal 3: Start Locust
locust -f locust-loadtest.py --host=http://localhost:3001

# Terminal 4: Open browsers
# - System-Vis canvas: http://localhost:3000/simulate
# - Locust dashboard: http://localhost:8089
```

Then in Web UI:
1. Load sample architecture
2. Start simulation
3. In Locust: Set 100 users, 10 spawn rate
4. Click "Start swarming"
5. Watch bottlenecks appear on canvas!

## Performance Tips

### For Testing Large Numbers of Users
- Increase system file limits: `ulimit -n 100000`
- Use Locust distributed mode for 1000+ users
- Run Locust on separate machine from simulation

### For Realistic Simulations
- Use multiple user types with different behavior
- Add random think time between requests
- Simulate different geographic regions
- Include varying request payloads

## Resources

- [Locust Documentation](https://docs.locust.io)
- [System-Vis Simulation Engine](./SIMULATION.md)
- [Architecture Design Patterns](./ARCHITECTURE.md)

---

Happy load testing! 🚀
