import React from "react"
import { Label } from "@/components/ui/label"
import { ChevronRight, Plus, Check, Ellipsis, Trash, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button/button"
import { Separator } from "@/components/ui/separator"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Input } from "@/components/ui/input"
import api from "@/api/api"
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout"
import { useQuery } from "@tanstack/react-query"
import { getPositions } from "./restful-api/administrationGetAPI"

export default function AdministrativePositions(
    {selectedPosition, setSelectedPosition} : 
    {selectedPosition: string, setSelectedPosition : (value: string) => void}
){

    const [addClicked, setAddClicked] = React.useState<boolean>(false);
    const [position, setPosition] = React.useState<string>('')

    const { data: positions, isLoading: isLoadingPositions} = useQuery({
        queryKey: ['positions'],
        queryFn: getPositions,
        refetchOnMount: true,
        staleTime: 0
    })

    // Add new position
    const addPosition = (e: any) => {
        setAddClicked(false)
        setPosition("")
        e.preventDefault()
        api
            .post("administration/positions/", { pos_title: position })
            .then((result)=>{
                if(result.status === 201) getPositions()
            })
            .catch((err) => console.log(err))
    }

    // Delete a position
    const deletePosition = async () => {

        try {
            const res = await api.delete(`administration/positions/${selectedPosition}/`)
            if(res.status === 204){
                await getPositions()
                setSelectedPosition('')
            }
        } catch (err) {
            console.log(err)
        }
    }

    if(isLoadingPositions) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin"/>
            </div>
        )
    }

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

                        <TooltipLayout 
                            trigger={
                                <Check
                                    size={26}
                                    className="cursor-pointer text-black/60 stroke-[1.5] hover:text-black"
                                    onClick={addPosition}
                                />
                            }
                            content={"Save"}
                        />  
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
                                            onSelect={deletePosition}
                                        />): 
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