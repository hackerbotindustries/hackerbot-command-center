import { IoLocationSharp } from 'react-icons/io5';
import { FaXmark } from "react-icons/fa6";
import { FaRegMap } from "react-icons/fa";
import { useSidebarLogic } from "../utils/SidebarUtils"; // Import extracted logic

const Sidebar = ({ actionTab, setSelectedMapID, setMarkedPositions, markedPositions }) => {
  const {
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
  } = useSidebarLogic(setSelectedMapID);

  return (
    <div ref={sidebarRef} className="bg-white flex flex-col relative text-sm" style={{ width: `${sidebarWidth}%` }}>
      <div 
        ref={resizeWidthHandleRef}
        className="absolute top-0 right-0 w-1 h-full cursor-ew-resize border-4 border-gray-200"
        onMouseDown={(e) => { e.preventDefault(); setIsResizingWidth(true); }}
      />
      
      <div className="flex-1 overflow-y-auto">
        {actionTab === "Mark" && (
          <div className="p-2 rounded-lg">
            <div className="pb-2 mb-3 border-b-2 border-gray-800">
              <span className="font-bold text-black">Map List</span>
            </div>
            <ul className="py-1 space-y-1">
              {mapList.length > 0 ? (
                mapList.map((mapId, index) => (
                  <li key={index}>
                    <a href="#" className="flex items-center w-full p-2 transition duration-75 rounded-lg group hover:bg-gray-100 hover:text-blue-500">
                      <FaRegMap className="mr-1" />
                      {mapId}
                      <button className="ml-auto px-3 hidden group-hover:inline-block bg-blue-500 text-white rounded-lg" onClick={(e) => { e.preventDefault(); loadMap(mapId); }}>
                        Load
                      </button>
                    </a>
                  </li>
                ))
              ) : <li className="text-center text-gray-500">Loading...</li>}
            </ul>
            {/* Markers List */}
            <div className="pb-2 mb-3 border-b-2 border-gray-800">
              <span className="font-bold text-black">Markers</span>
            </div>
            <ul className="py-1 space-y-1">
              {markedPositions && markedPositions.length > 0 ? (
                markedPositions.map(marker => (
                  <li key={marker.id}>
                   <button className={`flex items-center w-full p-2 transition duration-75 rounded-lg group ${marker.selected ? 'bg-blue-100 text-blue-500' : 'hover:bg-gray-100 hover:text-blue-500'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setMarkedPositions((prev) =>
                        prev.map((m) =>
                          m.id === marker.id ? { ...m, selected: !m.selected } : m
                        )
                      );
                    }}
                  >
                    <FaXmark className="mr-1" />
                    <input
                      type="text"
                      value={marker.label}
                      className="w-auto min-w-0 max-w-[100px] px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()} // Prevents toggling 'selected' when editing text
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        setMarkedPositions((prev) =>
                          prev.map((m) => (m.id === marker.id ? { ...m, label: newLabel } : m))
                        );
                      }}
                    />
                    : ({marker.worldX}, {marker.worldY})
                      <button
                        className="ml-auto px-2 hidden group-hover:inline-block bg-red-500 text-white rounded-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation(); // Prevents selecting the marker when clicking 'Remove'
                          setMarkedPositions((prev) => prev.filter((m) => m.id !== marker.id));
                        }}
                      >
                        Remove
                      </button>
                    </button>
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

      <div ref={resizeHeightHandleRef} className="w-full h-1 cursor-ns-resize" onMouseDown={() => setIsResizingHeight(true)} />
      
      <div className="Fixed border-t-6 border-gray-200 p-1 overflow-y-auto" style={{ height: `${statusBarHeight}%` }}>
        <div className="flex justify-between items-center">
          <div className="font-bold text-black-800">Status History</div>
          <button className="bg-gray-500 text-white px-4 py-0 mr-2 rounded hover:bg-red-700" onClick={clearStatusHistory}>
            Clear
          </button>
        </div>
        {statusHistory.map((entry, index) => <div key={index}>{entry}</div>)}
      </div>
    </div>
  );
};

export default Sidebar;
