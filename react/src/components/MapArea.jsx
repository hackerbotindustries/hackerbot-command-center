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
// This script is the main component for the Map Area.
//
// Special thanks to the following for their code contributions to this codebase:
// Allen Chien - https://github.com/AllenChienXXX
//
//################################################################################


import LegendTab from "./LegendTab";
import MapVisualization from "./InteractiveMap";

const MapArea = ({ actionTab, selectedMapID, setMarkedPositions, markedPositions }) => {
    
  
  return (
    <div className="relative w-4/5 mx-5 mt-2">
      <LegendTab />
      <MapVisualization isMarkingEnabled={actionTab === 'Mark'} setMarkedPositions={setMarkedPositions} selectedMapID={selectedMapID} markedPositions={markedPositions}/>
    </div>
  );
};

export default MapArea;
