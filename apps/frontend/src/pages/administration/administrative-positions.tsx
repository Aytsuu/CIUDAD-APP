import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight } from "lucide-react"

type Position = {
    key: string;
    title: string
}

const positions: Position[] = [
    { key: 'admin', title: 'Admin' },
    { key: 'secretary', title: 'Secretary' },
    { key: 'treasurer', title: 'Treasurer' },
    { key: 'drr', title: 'Disaster Risk Reduction' },
    { key: 'clerk', title: 'Clerk' },
    { key: 'waste-management', title: 'Waste Management' },
    { key: 'gad', title: 'Gender and Development' },
    { key: 'bpso', title: 'Barangay Public Safety Officer'}
]

export default function AdministrativePositions(){

    return (
        <div className="w-full h-full flex flex-col">
            {
                positions.map((position) => (
                    <div key={position.key} 
                        className=" w-full h-[7%] flex justify-between items-center hover:bg-lightBlue p-3 rounded-md cursor-pointer"
                    >
                        <Label className="text-black/80 text-[15px] font-medium">{position.title}</Label>
                        <ChevronRight size={20} className="text-black/80"/>
                    </div>
                ))
            }
        </div>
    )
}