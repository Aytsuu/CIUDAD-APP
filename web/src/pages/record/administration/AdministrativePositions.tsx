<<<<<<< HEAD
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
                        className={`w-full flex justify-between items-center hover:bg-lightBlue/40 p-3 rounded-md cursor-pointer 
                            ${position.id == selectedPosition ? "bg-lightBlue" : ""}`}
                        onClick={()=>{setSelectedPosition(position.id)}}
                    >
                        <Label className="text-black/80 text-[15px] font-medium">{position.title}</Label>
                        <ChevronRight size={20} className="text-black/80"/>
                    </div>
                ))
            }
=======
import React from "react"
import { Label } from "@/components/ui/label"
import { ChevronRight, Plus, Check, Ellipsis, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Input } from "@/components/ui/input"
import api from "@/api/api"
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout"

type Position = {
    pos_id: string;
    pos_title: string;
}

export default function AdministrativePositions(
    {selectedPosition, setSelectedPosition} : 
    {selectedPosition: string, setSelectedPosition : (value: string) => void}
){

    const [positions, setPositions] = React.useState<Record<string, Position>>({});
    const [addClicked, setAddClicked] = React.useState<boolean>(false);
    const [position, setPosition] = React.useState<string>('')
    const hasFetchData = React.useRef(false)

    // Perform side effects
    React.useEffect(()=>{
        if(!hasFetchData.current){
            getPositions()
            hasFetchData.current = true
        }
    }, [])

    // Retrieve al positions
    const getPositions = React.useCallback(()=> {
        api
            .get("administration/positions/")
            .then((res) => res.data)
            .then((data) => {setPositions(data)})
            .catch((err) => console.log(err))
    }, [])

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
    const deletePosition = () => {
        api
            .delete(`administration/positions/${selectedPosition}/`)
            .then((res) => {
                if(res.status === 204) {
                    getPositions()
                    setSelectedPosition('')
                }
            })
            .catch((err) => console.log(err))
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
                    Object.values(positions).map((value) => (
                        <div key={value.pos_id} 
                            className={`w-full flex justify-between items-center hover:bg-lightBlue/40 p-3 rounded-md cursor-pointer 
                                ${value.pos_id == selectedPosition ? "bg-lightBlue" : ""}`}
                            onClick={()=>{setSelectedPosition(value.pos_id)}}
                        >
                            <Label className="text-black/80 text-[15px] font-medium">{value.pos_title}</Label>
                            {value.pos_id === selectedPosition ? 
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
                    ))
                }
            </div>
>>>>>>> master
        </div>
    )
}