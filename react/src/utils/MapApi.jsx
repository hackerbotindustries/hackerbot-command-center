//################################################################################
// Copyright (c) 2025 Hackerbot Industries LLC
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.
//
// Created By: Allen Chien
// Created:    April 2025
// Updated:    2025.04.20
//
// This script is the util component for the Map API calls.
//
// Special thanks to the following for their code contributions to this codebase:
// Allen Chien - https://github.com/AllenChienXXX
//
//################################################################################


import { processMapData } from "./MapData"; 

// Fetch map data utility
export const fetchMapData = async (selectedMapID, setMapData) => {
    // Check if selectedMapID exists and is valid
    if (!selectedMapID) {
      console.log('No map ID selected. Skipping data fetch.');
      return; // Exit early if no map ID is selected
    }
    
    try {
      const response = await fetch(`/api/v1/base/maps/${selectedMapID}`);
      console.log(`Fetching map data from /api/v1/base/maps/${selectedMapID}`);  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setMapData(processMapData(data.map_data));
    } catch (err) {
      console.error('Error fetching map data:', err);
    }
};

export const fetchRobotPositions = async (setRobotPose) => {
    try {
      console.log('Fetching robot position from /api/v1/base/maps/position');
      const response = await fetch('/api/v1/base/maps/position');
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (data && data.response) {
        const { x, y, angle } = data.response;
        setRobotPose({ x, y, angle });
      } else {
        console.warn('Unexpected response structure:', data);
      }
    } catch (err) {
      console.error('Error fetching robot position:', err);
    }
};

export async function handleGotoClick(pos) {
  try {
    const response = await fetch('/api/v1/base/maps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'goto',
        x: pos.worldX,
        y: pos.worldY,
        angle: pos.angle,
        speed: 0.5, // or make this dynamic
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Robot response:', data.response);
    } else {
      console.error('Robot error:', data.error);
    }
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

export async function handleDockClick() {
  try {
    const response = await fetch('/api/v1/base', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'dock',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Docking successful:', data.response);
    } else {
      console.error('Docking failed:', data.error);
    }
  } catch (error) {
    console.error('Dock request error:', error);
  }
}

