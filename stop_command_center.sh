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
# This script stops the Hackerbot Command Center React Frontend and kills all
# associated processes.
#
# Special thanks to the following for their code contributions to this codebase:
# Allen Chien - https://github.com/AllenChienXXX
################################################################################


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
