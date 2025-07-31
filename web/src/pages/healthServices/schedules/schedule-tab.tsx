import { useState } from "react";

interface ScheduleTabProps {
	onTimeFrameChange: (timeFrame: string) => void;
}

export default function ScheduleTab({ onTimeFrameChange } : ScheduleTabProps): JSX.Element {
    const [selectedTimeFrame, setSelectedTimeFrame] = useState("today");

	const handleTimeFrameChange = (timeFrame: string) => {
		console.log("Selected Time Frame:", timeFrame);
		setSelectedTimeFrame(timeFrame);
		onTimeFrameChange(timeFrame); 
	};

	const getTabStyle = (tabTimeFrame: string) => {
    const baseClasses = "flex justify-center items-center shadow-md border cursor-pointer transition-colors duration-200 ease-in-out rounded-md p-2";
    
    if (selectedTimeFrame === tabTimeFrame) {
      // Active tab styles
      return `${baseClasses} bg-blue-600 text-white border-blue-700`;
    } else {
      // Inactive tab styles 
      return `${baseClasses} bg-white text-gray-800 hover:bg-blue-50`;
    }
  };

	return (
		<div className="flex flex-col w-full">
			<div className="rounded-md w-full mb-2 ">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div
						className={getTabStyle("today")}
						onClick={() => handleTimeFrameChange("today")}
					>
						<h2 className="text-md font-semibold text-gray-800">Today</h2>
					</div>

					<div
						className={getTabStyle("thisWeek")}
						onClick={() => handleTimeFrameChange("thisWeek")}
					>
						<h2 className="text-md font-semibold text-gray-800">This Week</h2>
					</div>

					<div
						className={getTabStyle("thisMonth")}
						onClick={() => handleTimeFrameChange("thisMonth")}
					>
						<h2 className="text-md font-semibold text-gray-800">This Month</h2>
					</div>
				</div>
			</div>
		</div>
	);
}
