import { Label } from "@/components/ui/label"
import { ChevronRight } from "lucide-react"

type Position = {
    id: string;
    title: string
}

const positions: Position[] = [
    { id: 'admin', title: 'Admin' },
    { id: 'secretary', title: 'Secretary' },
    { id: 'treasurer', title: 'Treasurer' },
    { id: 'drr', title: 'Disaster Risk Reduction' },
    { id: 'clerk', title: 'Clerk' },
    { id: 'waste-management', title: 'Waste Management' },
    { id: 'gad', title: 'Gender and Development' },
    { id: 'bpso', title: 'Barangay Public Safety Officer'}
]

export default function AdministrativePositions({selectedPosition, setSelectedPosition} : 
    {selectedPosition: string, setSelectedPosition : (value: string) => void}){
        
    return (
        <div className="w-full h-full flex flex-col">
            {
                positions.map((position) => (
                    <div key={position.id} 
                        className={`w-full h-[7%] flex justify-between items-center hover:bg-lightBlue/40 p-3 rounded-md cursor-pointer 
                            ${position.id == selectedPosition ? "bg-lightBlue" : ""}`}
                        onClick={()=>{setSelectedPosition(position.id)}}
                    >
                        <Label className="text-black/80 text-[15px] font-medium">{position.title}</Label>
                        <ChevronRight size={20} className="text-black/80"/>
                    </div>
                ))
            }
        </div>
    )
}