import { useState } from "react";
import { FaBeer } from 'react-icons/fa'; // Font Awesome icons
import { RiBatteryChargeLine } from "react-icons/ri";
import { FaPlus } from "react-icons/fa6";
import { RiRobot2Fill } from "react-icons/ri";
import { IoLocationSharp } from "react-icons/io5";
import { TfiLocationArrow } from "react-icons/tfi";
import { RiAddCircleFill } from "react-icons/ri";





const LegendTab = ({ isCollapsible = true }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const legendEntries = [
    // { icon: RiBatteryChargeLine, label: "Charger", icon_color: "text-green-500" },
    { icon: FaPlus,label: "Origin (0, 0)", icon_color: "text-[#FF0000]" },
    // { icon: RiRobot2Fill, label: "Robot Position", icon_color: "text-[#E93273]" },
    { icon: IoLocationSharp, label: "Marked Position", icon_color: "text-blue" },
    // { icon: TfiLocationArrow, label: "Destination", icon_color: "text-[#900B09]" },
  ];

  return (
    <div className="absolute top-4 left-4 z-10 w-fit rounded-lg shadow-lg p-1">
      <div className="flex items-center justify-between mb-4">
        {isCollapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-[#FF9F1C] hover:bg-[#25BB55] rounded-full transition-colors duration-200"
          >
            {isExpanded ? (
              <RiAddCircleFill className="text-white" />
            ) : (
              <RiAddCircleFill className="text-white" />
            )}

          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-2">
          {legendEntries.map((entry, index) => (
            <div
              key={index}
              className="group flex items-center rounded-md transition-colors duration-200"
              role="listitem"
              tabIndex={0}
            >
              <entry.icon className={`mr-2 ${entry.icon_color} text-xl`} />
              <span className="ml-3">{entry.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LegendTab;