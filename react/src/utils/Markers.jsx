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
// This script is the util component for the Marker functions.
//
// Special thanks to the following for their code contributions to this codebase:
// Allen Chien - https://github.com/AllenChienXXX
//
//################################################################################


// Clear all markers
export const clearAllMarkers = (setMarkedPositions) => {
    setMarkedPositions([]);
  };
  
// Canvas click handler
export const handleCanvasClick = (e, mapData, canvasRef, scale, rotation, setSelectedPoint, isMarkingEnabled, setMarkedPositions, markedPositions, selectedMapID) => {
    if (!mapData || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Calculate click position relative to the canvas with rotation and flip adjustments
    let x, y;
    
    // Get position relative to canvas in displayed state
    const relX = (e.clientX - canvasRect.left) / scale;
    const relY = (e.clientY - canvasRect.top) / scale;
    
    // Handle rotation
    switch (rotation) {
      case 90:
        x = relY;
        y = mapData.header.width - relX;
        break;
      case 180:
        x = mapData.header.width - relX;
        y = mapData.header.height - relY;
        break;
      case 270:
        x = mapData.header.height - relY;
        y = relX;
        break;
      default: // 0 degrees
        x = relX;
        y = relY;
    }
    
    x = Math.floor(x);
    y = Math.floor(y);
    
    // Get data value at this position
      if (x >= 0 && x < mapData.header.width && y >= 0 && y < mapData.header.height) {
          const index = (mapData.header.height - y - 1) * mapData.header.width + x;
          const value = mapData.decompressedData[index];
          let room_id;
  
          if (value === 254 || value === 253) {
          room_id = "Invalid Position";
          } else if (value === 252) {
          room_id = "Wall";
          } else {
          room_id = `Room ${value}`;
          }
          
          // Calculate world coordinates
          const worldX = mapData.header.origin_x + (x * mapData.header.resolution);
          const worldY = mapData.header.origin_y + ((mapData.header.height - y - 1) * mapData.header.resolution);
          
          const pointData = {
          x,
          y,
          index,
          value,
          room_id,
          worldX: worldX.toFixed(2),
          worldY: worldY.toFixed(2)
          };
          
          setSelectedPoint(pointData);
      
          // Add marker if marking is enabled
          if (isMarkingEnabled) {
              const threshold = 5; // Minimum pixel distance to consider markers "too close"
  
              // Check if a marker already exists near this point
              const isTooClose = markedPositions.some(marker => 
              Math.abs(marker.x - x) < threshold && Math.abs(marker.y - y) < threshold
              );
      
              if (!isTooClose) {
                const maxLabel = markedPositions.reduce((max, marker) => {
                  const labelNum = parseInt(marker.label, 10);
                  return isNaN(labelNum) ? max : Math.max(max, labelNum);
                }, 0);
                const newMarker = {
                    id: Date.now(),
                    x,
                    y,
                    worldX: worldX.toFixed(2),
                    worldY: worldY.toFixed(2),
                    label: `${maxLabel + 1}`,
                    selected: false,
                    map_id: selectedMapID
                };
                
                setMarkedPositions(prev => [...prev, newMarker]);  
              }
          }
      }
  };