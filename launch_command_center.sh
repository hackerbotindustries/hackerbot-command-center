#!/bin/bash
################################################################################
# Copyright (c) 2025 Hackerbot Industries LLC
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
#
# Created By: Allen Chien
# Created:    April 2025
# Updated:    2025.04.01
#
# This script launches the Hackerbot Command Center React Frontend.
#
# Special thanks to the following for their code contributions to this codebase:
# Allen Chien - https://github.com/AllenChienXXX
################################################################################


set -o pipefail

BASE_DIR="$(pwd)/react"

cd $HOME/hackerbot/hackerbot-command-center/react/

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
    echo "FAILURE! Hackerbot Command Center failed to launch."
    echo "React Frontend failed to start."
    echo "Check logs in: $logdir"
    echo "---------------------------------------------"
    exit 1
}

echo "---------------------------------------------"
echo "STARTING HACKERBOT COMMAND CENTER"
echo "---------------------------------------------"

# Stop existing processes first
if command -v stop-command-center >/dev/null 2>&1; then
    echo "Cleaning up existing process"
    if ! stop-command-center >> "$logfile_frontend" 2>&1; then
        echo "Failed to execute cleanup..."
    fi
else
    echo "stop-command-center command not found. Skipping cleanup."
fi

# Start React Frontend
(npm run dev -- --host --port $REACT_PORT >> "$logfile_frontend" 2>&1) &
PID_FRONTEND=$!

# Wait a few seconds for processes to start
sleep 2

if ! ps -p $PID_FRONTEND > /dev/null; then
    echo "Hackerbot Command Center failed to start!"
    echo_failure
fi

echo ""
echo "---------------------------------------------"
echo "SUCCESS! Hackerbot Command Center is Running!"
echo "React Frontend: http://localhost:$REACT_PORT"
echo "                http://$LOCAL_IP:$REACT_PORT"
echo "Log file: $logfile_frontend"
echo "---------------------------------------------"
