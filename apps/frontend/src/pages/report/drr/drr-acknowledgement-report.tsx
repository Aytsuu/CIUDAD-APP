import TableLayout from "@/components/ui/table/table-layout"
import Card from "@/components/ui/card"

import { 
    CalendarRange,
    Users,
    FolderPlus
} from "lucide-react"

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

        <div className="w-full h-[100vh] bg-snow flex justify-center items-center">
            <div className="w-[70%] h-4/5 flex gap-3">
                {/* Main Table Section */}
                <div className="w-full h-full bg-white border border-gray rounded-[5px] p-5">
                    <TableLayout header={header} rows={rows} />
                </div>

                {/* Sidebar Section */}
                <div className="w-[20%] h-full bg-white border border-gray flex flex-col rounded-[5px] p-3 gap-3 overflow-auto">
                    {/* Reusable Card Component */}
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