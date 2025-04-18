

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

  
  