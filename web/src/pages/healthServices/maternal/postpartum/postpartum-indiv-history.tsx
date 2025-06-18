import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";


export default function PostpartumIndivHistory(){
    return(
        <LayoutWithBack
            title="Postpartum History"
            description="View postpartum history"
        >
            <div className="w-full h-auto sm:h-16 bg-white rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
                <div>
                    <h3 className="text-[18px] font-semibold text-[#b81701]"> Postpartum History</h3>
                </div>
            </div>
            <div className="w-full h-auto sm:h-10 mt-1 bg-white rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-2 sm:gap-0">
                <div className="w-full flex flex-row justify-center text-center gap-2">
                    <h4 className="w-[10%] text-[14px] font-semibold"> Date of Visit </h4>
                    <h4 className="w-[10%] text-[14px] font-semibold"> Lochial Discharges </h4>
                    <h4 className="w-[10%] text-[14px] font-semibold"> Blood Pressure </h4>
                    <h4 className="w-[20%] text-[14px] font-semibold"> Feedings </h4>
                    <h4 className="w-[30%] text-[14px] font-semibold"> Findings </h4>
                    <h4 className="w-[25%] text-[14px] font-semibold"> Nurses Notes </h4>
                </div>
            </div>
            {/* sample data */}
            <div className="w-full h-auto sm:h-[100] mt-1 bg-white rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-2 sm:gap-0">
                <div className="w-full flex flex-row justify-center items-center text-center gap-2">
                    <h3 className="w-[10%]"> April 10, 2025 </h3>
                    <h3 className="w-[10%]"> Moderate, reddish </h3>
                    <h3 className="w-[10%]"> 120/80 mmHg </h3>
                    <h3 className="w-[20%]"> Breastfeeding every 3 hours </h3>
                    <h3 className="w-[30%]"> Uterus firm, no tenderness </h3>
                    <h3 className="w-[25%]"> Mother reports mild nipple soreness, advised care </h3>
                </div>
            </div>
            <div className="w-full h-auto sm:h-[100] mt-1 bg-white rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-2 sm:gap-0">
                <div className="w-full flex flex-row justify-center items-center text-center gap-2">
                    <h3 className="w-[10%]"> April 15, 2025 </h3>
                    <h3 className="w-[10%]"> Light, pinkish </h3>
                    <h3 className="w-[10%]"> 118/76 mmHg </h3>
                    <h3 className="w-[20%]"> Formula feeding 4 oz every 4 hrs </h3>
                    <h3 className="w-[30%]"> No signs of infection </h3>
                    <h3 className="w-[25%]"> Baby feeding well, good weight gain observed </h3>
                </div>
            </div>
        </LayoutWithBack>
    )
} 