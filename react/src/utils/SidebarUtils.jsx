import { useState, useEffect, useRef } from "react";

export const useSidebarLogic = (setSelectedMapID, markedPositions, setMarkedPositions) => {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [statusHistory, setStatusHistory] = useState([]);
  const [mapList, setMapList] = useState([]);
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [lastSavedMarkers, setLastSavedMarkers] = useState(null);

  const [sidebarWidth, setSidebarWidth] = useState(20);
  const [statusBarHeight, setStatusBarHeight] = useState(25);
  
  const [isResizingWidth, setIsResizingWidth] = useState(false);
  const [isResizingHeight, setIsResizingHeight] = useState(false);

  const sidebarRef = useRef(null);
  const resizeWidthHandleRef = useRef(null);
  const resizeHeightHandleRef = useRef(null);

  const loadMarkers = async (mapId) => {
    try {
      const response = await fetch(`/api/load-markers/${mapId}`);
      if (!response.ok) {
        throw new Error('Failed to load markers');
      }
      const data = await response.json();
      setMarkedPositions(data.markers);
      setLastSavedMarkers(data.markers);
      setSaveButtonText('Save');
    } catch (error) {
      console.error('Error loading markers:', error);
    }
  };

  const loadMap = (mapId) => {
    console.log("Loading map:", mapId);
    setSelectedMapID(mapId);
    loadMarkers(mapId);
  };

  const clearStatusHistory = () => {
    setStatusHistory([]);
  };

  const saveMarkers = async (markedPositions, selectedMapID) => {
    try {
      setSaveButtonText('Saving...');
      const response = await fetch('/api/save-markers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          map_id: selectedMapID,
          markers: markedPositions.filter(marker => marker.map_id === selectedMapID)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save markers');
      }

      const data = await response.json();
      setLastSavedMarkers(markedPositions);
      setSaveButtonText('Saved!');
    } catch (error) {
      console.error('Error saving markers:', error);
      setSaveButtonText('Error');
      setTimeout(() => setSaveButtonText('Save'), 1000);
    }
  };

  // Effect to check if markers have changed from last saved state
  useEffect(() => {
    if (lastSavedMarkers) {
      const markersChanged = JSON.stringify(lastSavedMarkers) !== JSON.stringify(markedPositions);
      if (markersChanged) {
        setSaveButtonText('Save');
      }
    }
  }, [markedPositions, lastSavedMarkers]);

  useEffect(() => {
    fetch("/api/status")
      .then(response => response.json())
      .then(data => {
        console.log("Received status:", data);
        if (data.status !== "None") {
          setStatus(data);
        }
      });
  }, []);

  useEffect(() => {
    fetch("/api/error")
      .then(response => response.json())
      .then(data => {
        console.log("Received error:", data);
        if (data.error !== "None") {
          setError(data);
        }
      });
  }, []);

  useEffect(() => {
    setStatusHistory(prev => {
      const lastStatusEntry = [...prev].reverse().find(entry => entry.startsWith("Executing:"));
      const lastErrorEntry = [...prev].reverse().find(entry => entry.startsWith("Error:"));

      const newStatusText = status?.status ? `Executing: ${status.status}` : null;
      const newErrorText = error?.error ? `Error: ${error.error}` : null;

      if (newStatusText && newStatusText !== lastStatusEntry) {
        return [...prev, newStatusText];
      }

      if (newErrorText && newErrorText !== lastErrorEntry) {
        return [...prev, newErrorText];
      }

      return prev;
    });
  }, [status, error]);

  useEffect(() => {
    const fetchData = async (retryCount = 0, maxRetries = 5, delay = 2000) => {
      try {
        const response = await fetch("/api/getml");
        
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        console.log("Received maps:", data);
        
        if (data.map_list === null || data.map_list === undefined) {
          setError("No map list found, please create a map first!");
          setMapList([]);
          return;
        }
        
        setMapList(data.map_list);
        if (data.map_list.length > 0) {
          setSelectedMapID(data.map_list[0]);
        }
      } catch (error) {
        console.error("Error fetching map list:", error);
        
        if (retryCount < maxRetries) {
          console.log(`Retrying (${retryCount + 1}/${maxRetries}) in ${delay}ms...`);
          setTimeout(() => {
            fetchData(retryCount + 1, maxRetries, delay);
          }, delay);
        }else{
          setError("Error fetching map list, is flask-api running?");
        }
      }
    };

    fetchData();
  }, [setSelectedMapID]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingWidth) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        setSidebarWidth(Math.min(Math.max(newWidth, 10), 50));
      }
      
      if (isResizingHeight) {
        if (!sidebarRef.current) return;
        const sidebarHeight = sidebarRef.current.getBoundingClientRect().height;
        const newHeight = ((sidebarRef.current.getBoundingClientRect().bottom - e.clientY) / sidebarHeight) * 100;
        setStatusBarHeight(Math.min(Math.max(newHeight, 10), 50));
      }
    };

    const handleMouseUp = () => {
      setIsResizingWidth(false);
      setIsResizingHeight(false);
    };

    if (isResizingWidth || isResizingHeight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingWidth, isResizingHeight]);

  return {
    status,
    error,
    statusHistory,
    mapList,
    sidebarWidth,
    statusBarHeight,
    sidebarRef,
    resizeWidthHandleRef,
    resizeHeightHandleRef,
    isResizingWidth,
    isResizingHeight,
    setIsResizingWidth,
    setIsResizingHeight,
    loadMap,
    clearStatusHistory,
    saveMarkers,
    saveButtonText,
  };
};
