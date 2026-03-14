#!/bin/bash

# Start Locust Load Test for System-Vis
#
# Before running this, make sure:
# 1. Simulation server is running: npm run dev --workspace=apps/simulation-server
# 2. Web app is running: npm run dev --workspace=apps/web
# 3. You've started a simulation in the web UI at http://localhost:3000
#
# This will open Locust web UI at http://localhost:8089

echo ""
echo "============================================"
echo "Starting Locust Load Test for System-Vis"
echo "============================================"
echo ""
echo "Locust will open at: http://localhost:8089"
echo ""
echo "1. Set 'Number of users' to 50-100"
echo "2. Set 'Spawn rate' to 5-10 users/sec"
echo "3. Click 'Start swarming'"
echo ""
echo "Watch your system-vis canvas for bottlenecks!"
echo "============================================"
echo ""

python -m locust -f locust-loadtest.py --host=http://localhost:3001 --web
