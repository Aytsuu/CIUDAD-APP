import TableLayout from "@/components/ui/table/table-layout"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { Button } from "@/components/ui/button"
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
            trigger={<Button variant={"outline"} className=""> View </Button>}
            className="max-w-[50%] h-2/3 flex flex-col"
            title="Report Details"
            description="This report was received on 9th of July, 2025. Please respond accordingly."
            mainContent={<DRRReportForm/>}
        />  
    ]
]

export default function ResidentReport(){
    
    return (
        <div className="w-full h-[100vh] bg-snow flex justify-center items-center">
            <div className="w-[80%] h-2/3 bg-white border border-gray rounded-[5px] p-5">
                <TableLayout header={headerProp} rows={bodyProp}/>
            </div>
        </div>

    )

}