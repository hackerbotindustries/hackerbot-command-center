//################################################################################
// Copyright (c) 2025 Hackerbot Industries LLC
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.
//
// Created By: Allen Chien
// Created:    April 2025
// Updated:    2025.04.17
//
// This script is the main component for the Interactive Map.
//
// Special thanks to the following for their code contributions to this codebase:
// Allen Chien - https://github.com/AllenChienXXX
//################################################################################


import React, { useState, useEffect, useRef } from 'react';
import { FaXmark } from "react-icons/fa6";
import { SiProbot } from "react-icons/si";

import * as Interaction from '../utils/Interaction';

import * as Drawing from '../utils/Drawing';

import * as CanvasHelper from '../utils/CanvasHelper';

import * as MapApi from '../utils/MapApi';

import * as Markers from '../utils/Markers';

const MapVisualization = ({ isMarkingEnabled = false, selectedMapID, setMarkedPositions, markedPositions }) => {
  const [mapData, setMapData] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const [selectedPoint, setSelectedPoint] = useState(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [robotPose, setRobotPose] = useState({ x: 0, y: 0, angle: 0 });

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const robotImgRef = useRef(null);
  
  // Wrapper functions that bind the state to the utility functions
  const handleZoom = (e) => {
    Interaction.handleZoom(e, containerRef, position, setPosition, setScale);
  };
  
  const handleMouseDown = (e) => {
    Interaction.handleMouseDown(e, setIsDragging, position, setDragStart);
  };
  
  const handleMouseMove = (e) => {
    Interaction.handleMouseMove(e, isDragging, dragStart, setPosition);
  };
  
  const handleCanvasClick = (e) => {
    Markers.handleCanvasClick(
      e, 
      mapData, 
      canvasRef, 
      scale, 
      rotation, 
      setSelectedPoint, 
      isMarkingEnabled, 
      setMarkedPositions,
      markedPositions,
      selectedMapID
    );
  };
  
  const handleMouseUp = (e) => {
    Interaction.handleMouseUp(e, isDragging, setIsDragging, canvasRef, handleCanvasClick);
  };
  
  const handleRotate = () => {
    CanvasHelper.handleRotate(setRotation, canvasRef, containerRef, scale, setPosition);
  };
  
  const centerMapInContainer = () => {
    CanvasHelper.centerMapInContainer(canvasRef, containerRef, rotation, setScale, setPosition);
  };
  
  const resetView = () => {
    CanvasHelper.resetView(setScale, setPosition, setRotation, centerMapInContainer);
  };
  
  const clearAllMarkers = () => {
    Markers.clearAllMarkers(setMarkedPositions);
  };

  // Effect for drawing the map
  useEffect(() => {
    Drawing.drawMapData(mapData, canvasRef, centerMapInContainer);
  }, [mapData]);

  // Effect for drawing grid lines and origin
  useEffect(() => {
    Drawing.drawGridAndOrigin(mapData, canvasRef);
  }, [mapData]);

  // Effect for fetching map data
  useEffect(() => {
    MapApi.fetchMapData(selectedMapID, setMapData);
  }, [selectedMapID]);

  useEffect(() => {
    const interval = setInterval(() => {
      MapApi.fetchRobotPositions(setRobotPose);
    }, 1000); // fetch every 1000 ms (1 second)
  
    return () => clearInterval(interval); // cleanup when component unmounts
  }, []);
  
  
  // Effect for setting up event listeners
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
              imageRendering: 'pixelated',
              imageRendering: 'crisp-edges',
            }}
          />
              
          {markedPositions.filter(marker => marker.map_id === selectedMapID).map(marker => (
            <div
              key={marker.id}
              className="absolute"
              style={{
                left: marker.x - 3, // Offset to center icon
                top: marker.y - 3,  // Offset to point bottom of icon to exact location
                pointerEvents: 'none', // Allow clicks to pass through
              }}
            >
              <div className="flex flex-col items-center">
                <button
                  onClick={() => {
                    setMarkedPositions(prev =>
                      prev.map(m => 
                        m.id === marker.id ? { ...m, selected: !m.selected } : m
                      )
                    );
                  }}
                  className="focus:outline-none"
                  style={{ pointerEvents: 'auto' }} // Enable click interaction
                    >
                  <FaXmark size={7} color={marker.selected ? "blue" : "black"} />
                </button>
              </div>
            </div>
          ))}
          {robotPose && mapData && (
            <div
              className="absolute"
              style={{
                left: (robotPose.x - mapData.header.origin_x) / mapData.header.resolution - 16,
                top: mapData.header.height - (robotPose.y - mapData.header.origin_y) / mapData.header.resolution -12,
                pointerEvents: 'none',
                transform: `rotate(${robotPose.angle}deg)`,
                transformOrigin: 'center',
              }}
            >
              <div className="flex flex-col items-center">
                <SiProbot size={16} color="black" />
              </div>
            </div>
          )}
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
          onClick={resetView}
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
          onClick={clearAllMarkers}
        >
          Clear All Markers
        </button>
      </div>
    </div>
  );
};

export default MapVisualization;