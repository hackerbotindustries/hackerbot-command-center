import { useEffect, useState, useRef } from "react";
import { IoLocationSharp } from 'react-icons/io5';
import { FaRegMap } from "react-icons/fa";

const Sidebar = ({ actionTab, setSelectedMapID, markedPositions }) => {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [statusHistory, setStatusHistory] = useState([]);
  const [mapList, setMapList] = useState([]);
  
  // State for sidebar width and status bar height
  const [sidebarWidth, setSidebarWidth] = useState(20); // 20% default width
  const [statusBarHeight, setStatusBarHeight] = useState(25); // 25% default height
  
  // States for tracking resize operations
  const [isResizingWidth, setIsResizingWidth] = useState(false);
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  
  // Refs for the component
  const sidebarRef = useRef(null);
  const resizeWidthHandleRef = useRef(null);
  const resizeHeightHandleRef = useRef(null);

  // Function to load a map
  const loadMap = (mapId) => {
    console.log("Loading map:", mapId);
    setSelectedMapID(mapId);
  };
  
  const clearStatusHistory = () => {
    setStatusHistory([]);
  };

  // Fetch status
  useEffect(() => {
    fetch("/api/status")
      .then(response => response.json())
      .then(data => {
        console.log("Received status:", data);
        if (data.status != status.status && data.status != "None") {
          setStatus(data);
        }
      })
  }, []);

  // Fetch error
  useEffect(() => {
    fetch("/api/error")
      .then(response => response.json())
      .then(data => {
        console.log("Received error:", data);
        if (data.error === "None") {
          return
        }
        setError(data);
      })
  }, []);

  // Update status history
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
  
  // Fetch map list
  useEffect(() => {
    const fetchData = async (retryCount = 0, maxRetries = 5, delay = 2000) => {
      try {
        const response = await fetch("/api/getml");
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Received maps:", data);
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
        } else {
          console.error("Maximum retry attempts reached.");
        }
      }
    };

    fetchData();
  }, [setSelectedMapID]);

  // Handle mouse events for width resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingWidth) {
        // Calculate new width based on mouse position
        const newWidth = (e.clientX / window.innerWidth) * 100;
        // Limit width between 10% and 50%
        const clampedWidth = Math.min(Math.max(newWidth, 10), 50);
        setSidebarWidth(clampedWidth);
      }
      
      if (isResizingHeight) {
        if (!sidebarRef.current) return;
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        const sidebarHeight = sidebarRect.height;
        
        // Calculate distance from bottom of sidebar
        const distanceFromBottom = sidebarRect.bottom - e.clientY;
        // Convert to percentage of sidebar height
        const newHeight = (distanceFromBottom / sidebarHeight) * 100;
        // Limit height between 10% and 50%
        const clampedHeight = Math.min(Math.max(newHeight, 10), 50);
        setStatusBarHeight(clampedHeight);
      }
    };

    // Handle mouse up
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

  return (
    <div 
      ref={sidebarRef}
      className="bg-white flex flex-col relative text-sm" 
      style={{ width: `${sidebarWidth}%` }}
    >
      {/* Width resize handle */}
      <div 
        ref={resizeWidthHandleRef}
        className="absolute top-0 right-0 w-1 h-full cursor-ew-resize border-4 border-gray-200"
        onMouseDown={(e) => {
          e.preventDefault(); // Prevents text selection
          setIsResizingWidth(true);
        }}      />
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        {actionTab === "Mark" && (
          <div className="p-2 rounded-lg">
            <div className="pb-2 mb-3 border-b-2 border-gray-800">
              <span className="font-bold text-black">Map List</span>
            </div>
            <ul className="py-1 space-y-1">
              {mapList && mapList.length > 0 ? (
                mapList.map((mapId, index) => (
                  <li key={index}>
                    <a href="#" className="flex items-center w-full p-2 transition duration-75 rounded-lg group hover:bg-gray-100 hover:text-blue-500">
                      <FaRegMap className="mr-1" />
                      {mapId}
                      <button 
                        className="ml-auto px-3 hidden group-hover:inline-block bg-blue-500 text-white rounded-lg" 
                        onClick={(e) => {
                          e.preventDefault();
                          loadMap(mapId);
                        }}
                      >
                        Load
                      </button>
                    </a>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-500">Loading...</li>
              )}
            </ul>
    
            <div className="pb-2 mb-3 border-b-2 border-gray-800">
              <span className="font-bold text-black">Markers</span>
            </div>
            <ul className="py-1 space-y-1">
              {markedPositions && markedPositions.length > 0 ? (
                markedPositions.map(marker => (
                  <li key={marker.id}>
                    <a href="#" className="flex items-center w-full p-2 transition duration-75 rounded-lg group hover:bg-gray-100 hover:text-blue-500">
                      <IoLocationSharp className="mr-1" />
                      {marker.label}: ({marker.worldX}, {marker.worldY})
                    </a>
                  </li>
                ))
              ) : (
                <li>
                  <span className="flex items-center w-full p-2 transition duration-75 rounded-lg text-gray-500">
                    No marked positions
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    
      {/* Height resize handle */}
      <div 
        ref={resizeHeightHandleRef}
        className="w-full h-1 cursor-ns-resize"
        onMouseDown={() => setIsResizingHeight(true)}
      />
      
      {/* Fixed status bar at bottom with adjustable height */}
      <div 
        className="Fixed border-t-6 border-gray-200 p-1 overflow-y-auto"
        style={{ height: `${statusBarHeight}%` }}
      >
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <div className="font-bold text-black-800">Status History</div>
          <button 
            className="bg-gray-500 text-white px-4 py-0 mr-2 rounded hover:bg-red-700"
            onClick={clearStatusHistory}
          >
            Clear
          </button>
        </div>
      </div>

        <div>
          {statusHistory.map((entry, index) => (
            <div key={index}>{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;


{/* {actionTab === "GOTO" && (
  <div>
    <span class="text-black flex-1 ms-3 text-left font rtl:text-right whitespace-nowrap">GOTO Position</span>
  <ul className="block py-2 space-y-2">
      <li>
          <a href="#" class="flex items-center w-full p-2 transition duration-75 rounded-lg  group hover:bg-gray-100 hover:text-blue-500 ">
          X
          </a>
      </li>
      <li>
          <a href="#" class="flex items-center w-full p-2 transition duration-75 rounded-lg  group hover:bg-gray-100 hover:text-blue-500 ">
          Y
          </a>
      </li>
      <li>
          <a href="#" class="flex items-center w-full p-2 transition duration-75 rounded-lg  group hover:bg-gray-100 hover:text-blue-500 ">
          Orientation
          </a>
      </li>
  </ul>
  </div>
)} */}

{/* {actionTab === "Connect" && (
<div className="p-4 rounded-lg shadow-sm">
<div className="flex items-center pb-2 mb-3 border-b-2 border-gray-800">
  <span className="text-lg font-bold text-black">Map List</span>
</div>
<ul className="block py-2 space-y-2">
  {mapList.length > 0 ? (
    mapList.map((mapId, index) => (
      <li key={index}>
        <a href="#" className="flex items-center w-full p-2 transition duration-75 rounded-lg  group hover:bg-gray-100 hover:text-blue-500">
          {mapId}
          <button className="ml-auto px-3 hidden group-hover:inline-block bg-blue-500 text-white rounded-lg" onClick={() => loadMap(mapId)}>
            Load
          </button>
        </a>
      </li>
    ))
  ) : (
    <li className="text-center text-gray-500">Loading...</li>
  )}
</ul>
</div>
)} */}