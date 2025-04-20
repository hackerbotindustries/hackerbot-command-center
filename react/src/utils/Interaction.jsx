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
// This script is the util component for the Map Interaction.
//
// Special thanks to the following for their code contributions to this codebase:
// Allen Chien - https://github.com/AllenChienXXX
//
//################################################################################


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

