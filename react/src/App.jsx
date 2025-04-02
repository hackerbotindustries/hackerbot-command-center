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
// This script is the main component for the Hackerbot Command Center React
// Frontend.
//
// Special thanks to the following for their code contributions to this codebase:
// Allen Chien - https://github.com/AllenChienXXX
//################################################################################


import { useState } from "react";
import NavigationTabs from "./components/NavigationTabs";
import Sidebar from "./components/Sidebar";
import MapArea from "./components/MapArea";

const App = () => {
  const [actionTab, setActionTab] = useState("Maps");
  const [selectedMapID, setSelectedMapID] = useState(null);
  const [markedPositions, setMarkedPositions] = useState([]);

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white text-black text-center py-2 text-xl font-bold">
        Hackerbot Command Center
      </header>
      <NavigationTabs setActionTab={setActionTab} />

      <div className="flex flex-1 overflow-hidden bg-gray-200">
        <Sidebar actionTab={actionTab} setSelectedMapID={setSelectedMapID} setMarkedPositions={setMarkedPositions} markedPositions={markedPositions} selectedMapID={selectedMapID} />
        
        <MapArea actionTab={actionTab} selectedMapID={selectedMapID} setMarkedPositions={setMarkedPositions} markedPositions={markedPositions}/>
      </div>
    </div>
  );
};

export default App;
