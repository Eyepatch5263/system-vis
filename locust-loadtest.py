"""
Locust Load Test Script for System-Vis Simulation

This script generates realistic user behavior patterns to stress test
your system architectures simulated in system-vis.

Install: pip install locust requests

Run with:
  locust -f locust-loadtest.py --host=http://localhost:3001

IMPORTANT: Before running, replace SIMULATION_ID below with your actual simulation ID
from the web UI console output when you start a simulation.
"""

import random
import time
from locust import HttpUser, task, between, events

# ===== IMPORTANT: SET YOUR SIMULATION ID HERE =====
# Go to http://localhost:3000/simulate, start a simulation, and copy the ID from console
SIMULATION_ID = "sim_1773438083918_t203pf"  # Replace with actual simulation ID from web UI


class SystemVisUser(HttpUser):
    """Simulates a realistic user interacting with the system."""

    wait_time = between(1, 3)  # Wait 1-3 seconds between requests
    user_id = None

    def on_start(self):
        """Called when a simulated user starts."""
        # Generate a unique user ID based on the user object
        self.user_id = f"user_{id(self) % 10000}"

    @task(8)
    def browse_products(self):
        """Simulate browsing products (most common action)."""
        self.client.post(
            "/api/traffic/inject",
            json={
                "simulationId": SIMULATION_ID,
                "requests": [
                    {
                        "simulationId": SIMULATION_ID,
                        "requestId": f"req_{random.randint(1000, 9999)}",
                        "timestamp": int(time.time() * 1000),
                        "path": "/api/products",
                        "method": "GET",
                        "userId": self.user_id,
                    }
                ],
            },
            name="Browse Products",
        )

    @task(4)
    def search_products(self):
        """Simulate user searching for products."""
        queries = ["laptop", "phone", "headphones", "camera", "tablet"]
        self.client.post(
            "/api/traffic/inject",
            json={
                "simulationId": SIMULATION_ID,
                "requests": [
                    {
                        "simulationId": SIMULATION_ID,
                        "requestId": f"req_{random.randint(1000, 9999)}",
                        "timestamp": int(time.time() * 1000),
                        "path": f"/api/search?q={random.choice(queries)}",
                        "method": "GET",
                        "userId": self.user_id,
                    }
                ],
            },
            name="Search Products",
        )

    @task(4)
    def view_product_detail(self):
        """Simulate viewing product details."""
        product_id = random.randint(1, 1000)
        self.client.post(
            "/api/traffic/inject",
            json={
                "simulationId": SIMULATION_ID,
                "requests": [
                    {
                        "simulationId": SIMULATION_ID,
                        "requestId": f"req_{random.randint(1000, 9999)}",
                        "timestamp": int(time.time() * 1000),
                        "path": f"/api/products/{product_id}",
                        "method": "GET",
                        "userId": self.user_id,
                    }
                ],
            },
            name="View Product Detail",
        )

    @task(2)
    def add_to_cart(self):
        """Simulate adding item to shopping cart."""
        product_id = random.randint(1, 1000)
        quantity = random.randint(1, 5)
        self.client.post(
            "/api/traffic/inject",
            json={
                "simulationId": SIMULATION_ID,
                "requests": [
                    {
                        "simulationId": SIMULATION_ID,
                        "requestId": f"req_{random.randint(1000, 9999)}",
                        "timestamp": int(time.time() * 1000),
                        "path": f"/api/cart/add",
                        "method": "POST",
                        "userId": self.user_id,
                    }
                ],
            },
            name="Add to Cart",
        )

    @task(1)
    def checkout(self):
        """Simulate checkout process (less frequent)."""
        self.client.post(
            "/api/traffic/inject",
            json={
                "simulationId": SIMULATION_ID,
                "requests": [
                    {
                        "simulationId": SIMULATION_ID,
                        "requestId": f"req_{random.randint(1000, 9999)}",
                        "timestamp": int(time.time() * 1000),
                        "path": "/api/checkout",
                        "method": "POST",
                        "userId": self.user_id,
                    }
                ],
            },
            name="Checkout",
        )

    @task(1)
    def process_payment(self):
        """Simulate payment processing."""
        self.client.post(
            "/api/traffic/inject",
            json={
                "simulationId": SIMULATION_ID,
                "requests": [
                    {
                        "simulationId": SIMULATION_ID,
                        "requestId": f"req_{random.randint(1000, 9999)}",
                        "timestamp": int(time.time() * 1000),
                        "path": "/api/payment/process",
                        "method": "POST",
                        "userId": self.user_id,
                    }
                ],
            },
            name="Process Payment",
        )

    @task(2)
    def check_order_status(self):
        """Simulate checking order status."""
        order_id = random.randint(1000, 9999)
        self.client.post(
            "/api/traffic/inject",
            json={
                "simulationId": SIMULATION_ID,
                "requests": [
                    {
                        "simulationId": SIMULATION_ID,
                        "requestId": f"req_{random.randint(1000, 9999)}",
                        "timestamp": int(time.time() * 1000),
                        "path": f"/api/orders/{order_id}",
                        "method": "GET",
                        "userId": self.user_id,
                    }
                ],
            },
            name="Check Order Status",
        )


class SpikeBehaviorUser(HttpUser):
    """Simulates spike traffic pattern."""

    wait_time = between(0.5, 2)

    @task
    def rapid_requests(self):
        """Send rapid requests to simulate spike."""
        self.client.post(
            "/api/traffic/inject",
            json={
                "simulationId": SIMULATION_ID,
                "requests": [
                    {
                        "simulationId": SIMULATION_ID,
                        "requestId": f"spike_req_{random.randint(1000, 9999)}",
                        "timestamp": int(time.time() * 1000),
                        "path": "/api/products",
                        "method": "GET",
                        "userId": f"spike_user_{random.randint(1, 1000)}",
                    }
                ],
            },
            name="Spike Traffic",
        )


# Event listeners for better reporting
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print("\n" + "=" * 60)
    print("🚀 System-Vis Load Test Started")
    print("=" * 60)

    if SIMULATION_ID == "default":
        print("\n⚠️  ERROR: SIMULATION_ID not set!")
        print("   You need to get the actual simulation ID and update the script:")
        print("")
        print("   STEPS:")
        print("   1. Go to http://localhost:3000/architect")
        print("   2. Load an architecture (e.g., click Sample → Netflix)")
        print("   3. Go to Simulate tab → Click 'Start Simulation'")
        print("   4. Check BROWSER CONSOLE for simulation ID output")
        print("   5. Copy the simulationId value")
        print("   6. Update SIMULATION_ID in this script (line ~22)")
        print("   7. Run locust again")
        print("\n" + "=" * 60 + "\n")
        environment.stop()
        return

    print(f"\n✅ Using Simulation ID: {SIMULATION_ID}")
    print("   Send traffic to: http://localhost:3001/api/traffic/inject")
    print("\n" + "=" * 60 + "\n")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    print("\n" + "=" * 50)
    print("✅ Load Test Completed")
    print("=" * 50)
    print(f"Total Requests: {environment.stats.total.num_requests}")
    print(f"Total Failures: {environment.stats.total.num_failures}")
    print(f"Avg Response Time: {environment.stats.total.avg_response_time:.0f}ms")
    print("=" * 50 + "\n")
