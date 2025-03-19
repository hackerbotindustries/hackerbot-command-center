import React, { useState, useEffect, useRef } from 'react';
import { IoLocationSharp } from 'react-icons/io5';
import { FaXmark } from "react-icons/fa6";
import * as MapUtils from '../utils/MapUtils';

const MapVisualization = ({ isMarkingEnabled = false , selectedMapID, setMarkedPositions, markedPositions}) => {
  const [mapData, setMapData] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const [selectedPoint, setSelectedPoint] = useState(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  
  // const [mp, setMP] = useState([]); // local function to store and set Marked Positions(for display on canvas)
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const handleZoom = (e) => {
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
  
  // Modified: Split mouse down handling into dragging vs clicking functionality
  const handleMouseDown = (e) => {
    // Setup dragging
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    
    // Store the initial position on the element for later comparison
    const element = e.currentTarget;
    element.dataset.initialX = e.clientX;
    element.dataset.initialY = e.clientY;
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  
  // Modified: Mouse up handler now determines if it was a click or drag
  const handleMouseUp = (e) => {
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
  
  // Modified: Handle canvas click to select a point or add marker
  const handleCanvasClick = (e) => {
    if (!mapData || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Calculate click position relative to the canvas with rotation and flip adjustments
    let x, y;
    
    // Get position relative to canvas in displayed state
    const relX = (e.clientX - canvasRect.left) / scale;
    const relY = (e.clientY - canvasRect.top) / scale;
    
    // 2. Handle rotation
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
      // const index = y * mapData.header.width + x;
      const index = (mapData.header.height - y - 1) * mapData.header.width + x;
      const value = mapData.decompressedData[index];
      let room_id; // Use 'let' since we'll be reassigning this variable

      if (value === 254 || value === 253) {
        room_id = "Invalid Position";
      } else if (value === 252) {
        room_id = "Wall";
      } else {
        room_id = `Room ${value}`;
      }
      
      // Calculate world coordinates
      const worldX = mapData.header.origin_x + (x * mapData.header.resolution);
      // const worldY = mapData.header.origin_y + (y * mapData.header.resolution);
      const worldY = mapData.header.origin_y + ((mapData.header.height - y - 1) * mapData.header.resolution);
      
      setSelectedPoint({
        x,
        y,
        index,
        value,
        room_id,
        worldX: worldX.toFixed(2),
        worldY: worldY.toFixed(2)
      });
      
      // Add marker if marking is enabled
      if (isMarkingEnabled) {
        // Add the new marker
        const newMarker = {
          id: Date.now(), // Use timestamp as unique ID
          x,
          y,
          worldX: worldX.toFixed(2),
          worldY: worldY.toFixed(2),
          label: `${mp.length + 1}`
        };
        
        setMarkedPositions(prev => [...prev, newMarker]);
        setMP(prev => [...prev, newMarker]);
      }
    }
  };
        
        
  // Function to handle rotation
  const handleRotate = () => {
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

  // Add a function to center the map in the container
  const centerMapInContainer = () => {
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
  
        
  // First useEffect for drawing the map
  useEffect(() => {
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
          // const pixelIndex = (y * width + x) * 4;
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
  }, [mapData]);

  // Draw the grid lines and the origin
  useEffect(() => {
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
      // const y = Math.round((worldY - mapData.header.origin_y) / mapData.header.resolution);
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
  }, [mapData]);

  // Fetch the map data from the server
  useEffect(() => {
    const fetchMapData = async () => {
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
    
    fetchMapData();
  }, [selectedMapID]); // Add selectedMapID to dependency array
  
  // Setup event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleZoom);
    }
    
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleZoom);
      }
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, dragStart, position, isMarkingEnabled]);
  
  return (
    <div className="flex flex-col w-full h-full">
      <div 
        ref={containerRef}
        className="relative flex-grow border border-gray-300 overflow-hidden bg-gray-100"
        style={{ 
          cursor: isDragging 
            ? 'grabbing' 
            : isMarkingEnabled 
              ? 'crosshair' 
              : 'grab'
        }}
      >
      <div 
        className="absolute top-1/4"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
          transformOrigin: 'center center',
        }}
        onMouseDown={handleMouseDown}
      >
      <canvas 
        ref={canvasRef}
        style={{ 
          maxWidth: '100%', 
          maxHeight: '100%',
          display: 'block',
          imageRendering: 'pixelated' // Make crisp pixels when zoomed
        }}
      />
          
      {markedPositions.map(marker => (
        <div
          key={marker.id}
          className="absolute"
          style={{
            left: marker.x - 5, // Offset to center icon
            top: marker.y - 5,  // Offset to point bottom of icon to exact location
            pointerEvents: 'none', // Allow clicks to pass through
          }}
        >
          <div className="flex flex-col items-center">
            <FaXmark size={7} color="black" />
          </div>
        </div>
      ))}
      </div>
        
      {selectedPoint && (
        <div 
          className="absolute bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm pointer-events-none"
          style={{
            left: 10,
            bottom: 10,
          }}
        >
          <div>Coordinates: ({selectedPoint.worldX}, {selectedPoint.worldY}) m</div>
          <div>room_id: {selectedPoint.room_id}</div>
        </div>
      )}
      </div>
      
      <div className="flex m-2 gap-2 text-white text-sm">
        <button 
          className="px-3 py-1 bg-blue-500 rounded"
          onClick={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
            setRotation(0);
            centerMapInContainer();
          }}
        >
          Reset View
        </button>
        <button 
          className="px-3 py-1 bg-green-500 rounded"
          onClick={handleRotate}
        >
          Rotate 90°
        </button>
        
        <div className="px-3 py-1 bg-gray-100 rounded text-black">
          Zoom: {Math.round(scale * 100)}%
        </div>
        
        <button 
          className="px-3 py-1 bg-black rounded"
          onClick={() => {
            setMarkedPositions([]);
            setMP([]);
          }}        
         >
          Clear All Markers
        </button>
      </div>
      
    </div>
  );
};

export default MapVisualization;