#!/bin/bash

echo "---------------------------------------------"
echo "STOPPING HACKERBOT COMMAND CENTER"
echo "---------------------------------------------"

NODE_PIDS=$(ps aux | grep '\snode\s' | awk '{print $2}')

if [ -n "$NODE_PIDS" ]; then
    echo "Stopping React processes..."
    kill -9 $NODE_PIDS
    echo "All React-related processes stopped."
else
    echo "No running React-related processes found."
fi

echo "---------------------------------------------"
echo "HACKERBOT COMMAND CENTER STOPPED"
echo "---------------------------------------------"
