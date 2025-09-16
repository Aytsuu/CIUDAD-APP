import { useState } from "react";

interface ScheduleTabProps {
  onTimeFrameChange: (timeFrame: string) => void;
}

export default function ScheduleTab({ onTimeFrameChange }: ScheduleTabProps): JSX.Element {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("today");

  const handleTimeFrameChange = (timeFrame: string) => {
    console.log("Selected Time Frame:", timeFrame);
    setSelectedTimeFrame(timeFrame);
    onTimeFrameChange(timeFrame);
  };

  const getTabStyle = (tabTimeFrame: string) => {
    const baseClasses = "flex justify-center items-center cursor-pointer text-black/70 transition-colors duration-200 ease-in-out rounded-md p-2 h-[32px] w-[100px]";

    if (selectedTimeFrame === tabTimeFrame) {
      // Active tab styles
      return `${baseClasses} bg-white shadow-md border text-blue-500`;
    } else {
      // Inactive tab styles
      return `${baseClasses} bg-blue-50 text-gray-100 hover:bg-white/`;
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="">
        <div className="rounded-md">
          <div className="flex">
            <div className="flex flex-row bg-blue-50 p-1 rounded-md gap-2">
              <div className={getTabStyle("today")} onClick={() => handleTimeFrameChange("today")}>
                <h2 className="text-sm font-semibold text-gray-800">Today</h2>
              </div>

							<div
								className={getTabStyle("all")}
								onClick={() => handleTimeFrameChange("all")}
							>
								<h2 className="text-sm font-semibold text-gray-800">All</h2>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
