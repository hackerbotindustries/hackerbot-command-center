#!/bin/bash
set -o pipefail

BASE_DIR="$(pwd)"

# Log directory setup
timestamp_react="hackerbot_react_$(date '+%Y%m%d%H%M')"
logdir="$HOME/hackerbot/logs"

# Create log directory if it doesn't exist
if [ ! -d "$logdir" ]; then
    echo "Creating log directory at $logdir"
    mkdir -p "$logdir"
fi

# Keep only the latest 5 logs
if compgen -G "$logdir/*" > /dev/null; then
    ls -1dt "$logdir"/* | tail -n +6 | xargs rm -rf 2>/dev/null
fi

logfile_frontend="$logdir/$timestamp_react.txt"

# Port configuration
REACT_PORT=5173
LOCAL_IP=$(hostname -I | awk '{print $1}')

function echo_failure {
    echo ""
    echo "---------------------------------------------"
    echo "FAILURE! Hackerbot react frontend failed to launch."
    echo "Check logs in: $logdir"
    echo "---------------------------------------------"
    exit 1
}

echo "---------------------------------------------"
echo "STARTING HACKERBOT REACT FRONTEND"
echo "---------------------------------------------"

# Start React Frontend
(npm run dev -- --host --port $REACT_PORT >> "$logfile_frontend" 2>&1) &
PID_FRONTEND=$!

# Wait a few seconds for processes to start
sleep 2

if ! ps -p $PID_FRONTEND > /dev/null; then
    echo "React frontend failed to start!"
    echo_failure
fi

echo ""
echo "---------------------------------------------"
echo "SUCCESS! Hackerbot React Frontend is Running!"
echo "React Frontend: http://localhost:$REACT_PORT"
echo "                http://$LOCAL_IP:$REACT_PORT"
echo "Log file: $logfile_frontend"
echo "---------------------------------------------"
