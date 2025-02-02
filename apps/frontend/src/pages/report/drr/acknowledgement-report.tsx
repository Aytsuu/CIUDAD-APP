import TableLayout from "@/components/ui/table/table-layout"
import { Label } from "@/components/ui/label"
import { 
    CalendarRange,
    Users,
    FolderPlus
} from "lucide-react"

const header = [
    {head: "Incident/Activity"}, {head: "Location"}, {head: "Sitio"},
    {head: "Date"}, {head: "Status"}, {head: "Action"}
]

const body = [
    {cell: "Lorem"}, {cell: "Lorem"}, {cell: "Lorem"},
    {cell: "Lorem"}, {cell: "Lorem"}, {cell: ""},
]

interface CardProps{
    icon: React.ReactNode,
    title: string,
    actionText: string
}

const Card = ({ icon, title, actionText } : CardProps) => (
    <a href="" className="relative w-full h-[15%] bg-lightBlue flex flex-col">
      {icon}
      <div className="w-full h-full flex items-center p-5 z-10">
        <Label className="text-black text-[20px] font-semibold cursor-pointer">{title}</Label>
      </div>
      <div className="w-full h-[25%] bg-darkBlue3 flex items-center p-3 z-10">
        <Label className="text-white cursor-pointer">{actionText}</Label>
      </div>
    </a>
);


export default function AcknowledgementReport(){
    
    return(

        <div className="w-full h-[100vh] bg-snow flex justify-center items-center">
            <div className="w-[70%] h-4/5 flex gap-3">
                {/* Main Table Section */}
                <div className="w-full h-full bg-white border border-gray rounded-[5px] p-5">
                    <TableLayout header={header} body={body} />
                </div>

                {/* Sidebar Section */}
                <div className="w-[20%] h-full bg-white border border-gray flex flex-col rounded-[5px] p-3 gap-5 overflow-auto">
                    {/* Reusable Card Component */}
                    <Card
                        icon={<CalendarRange className="absolute bottom-4 right-0 z-0 w-2/3 h-2/3 text-ashGray" />}
                        title="Weekly AR"
                        actionText="View reports"
                    />
                    <Card
                        icon={<FolderPlus className="absolute bottom-4 right-0 z-0 w-2/3 h-2/3 text-ashGray" />}
                        title="Create Report"
                        actionText="Create"
                    />
                    <Card
                        icon={<Users className="absolute bottom-4 right-0 z-0 w-2/3 h-2/3 text-ashGray" />}
                        title="Staff Record"
                        actionText="View staffs"
                    />
                </div>
            </div>
        </div>

    )

}