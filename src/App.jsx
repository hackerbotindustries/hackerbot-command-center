import { useState } from "react";
import NavigationTabs from "./components/NavigationTabs";
import Sidebar from "./components/Sidebar";
import MapArea from "./components/MapArea";

const App = () => {
  const [actionTab, setActionTab] = useState("Mark");
  const [selectedMapID, setSelectedMapID] = useState(null);
  const [markedPositions, setMarkedPositions] = useState([]);

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white text-black text-center py-2 text-xl font-bold">
        Hackerbot Command Center
      </header>
      <NavigationTabs setActionTab={setActionTab} />

      <div className="flex flex-1 overflow-hidden bg-gray-200">
        <Sidebar actionTab={actionTab} setSelectedMapID={setSelectedMapID} markedPositions={markedPositions} />
        <MapArea actionTab={actionTab} selectedMapID={selectedMapID} setMarkedPositions={setMarkedPositions}/>
      </div>
    </div>
  );
};

export default App;
