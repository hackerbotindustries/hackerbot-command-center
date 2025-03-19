// MapVisualizationUtils.js
import React from 'react';

// Zoom handling
export const handleZoom = (e, containerRef, position, setPosition, setScale) => {
  e.preventDefault();
  
  if (!containerRef.current) return;
  
  const containerRect = containerRef.current.getBoundingClientRect();
  const mouseX = e.clientX - containerRect.left;
  const mouseY = e.clientY - containerRect.top;
  
  const mouseXInContent = mouseX - position.x;
  const mouseYInContent = mouseY - position.y;
  
  // Determine zoom direction
  const delta = e.deltaY < 0 ? 0.1 : -0.1;
  
  setScale(prevScale => {
    const newScale = Math.max(0.1, Math.min(5, prevScale + delta));
    
    // Calculate how much the content will grow/shrink
    const scaleFactor = newScale / prevScale;
    
    // Update position to keep mouse over same point
    setPosition({
      x: position.x + mouseXInContent - mouseXInContent * scaleFactor,
      y: position.y + mouseYInContent - mouseYInContent * scaleFactor
    });
    
    return newScale;
  });
};

// Mouse event handlers
export const handleMouseDown = (e, setIsDragging, position, setDragStart) => {
  // Setup dragging
  setIsDragging(true);
  setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  
  // Store the initial position on the element for later comparison
  const element = e.currentTarget;
  element.dataset.initialX = e.clientX;
  element.dataset.initialY = e.clientY;
};

export const handleMouseMove = (e, isDragging, dragStart, setPosition) => {
  if (isDragging) {
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }
};

export const handleMouseUp = (e, isDragging, setIsDragging, canvasRef, handleCanvasClick) => {
  if (isDragging) {
    // Get the element that had the mousedown event
    const element = e.target.closest('[data-initial-x]');
    
    if (element) {
      // Check if mouse position has significantly changed (threshold for drag vs click)
      const initialX = parseFloat(element.dataset.initialX);
      const initialY = parseFloat(element.dataset.initialY);
      const movedX = Math.abs(e.clientX - initialX);
      const movedY = Math.abs(e.clientY - initialY);
      
      // If we didn't move much, treat it as a click
      const clickThreshold = 5; // pixels
      if (movedX < clickThreshold && movedY < clickThreshold) {
        // Get the canvas-relative coordinates and handle as a click
        if (canvasRef.current) {
          handleCanvasClick(e);
        }
      }
      
      // Clean up temporary data attributes
      delete element.dataset.initialX;
      delete element.dataset.initialY;
    }
  }
  
  setIsDragging(false);
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
            const newMarker = {
                id: Date.now(),
                x,
                y,
                worldX: worldX.toFixed(2),
                worldY: worldY.toFixed(2),
                label: `${markedPositions.length + 1}`,
                selected: false,
                map_id: selectedMapID
            };
            
            setMarkedPositions(prev => [...prev, newMarker]);  
            }
        }
    }
};

// Rotation handler
export const handleRotate = (setRotation, canvasRef, containerRef, scale, setPosition) => {
  // Rotate 90 degrees clockwise
  setRotation((prevRotation) => (prevRotation + 90) % 360);
  
  // Reset position to center the map after rotation
  if (canvasRef.current && containerRef.current) {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    
    // Center the map
    setPosition({
      x: (container.clientWidth - canvas.width * scale) / 2,
      y: (container.clientHeight - canvas.height * scale) / 2
    });
  }
};

// Center map in container
export const centerMapInContainer = (canvasRef, containerRef, rotation, setScale, setPosition) => {
  if (!canvasRef.current || !containerRef.current) return;
  
  const container = containerRef.current;
  const canvas = canvasRef.current;

  // Get the canvas width and height, considering the rotation
  let effectiveWidth = canvas.width;
  let effectiveHeight = canvas.height;
  if (rotation % 180 === 90) { // For 90 or 270 degrees rotation
    effectiveWidth = canvas.height;
    effectiveHeight = canvas.width;
  }
  
  // Calculate the scale needed to fit the canvas within the container
  const widthScale = container.clientWidth * 0.9 / effectiveWidth;
  const heightScale = container.clientHeight * 0.9 / effectiveHeight;
  
  // Use the smaller scale to ensure the entire canvas fits
  let newScale = Math.min(widthScale, heightScale);
  
  // Apply scale with a safety limit
  newScale = Math.min(Math.max(0.1, newScale), 5);
  setScale(newScale);
  
  // Center the canvas with the new scale
  setPosition({
    x: (container.clientWidth - effectiveWidth * newScale) / 2,
    y: (container.clientHeight - effectiveHeight * newScale) / 2
  });
};

// Draw map data
export const drawMapData = (mapData, canvasRef, centerMapInContainer) => {
  if (!mapData || !canvasRef.current) return;
  
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const { width, height } = mapData.header;
  const { decompressedData, colorMap } = mapData;
  
  // Set canvas size based on map dimensions
  canvas.width = width;
  canvas.height = height;
  
  // Clear canvas
  ctx.fillStyle = '#F0F0F0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw map data using imageData for better performance
  const imageData = ctx.createImageData(width, height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      if (index < decompressedData.length) {
        const value = decompressedData[index];
        const pixelIndex = ((height - y - 1) * width + x) * 4;
        
        // Default to white
        let r = 255, g = 255, b = 255, a = 255;
        
        if (value > 0) {
          if (value == 0xFD) {// Gray wall
              r = 207;   // R
              g = 207; // G
              b = 207; // B
          }
          else if (value % 16 == 2 || value % 16 == 6 || value % 16 == 0xa || value % 16 == 0xe || value == 0xFE){ // White smoke
              r = 245;   // R
              g = 245; // G
              b = 245; // B   
          }
          else if(value % 16 != 1 && value % 16 != 5 && value % 16 != 9 && value % 16 != 0xd){ // 1,5,9,d are rooms
              r = 147;   // R
              g = 145; // G
              b = 146; // B
          }else{
            // Get color from colorMap
            const color = colorMap[value] || colorMap.default || '#939192'; // Use default gray if no specific color
            
            // Convert hex color to RGB
            if (color.startsWith('#')) {
              r = parseInt(color.slice(1, 3), 16);
              g = parseInt(color.slice(3, 5), 16);
              b = parseInt(color.slice(5, 7), 16);
            }
          }
        }
        
        imageData.data[pixelIndex] = r;
        imageData.data[pixelIndex + 1] = g;
        imageData.data[pixelIndex + 2] = b;
        imageData.data[pixelIndex + 3] = a;
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  // Center the map after drawing
  centerMapInContainer();
};

// Draw grid lines and origin
export const drawGridAndOrigin = (mapData, canvasRef) => {
  if (!mapData || !canvasRef.current) return;
  
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const { width, height } = mapData.header;
  
  // We need to get the imageData first to avoid clearing the map
  const imageData = ctx.getImageData(0, 0, width, height);
  
  // Clear canvas but save the map data
  ctx.fillStyle = '#F0F0F0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Restore the map data
  ctx.putImageData(imageData, 0, 0);
  
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 0.5;
  
  // Calculate the offset to align with world origin
  const originXPixel = -mapData.header.origin_x / mapData.header.resolution;
  const originYPixel = -mapData.header.origin_y / mapData.header.resolution;
  
  // Draw vertical grid lines (aligned to integer meter positions)
  const startXMeter = Math.ceil(mapData.header.origin_x);
  const endXMeter = Math.floor(mapData.header.origin_x + width * mapData.header.resolution);
  
  for (let worldX = startXMeter; worldX <= endXMeter; worldX++) {
    // Convert world X coordinate to pixel position
    const x = Math.round((worldX - mapData.header.origin_x) / mapData.header.resolution);
    
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    if (worldX % 5 === 0) {
      ctx.font = '10px Arial';
      ctx.fillStyle = '#000000';
      ctx.fillText(`${worldX}m`, x, 0);
    }
  }
  
  // Draw horizontal grid lines (aligned to integer meter positions)
  const startYMeter = Math.ceil(mapData.header.origin_y);
  const endYMeter = Math.floor(mapData.header.origin_y + height * mapData.header.resolution);
  
  for (let worldY = startYMeter; worldY <= endYMeter; worldY++) {
    // Convert world Y coordinate to pixel position
    const y = height - Math.round((worldY - mapData.header.origin_y) / mapData.header.resolution) - 1;
    
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    if (worldY % 5 === 0) {
      ctx.font = '10px Arial';
      ctx.fillStyle = '#000000';
      ctx.fillText(`${worldY}m`, 0, y);
    }
  }
  
  // Draw the world origin (0,0) if it's visible
  if (originXPixel >= 0 && originXPixel < width && originYPixel >= 0 && originYPixel < height) {
    const originDisplayX = originXPixel;
    const originDisplayY = height - originYPixel - 1;
    
    // Draw a red plus instead of a crosshair
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    
    const plusSize = 5;
    ctx.beginPath();
    ctx.moveTo(originDisplayX - plusSize, originDisplayY);
    ctx.lineTo(originDisplayX + plusSize, originDisplayY);
    ctx.moveTo(originDisplayX, originDisplayY - plusSize);
    ctx.lineTo(originDisplayX, originDisplayY + plusSize);
    ctx.stroke();
  }
};

// Fetch map data utility
export const fetchMapData = async (selectedMapID, setMapData, MapUtils) => {
  // Check if selectedMapID exists and is valid
  if (!selectedMapID) {
    console.log('No map ID selected. Skipping data fetch.');
    return; // Exit early if no map ID is selected
  }
  
  try {
    const response = await fetch(`/api/getmap/${selectedMapID}`);
    console.log(`Fetching map data from /api/getmap/${selectedMapID}`);  
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    setMapData(MapUtils.processMapData(data.map_data));
  } catch (err) {
    console.error('Error fetching map data:', err);
  }
};

// Reset view
export const resetView = (setScale, setPosition, setRotation, centerMapInContainer) => {
  setScale(1);
  setPosition({ x: 0, y: 0 });
  setRotation(0);
  centerMapInContainer();
};

// Clear all markers
export const clearAllMarkers = (setMarkedPositions) => {
  setMarkedPositions([]);
};
/**
 * LZ4 block decompression
 */
export function lz4Decompress(compressedData, expectedSize) {
    // Create output buffer for decompressed data with expected size
    const decompressed = new Uint8Array(expectedSize);
    let dstPos = 0;
    let srcPos = 0;

    // Process each LZ4 sequence
    try {
        while (srcPos < compressedData.length && dstPos < decompressed.length) {
            // Read token byte
            const token = compressedData[srcPos++];
            
            // Get literal length (high 4 bits)
            let literalLength = token >>> 4;
            
            // Handle extended literal length (if literalLength = 15)
            if (literalLength === 15) {
                let lengthByte;
                do {
                if (srcPos >= compressedData.length) {
                    throw new Error("Unexpected end of input during literal length");
                }
                lengthByte = compressedData[srcPos++];
                literalLength += lengthByte;
                } while (lengthByte === 255);
            }
            
            // Copy literals from source to destination
            if (literalLength > 0) {
                if (srcPos + literalLength > compressedData.length) {
                const remaining = compressedData.length - srcPos;
                literalLength = remaining;
                }
                
                if (dstPos + literalLength > decompressed.length) {
                const remaining = decompressed.length - dstPos;
                literalLength = remaining;
                }
                
                // Copy literal bytes
                for (let i = 0; i < literalLength; i++) {
                decompressed[dstPos++] = compressedData[srcPos++];
                }
            }
            
            // Check if we've reached the end of the input
            if (srcPos >= compressedData.length || dstPos >= decompressed.length) {
                break;
            }
            
            // Read match offset (2 bytes little-endian)
            if (srcPos + 1 >= compressedData.length) {
                break;
            }
            
            const offset = compressedData[srcPos] | (compressedData[srcPos + 1] << 8);
            srcPos += 2;
            
            // Validate match offset (0 is invalid in LZ4)
            if (offset === 0 || offset > dstPos) {
                throw new Error(`Invalid match offset: ${offset}, dstPos: ${dstPos}`);
            }
            
            // Get match length (low 4 bits of token + 4)
            let matchLength = (token & 0x0F) + 4;
            
            // Handle extended match length (if matchLength = 19)
            if (matchLength === 19) {
                let lengthByte;
                do {
                if (srcPos >= compressedData.length) {
                    throw new Error("Unexpected end of input during match length");
                }
                lengthByte = compressedData[srcPos++];
                matchLength += lengthByte;
                } while (lengthByte === 255);
            }
            
            // Ensure we don't overflow the destination buffer
            if (dstPos + matchLength > decompressed.length) {
                const remaining = decompressed.length - dstPos;
                matchLength = remaining;
            }
            
            // Copy match data (LZ4 allows overlapping matches)
            const matchPos = dstPos - offset;
            for (let i = 0; i < matchLength; i++) {
                if (matchPos + i < 0 || matchPos + i >= dstPos) {
                throw new Error(`Invalid match position: ${matchPos + i}, valid range: 0-${dstPos-1}`);
                }
                decompressed[dstPos++] = decompressed[matchPos + i];
            }
            }
        
            return decompressed;
    } catch (error) {
        // Return partial decompression
        return decompressed;
    }
}

// Helper function to convert hex to Uint8Array
export const hexToUint8Array = (hexString) => {
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
    }
    return bytes;
};

  // Process map data from text content
export const processMapData = (text) => {
    try {
        // Convert hex string to binary
        const data = hexToUint8Array(text.replace(/\s/g, ''));
        const view = new DataView(data.buffer);
        
        // Extract header
        const header = {
            id: view.getInt16(0, true),
            size: view.getInt32(2, true),
            lz4_size: view.getInt32(6, true),
            width: view.getInt32(10, true),
            height: view.getInt32(14, true),
            resolution: view.getFloat32(18, true),
            origin_x: view.getFloat32(22, true),
            origin_y: view.getFloat32(26, true)
        };
        
        // Extract compressed data
        const compressedData = data.slice(30);
        
        // Decompress the data using our LZ4 implementation
        const decompressedData = lz4Decompress(compressedData, header.size);
        
        // Find unique values for coloring
        const uniqueValues = new Set();
        for (let i = 0; i < decompressedData.length; i++) {
        if (decompressedData[i] > 0) {
            uniqueValues.add(decompressedData[i]);
        }
        }
        
        // Create custom color map based on the specified hex values
        const colorMap = {
        0: '#FFFFFF',    // Free space (white)
        0x1: '#FA6930',  // RGB: 250, 105, 48
        0x5: '#F9CC29',  // RGB: 249, 204, 41
        0x9: '#46A68B',  // RGB: 70, 166, 139
        0xD: '#1F8BFA',  // RGB: 31, 139, 250
        0x11: '#F5787C', // RGB: 245, 120, 124
        0x15: '#A6E66E', // RGB: 166, 230, 110
        0x19: '#48F5C7', // RGB: 72, 245, 199
        0x1D: '#7AF5FA', // RGB: 122, 245, 250
        0x21: '#F19CA1', // RGB: 241, 156, 161
        0x25: '#75DE1F', // RGB: 117, 222, 31
        0x29: '#62E5EF', // RGB: 98, 229, 239
        0x2D: '#9D85F5', // RGB: 157, 133, 245
        0x31: '#F4C29D', // RGB: 244, 194, 157
        254: '#EEEEEE',  // Unknown (light gray)
        255: '#333333',  // Occupied (dark gray)
        };
        
        // Add default gray for any values not explicitly defined
        const defaultColor = '#939192'; // RGB: 147, 145, 146
        
        // Add any unique values that aren't already in the colorMap
        uniqueValues.forEach(value => {
        if (!colorMap[value]) {
            colorMap[value] = defaultColor;
        }
        });
        return { header, compressedData, decompressedData, colorMap };
        
    } catch (error) {
        console.error('Error processing map data:', error);
    }
};