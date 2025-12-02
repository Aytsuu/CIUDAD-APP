import { useState, useEffect } from "react";

interface MaternalTabProps {
   onTabChange: (tab: string) => void;
   pendingCount?: number;
   activeTab?: string;
}

export default function MaternalTab({ onTabChange, pendingCount = 0, activeTab = "records" }: MaternalTabProps): JSX.Element {
   const [selectedTab, setSelectedTab] = useState(activeTab);

   // Sync selectedTab with activeTab prop when it changes
   useEffect(() => {
      setSelectedTab(activeTab);
   }, [activeTab]);

   const handleTabChange = (tab: string) => {
      setSelectedTab(tab);
      onTabChange(tab);
   }

   const getTabStyle = (tab: string) => {
      const baseClasses = "flex justify-center items-center cursor-pointer text-black/70 transition-colors duration-200 ease-in-out rounded-md p-2 h-[32px] w-[150px]";
		
		if (selectedTab === tab) {
			// Active tab styles	
			return `${baseClasses} bg-white shadow-md border text-blue-500`;
		} else {
			// Inactive tab styles
			return `${baseClasses} bg-blue-50 text-gray-500 hover:text-black`;
		}
   }

   return (
      <div className="flex flex-col w-full">
         <div className="rounded-md">
					<div className="flex">
						<div className="flex flex-row bg-blue-50 p-1 rounded-md gap-2">
							<div
								className={getTabStyle("records")}
								onClick={() => handleTabChange("records")}
							>
								<h2 className="text-sm font-semibold">Records</h2>
							</div>
							<div
								className={getTabStyle("appointments")}
								onClick={() => handleTabChange("appointments")}
							>
								<h2 className="text-sm font-semibold">Appointments</h2>
								{pendingCount > 0 && (
									<span className="ml-2 rounded-full bg-red-500 text-white px-2 py-0.5 text-xs font-medium">
										{pendingCount}
									</span>
								)}
							</div>		
						</div>
					</div>
				</div>
      </div>
   )
}