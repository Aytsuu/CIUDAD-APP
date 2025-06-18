import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";


export default function PrenatalIndivHistory(){
    return(
        <LayoutWithBack
            title="Prenatal History"
            description="View prenatal history"
        >
            <div className="w-full h-auto sm:h-16 bg-white rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
                <div>
                    <h3 className="text-[18px] font-semibold text-[#b81701]"> Prenatal History</h3>
                </div>
            </div>
            <div className="w-full h-auto sm:h-10 mt-1 bg-white rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-2 sm:gap-0">
                <div className="w-full flex flex-row justify-center text-center gap-2">
                    <h4 className="w-[10%] text-[14px] font-semibold"> Date of Visit </h4>
                    <h4 className="w-[10%] text-[14px] font-semibold"> AOG </h4>
                    <h4 className="w-[10%] text-[14px] font-semibold"> Weight </h4>
                    <h4 className="w-[10%] text-[14px] font-semibold"> Blood Pressure </h4>
                    <h4 className="w-[30%] text-[14px] font-semibold"> Leopolds Findings </h4>
                    <h4 className="w-[30%] text-[14px] font-semibold"> Notes </h4>
                </div>
            </div>
            {/* sample data */}
            <div className="w-full h-auto sm:h-[100] mt-1 bg-white rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-2 sm:gap-0">
                <div className="w-full flex flex-row justify-center items-center text-center gap-2">
                    <h3 className="w-[10%]"> January 15, 2025 </h3>
                    <h3 className="w-[10%]"> 12 wks, 3 days </h3>
                    <h3 className="w-[10%]"> 55 kg </h3>
                    <h3 className="w-[10%]"> 110 / 70 120/80 mmHg </h3>
                    <h3 className="w-[30%]"> Fundal Height: 3cm <br/> Fetal Heartbeat: 132 BPM <br /> Fetal Position: Cephalic</h3>
                    <h3 className="w-[30%]"> Complaint: Heartburn and Leg Cramps<br /> Advise: Avoiding foods and drinks that trigger heartburn, such as citrus, spicy, fatty or greasy foods, caffeine, and carbonated beverages.</h3>
                </div>
            </div>
            <div className="w-full h-auto sm:h-[100] mt-1 bg-white rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-2 sm:gap-0">
                <div className="w-full flex flex-row justify-center items-center text-center gap-2">
                    <h3 className="w-[10%]"> Feb 15, 2025 </h3>
                    <h3 className="w-[10%]"> 15 wks, 3 days </h3>
                    <h3 className="w-[10%]"> 60 kg </h3>
                    <h3 className="w-[10%]"> 110 / 80 120/80 mmHg </h3>
                    <h3 className="w-[30%]"> Fundal Height: 4cm <br/> Fetal Heartbeat: 120 BPM <br /> Fetal Position: Cephalic</h3>
                    <h3 className="w-[30%]"> Complaint: Weight Gain<br /> Advise: Eat a balanced diet rich in whole grains, fruits, vegetables, lean proteins, and low-fat dairy while limiting added sugars, solid fats, and highly processed foods</h3>
                </div>
            </div>
        </LayoutWithBack>
    )
} 