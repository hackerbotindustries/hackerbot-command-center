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
// This script is the main component for the Navigation Tabs.
//
// Special thanks to the following for their code contributions to this codebase:
// Allen Chien - https://github.com/AllenChienXXX
//
//################################################################################


import { useState } from "react";
import { FaMapLocationDot } from "react-icons/fa6";
import { TbMapPinX } from "react-icons/tb";
import { IoMdNavigate } from "react-icons/io";

const NavigationTabs = ({ setActionTab }) => {
  const [menuTab, setMenuTab] = useState("Mapping");
  const [currTab, setCurrTab] = useState("Maps");

  const handleActionTab = (action) => {
    setActionTab(action);
    setCurrTab(action);
  };

  return (
    <div>
      <div className="flex justify-right bg-[#25BB55] gap-0.5 pr-200">
        {/* {["Mapping", "Grab", "Lazy_Susan"].map((tab) => ( */}
        {["Mapping"].map((tab) => (
          <button
            key={tab}
            onClick={() => setMenuTab(tab)}
            className={`inline-block py-2 px-4 text-black 
              ${menuTab === tab ? "bg-[#70E061] border-b-2 border-black-600" : "bg-[#D1F8D3]"} 
              hover:text-black hover:border-b-2 border-black-600 basis-1/3`}  
            // bg-[#70E061] hover:text-black hover:border-b-2 border-black-600 basis-1/3"
          >
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="bg-[#DEE9BE] text-[#757575] border border-b-black">
        {menuTab === "Mapping" && (
          <div className="flex gap-4 px-10 py-2">
            <button onClick={() => handleActionTab("Maps")} className={`pr-4 hover:text-black flex flex-col items-center ${currTab === "Maps" ? "text-black" : "text-gray-500"}`}><FaMapLocationDot size={20} />Maps</button>
            <button onClick={() => handleActionTab("Mark")} className={`pr-4 hover:text-black flex flex-col items-center ${currTab === "Mark" ? "text-black" : "text-gray-500"}`}><TbMapPinX size={20} />Mark</button>
            <button onClick={() => handleActionTab("GOTO")} className={`pr-4 hover:text-black flex flex-col items-center ${currTab === "GOTO" ? "text-black" : "text-gray-500"}`}><IoMdNavigate size={20} /> GOTO</button>
          </div>
        )}
        {/* {menuTab === "Grab" && (
          <div className="flex gap-4 px-10 py-2">
            <button onClick={() => handleActionTab("Pick")} className={`pr-4 hover:text-black flex flex-col items-center ${currTab === "Pick" ? "text-black" : "text-gray-500"}`}><svg class="h-4 w-4"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />  <circle cx="8.5" cy="7" r="4" />  <polyline points="17 11 19 13 23 9" /></svg>Pick</button>
            <button onClick={() => handleActionTab("Drop")} className={`pr-4 hover:text-black flex flex-col items-center ${currTab === "Drop" ? "text-black" : "text-gray-500"}`}><svg class="h-4 w-4"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />  <circle cx="8.5" cy="7" r="4" />  <polyline points="17 11 19 13 23 9" /></svg>Drop</button>
            <button onClick={() => handleActionTab("Reset")} className={`pr-4 hover:text-black flex flex-col items-center ${currTab === "Reset" ? "text-black" : "text-gray-500"}`}><svg class="h-4 w-4"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />  <circle cx="8.5" cy="7" r="4" />  <polyline points="17 11 19 13 23 9" /></svg>Reset</button>
          </div>
        )}
        {menuTab === "Lazy_Susan" && (
          <div className="flex gap-4 px-10 py-2">
            <button onClick={() => handleActionTab("Rotate")} className={`pr-4 hover:text-black flex flex-col items-center ${currTab === "Rotate" ? "text-black" : "text-gray-500"}`}><svg class="h-4 w-4"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />  <circle cx="8.5" cy="7" r="4" />  <polyline points="17 11 19 13 23 9" /></svg>Rotate</button>
            <button onClick={() => handleActionTab("Stop")} className={`pr-4 hover:text-black flex flex-col items-center ${currTab === "Stop" ? "text-black" : "text-gray-500"}`}><svg class="h-4 w-4"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />  <circle cx="8.5" cy="7" r="4" />  <polyline points="17 11 19 13 23 9" /></svg>Stop</button>
            <button onClick={() => handleActionTab("Reset")} className={`pr-4 hover:text-black flex flex-col items-center ${currTab === "Reset" ? "text-black" : "text-gray-500"}`}><svg class="h-4 w-4"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />  <circle cx="8.5" cy="7" r="4" />  <polyline points="17 11 19 13 23 9" /></svg>Reset</button>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default NavigationTabs;
