#!/bin/bash

# Ports for Flask and React
REACT_PORT=5173

echo "---------------------------------------------"
echo "STOPPING HACKERBOT WEB APPLICATION"
echo "---------------------------------------------"

# Find and kill React process
REACT_PID=$(lsof -ti :$REACT_PORT)
if [ -n "$REACT_PID" ]; then
    echo "Stopping React frontend (PID: $REACT_PID)..."
    kill "$REACT_PID"
    echo "React frontend stopped."
else
    echo "React frontend not running."
fi

echo "---------------------------------------------"
echo "HACKERBOT WEB APPLICATION STOPPED"
echo "---------------------------------------------"
