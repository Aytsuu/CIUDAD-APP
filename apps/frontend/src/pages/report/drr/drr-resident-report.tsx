import TableLayout from "@/components/ui/table/table-layout"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import DRRReportForm from "./drr-report-form"

const headerProp = [
    "Category", 
    "Location",
    "Description", 
    "Time of Incident",
    "Reported By", 
    "Time Reported", 
    "Date"
]

const bodyProp = [
    [
        "Lorem", 
        "Lorem",
        "Lorem", 
        "Lorem",
        "Lorem", 
        "Lorem", 
        <DialogLayout   
            trigger={
                <div className="w-[50px] h-[35px] border border-gray flex justify-center items-center rounded-[5px] shadow-sm text-[13px]"> 
                    View 
                </div>
            }
            className="max-w-full sm:max-w-[50%] h-full sm:h-2/3 flex flex-col"
            title="Report Details"
            description="This report was received on 9th of July, 2025. Please respond accordingly."
            mainContent={<DRRReportForm/>}
        />  
    ]
]

export default function DRRResidentReport(){
    
    return (
        <div className="w-screen h-screen bg-snow flex justify-center items-center p-4 sm:p-0">
            <div className="w-full sm:w-[80%] h-full sm:h-2/3 bg-white border border-gray p-5 rounded-[5px]">
                <TableLayout header={headerProp} rows={bodyProp}/>
            </div>
        </div>

    )

}