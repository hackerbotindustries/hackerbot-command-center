//################################################################################
// Copyright (c) 2025 Hackerbot Industries LLC
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.
//
// Created By: Allen Chien
// Created:    April 2025
// Updated:    2025.04.01
//
// This script is the main component for the Sidebar.
//
// Special thanks to the following for their code contributions to this codebase:
// Allen Chien - https://github.com/AllenChienXXX
//
//################################################################################

import { FaXmark } from "react-icons/fa6";
import { FaRegMap } from "react-icons/fa";
import { CiSquareInfo } from "react-icons/ci";
import { useSidebarLogic } from "../utils/SidebarUtils"; // Import extracted logic
import { handleGotoClick, handleDockClick } from '../utils/MapApi';
import { useState } from "react";

const Sidebar = ({ actionTab, setSelectedMapID, setMarkedPositions, markedPositions, selectedMapID }) => {
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
    saveMarkers,
    saveButtonText,
  } = useSidebarLogic(setSelectedMapID, markedPositions, setMarkedPositions);

  const [selectedIndex, setSelectedIndex] = useState('');

  const onGoClick = () => {
    if (selectedIndex === '') {
      alert('Please choose a position first.');
      return;
    }

    const pos = markedPositions[selectedIndex];
    handleGotoClick(pos);
  };

  


  return (
    <div ref={sidebarRef} className="bg-white flex flex-col relative text-sm" style={{ width: `${sidebarWidth}%` }}>
      <div 
        ref={resizeWidthHandleRef}
        className="absolute top-0 right-0 w-1 h-full cursor-ew-resize border-4 border-gray-200"
        onMouseDown={(e) => { e.preventDefault(); setIsResizingWidth(true); }}
      />
      
      <div className="flex-1 overflow-y-auto">
        {actionTab === "Maps" && (
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
          </div>
        )}
        {actionTab === "Mark" && (
          <div className="p-2 rounded-lg">
            {/* Markers List */}
            <div className="pb-2 mb-3 border-b-2 border-gray-800 flex justify-between items-center">
              <span className="font-bold text-black">Markers</span>
              <button 
                className="px-2 mr-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => saveMarkers(markedPositions, selectedMapID)}
              >
                {saveButtonText}
              </button>
            </div>
            <ul className="py-1 space-y-1">
              {markedPositions && markedPositions.length > 0 ? (
                markedPositions
                  .filter(marker => marker.map_id === selectedMapID)
                  .map(marker => (
                  <li key={marker.id}>
                   <div className={`flex items-center w-full p-2 transition duration-75 rounded-lg group ${marker.selected ? 'bg-blue-100 text-blue-500' : 'hover:bg-gray-100 hover:text-blue-500'}`}
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
                  </div>
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
        {actionTab === "GOTO" && (
        <div className="p-2 pr-4 rounded-lg relative pb-28">
          <div className="pb-2 mb-3 border-b-2 border-gray-800">
            <span className="font-bold text-black">Destination</span>
          </div>

          {/* Select + GO button row */}
          <div className="flex mb-6">
            <select
              id="position-select"
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none transition"
            >
              <option value="">Choose a position</option>
              {markedPositions.map((pos, index) => (
                <option key={index} value={index}>
                  {pos.label} ({pos.worldX}, {pos.worldY}, {pos.angle}°)
                </option>
              ))}
            </select>
            <button
              onClick={onGoClick}
              className="mx-2 w-fit px-4 py-1 rounded-xl font-semibold border border-black text-black bg-white transition-all duration-300 ease-in-out
              hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-600 hover:text-white hover:shadow-lg hover:scale-105"
            >
              GO
            </button>
          </div>

          {/* Centered round DOCK button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleDockClick}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold shadow-md hover:scale-110 transition-all duration-300"
              >
              DOCK
            </button>
          </div>
        </div>
        )}
      </div>

      <div ref={resizeHeightHandleRef} className="w-full h-1 cursor-ns-resize" onMouseDown={() => setIsResizingHeight(true)} />
      
      <div className="Fixed border-t-6 border-gray-200 p-1 overflow-y-auto" style={{ height: `${statusBarHeight}%` }}>
        <div className="flex justify-between items-center font-bold text-black-800 my-2">
          <div className="flex items-center">
            <CiSquareInfo className="mr-2" size={20} />
            Status History
          </div>
          <button
            className="px-4 py-1 mr-2 rounded hover:bg-red-700"
            onClick={clearStatusHistory}
          >
            Clear
          </button>
        </div>
        {statusHistory.map((entry, index) => <div key={index}>{entry}</div>)}
      </div>
    </div>
  );
};

export default Sidebar;
