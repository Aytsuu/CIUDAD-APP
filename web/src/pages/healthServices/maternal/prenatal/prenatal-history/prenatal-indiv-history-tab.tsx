"use client"

import { useState } from "react"

interface PrenatalHistoryProps {
	  onTabChange: (timeFrame: string) => void;
}

export default function PrenatalIndivHistoryTab({ onTabChange }: PrenatalHistoryProps): JSX.Element {
	const [activeTab, setActiveTab] = useState("prenatalcare")

	const handleHistoryChange = (history: string) => {
		console.log("Selected History:", history);
		setActiveTab(history);
		onTabChange(history);
	}

	const getTabStyle = (tab: string) => {
		const baseClasses = "flex justify-center items-center cursor-pointer text-black/70 transition-colors duration-200 ease-in-out rounded-md p-2";
		
		if (activeTab === tab) {
			// Active tab styles
			return `${baseClasses} bg-white shadow-md border text-blue-500`;
		} else {
			// Inactive tab styles
			return `${baseClasses} bg-blue-50 text-gray-100 hover:bg-white/`;
		}
	}
	
	return (
		// <div className="bg-white/70 p-2">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className={getTabStyle("prenatalcare")} onClick={() => handleHistoryChange("prenatalcare")}>
					<h2 className="font-semibold">Prenatal Care History</h2>
				</div>

				<div className={getTabStyle("prenatalform")} onClick={() => handleHistoryChange("prenatalform")}>
					<h2 className="font-semibold">Prenatal Form History</h2>
				</div>
			</div>
		// </div>
	)
}