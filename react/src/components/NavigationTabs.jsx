import { useState } from "react";

const NavigationTabs = ({ setActionTab }) => {
  const [menuTab, setMenuTab] = useState("Mapping");
  const [connectTab, setConnectTab] = useState("Mark");
  const [currTab, setCurrTab] = useState("Mark");

  const handleActionTab = (action) => {
    if (action === "Connect") {
      setConnectTab("Connect"); // Reset Connect tab text
    }else{
      setConnectTab("Reset"); // Reset Connect tab text
    }
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
            {/* <button onClick={() => handleActionTab("Connect")} className={`pr-4 hover:text-black flex flex-col items-center ${currTab === "Connect" ? "text-black" : "text-gray-500"}`}><svg class="h-4 w-4"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />  <circle cx="8.5" cy="7" r="4" />  <polyline points="17 11 19 13 23 9" /></svg>{connectTab}</button> */}
            <button onClick={() => handleActionTab("Mark")} className={`pr-4 hover:text-black flex flex-col items-center ${currTab === "Mark" ? "text-black" : "text-gray-500"}`}><svg class="h-4 w-4"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />  <circle cx="12" cy="10" r="3" /></svg>Mark</button>
            {/* <button onClick={() => handleActionTab("GOTO")} className={`pr-4 hover:text-black flex flex-col items-center ${currTab === "GOTO" ? "text-black" : "text-gray-500"}`}><svg class="h-4 w-4 "  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <polygon points="12 2 19 21 12 17 5 21 12 2" /></svg>GOTO</button> */}
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
