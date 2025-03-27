import React from "react"
import { Label } from "@/components/ui/label"
import { ChevronRight, Plus, Check, Ellipsis, Trash, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button/button"
import { Separator } from "@/components/ui/separator"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Input } from "@/components/ui/input"
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout"
import { addPosition } from "./restful-api/administrationPostAPI"
import { deletePosition } from "./restful-api/administrationDeleteAPI"
import { toast } from "sonner"
import { Positions } from "./administrationTypes"

export default function AdministrativePositions(
    {positions, setPositions, selectedPosition, setSelectedPosition} : {
        positions: Record<string, string>[];  
        setPositions: React.Dispatch<React.SetStateAction<Positions[]>>
        selectedPosition: string; 
        setSelectedPosition : (value: string) => void
}){

    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
    const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
    const [addClicked, setAddClicked] = React.useState<boolean>(false);
    const [position, setPosition] = React.useState<string>('')

    // Add new position
    const handleAddPosition = React.useCallback(async () => {
        setIsSubmitting(true)

        if (!position) {
            setIsSubmitting(false)
            setAddClicked(false)
            return;
        }

        const res = await addPosition(position)

        if(res) {
            toast('')
            setIsSubmitting(false)
            setAddClicked(false)
            setPosition('')
            
            setPositions((prev) => [
                ...prev,
                {
                    id: String(res.pos_id),
                    name: res.pos_title
                }
            ])
        }

    }, [position])
    

    // Delete a position
    const handleDeletePosition = React.useCallback(async () => {

        setIsDeleting(true)

        const res = await deletePosition(selectedPosition)
        if(res?.status === 204) {
            
            setPositions((prev) => 
                prev.filter((position) => position.id !==  selectedPosition)
            )

            setSelectedPosition('')
            setIsDeleting(false)
        }

    }, [selectedPosition])

    return (
        <div className="w-full h-full flex flex-col gap-3">
            <div className="w-full flex justify-between items-start">
                <Label className="text-[20px] text-darkBlue1">Positions</Label>
                {!addClicked && (
                <Button onClick={() => setAddClicked(true)}>
                    <Plus /> Add
                </Button>
                )}
            </div>
    
            <Separator />
    
            <div
                className={`transition-all duration-300 ease-in-out  ${
                    addClicked ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 h-0"}`}
            >
                {addClicked && (
                    <div className="flex items-center gap-2">
                        <Input placeholder="Enter position title" value={position} onChange={(e)=>setPosition(e.target.value)}/>

                        {!isSubmitting ? (<TooltipLayout 
                            trigger={
                                <Check
                                    size={26}
                                    className="cursor-pointer text-black/60 stroke-[1.5] hover:text-black"
                                    onClick={handleAddPosition}
                                />
                            }
                            content={"Save"}
                        />) : (
                            <Loader2 size={26} className="animate-spin opacity-50"/>
                        )}
                    </div>
                )}
            </div>
            <div className="w-full flex flex-col">
                {
                    positions.map((value: any) => {

                        const exclude = ['Admin']

                        if(!exclude.includes(value.name)){
                            return (
                                <div key={value.id} 
                                    className={`w-full flex justify-between items-center hover:bg-lightBlue/40 p-3 rounded-md cursor-pointer 
                                        ${value.id == selectedPosition ? "bg-lightBlue" : ""}`}
                                    onClick={()=>{setSelectedPosition(value.id)}}
                                >
                                    <Label className="text-black/80 text-[15px] font-medium">{value.name}</Label>
                                    {value.id === selectedPosition ? 

                                        (!isDeleting ?
                                            // Change elipsis to loader if is deleting
                                            (<DropdownLayout
                                                trigger={<Ellipsis size={20}/>}
                                                itemClassName="text-red-500 focus:text-red-500"
                                                options={[
                                                    {
                                                        id: 'delete',
                                                        name: 'Delete',
                                                        icon: <Trash />
                                                    }
                                                ]}
                                                onSelect={handleDeletePosition}
                                            />) : <Loader2 size={22} className="animate-spin opacity-50"/>)
                                        : 
                                        (<ChevronRight size={20} className="text-black/80"/>)
                                    }
                                </div>
                            )
                        }
                    })
                }
            </div>
        </div>
    )
}