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
// This script is the util component for the Canvas functions.
//
// Special thanks to the following for their code contributions to this codebase:
// Allen Chien - https://github.com/AllenChienXXX
//
//################################################################################


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

export const resetView = (setScale, setPosition, setRotation, centerMapInContainer) => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    centerMapInContainer();
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