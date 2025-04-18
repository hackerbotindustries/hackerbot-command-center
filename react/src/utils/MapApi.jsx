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
  