import LegendTab from "./LegendTab";
import MapVisualization from "./InteractiveMap";
import React, { useState, useEffect } from "react";

const MapArea = ({ actionTab, selectedMapID, setMarkedPositions }) => {
    
  
  return (
    <div className="relative w-4/5 mx-5 mt-2">
      <LegendTab />
      <MapVisualization isMarkingEnabled={actionTab === 'Mark'} setMarkedPositions={setMarkedPositions} selectedMapID={selectedMapID}/>
    </div>
  );
};

export default MapArea;
