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
// This script is the main component for the Legend Tab.
//
// Special thanks to the following for their code contributions to this codebase:
// Allen Chien - https://github.com/AllenChienXXX
//
//################################################################################


import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { RiAddCircleFill } from "react-icons/ri";
import { FaXmark } from "react-icons/fa6";
import { FaArrowAltCircleDown } from "react-icons/fa";


const LegendTab = ({ isCollapsible = true }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const legendEntries = [
    // { icon: RiBatteryChargeLine, label: "Charger", icon_color: "text-green-500" },
    { icon: FaPlus,label: "Origin (0, 0)", icon_color: "text-[#FF0000]" },
    { icon: FaArrowAltCircleDown, label: "Robot Position", icon_color: "text-black" },
    { icon: FaXmark, label: "Marker", icon_color: "text-blue" },
    
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