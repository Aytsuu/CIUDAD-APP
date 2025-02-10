import TableLayout from "@/components/ui/table/table-layout"
import Card from "@/components/ui/card"

import { 
    CalendarRange,
    Users,
    FolderPlus
} from "lucide-react"
import { SelectLayout } from "@/components/ui/select/select-layout"

const header = [
    "Incident/Activity", 
    "Location", 
    "Sitio",
    "Date", 
    "Status",
    "Action"
]

const rows = [
    [
        "Lorem", 
        "Lorem", 
        "Lorem",
        "Lorem", 
        "Lorem", 
        "",
    ]
]

export default function DRRAcknowledgementReport(){
    
    return(

        <div className="w-screen h-screen bg-snow flex justify-center items-center p-4 sm:p-0">
            <div className="w-full sm:w-[70%] h-full sm:h-4/5 flex flex-col-reverse sm:flex-row gap-3">
   
                <div className="w-full h-full bg-white border border-gray flex flex-col rounded-[5px] p-5 gap-3">
                    <div className="w-full">
                        <SelectLayout
                            placeholder="Year"
                            label=""
                            className=""
                            options={[]}
                            value=""
                            onChange={()=>{}}
                        />
                    </div>
                    <TableLayout header={header} rows={rows} />
                </div>

                
                <div className="w-0 sm:w-[20%] h-0 sm:h-full bg-white sm:border sm:border-gray flex flex-col rounded-[5px] sm:p-3 gap-3 overflow-auto">
                  
                    <Card
                        icon={<CalendarRange className="absolute bottom-4 right-0 z-0 w-2/3 h-2/3 text-ashGray" />}
                        title="Weekly AR"
                        actionText="View reports"
                        className=""
                    />
                    <Card
                        icon={<FolderPlus className="absolute bottom-4 right-0 z-0 w-2/3 h-2/3 text-ashGray" />}
                        title="Create Report"
                        actionText="Create"
                        className=""
                    />
                    <Card
                        icon={<Users className="absolute bottom-4 right-0 z-0 w-2/3 h-2/3 text-ashGray" />}
                        title="Staff Record"
                        actionText="View staffs"
                        className=""
                    />
                </div>
            </div>
        </div>

    )

}