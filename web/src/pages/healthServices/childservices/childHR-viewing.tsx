import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const idInfo = [
    {
        name: "FAMILY NO.:", value: "", className: "w-32"
    },
    {
        name: "UFC NO.:", value: "", className: "w-32"
    },
]

// input line readOnly component
export const InputLine = ({className}: {className: string}) => (
    <Input className={cn("w-1/2 mr-2 border-0 border-b border-black rounded-none", className)} readOnly/>
)


export default function ChildHealthViewing(){
    return(
        <div>
            <Link to="/invtablechr">
                    <Button 
                        className="text-black p-2 self-start"
                        variant={"outline"}
                    >
                        <ChevronLeft />
                    </Button>                        
            </Link>
            <div className="container max-w-5xl w-full mx-auto m-3 p-5 border border-gray-300 bg-white">
                <div className="m-5">
                    <div>
                        <p className="text-center text-2xl"><b>Child Health Record</b></p>
                    </div>
                    
                    {/* family no., ufc no. */}
                    <div className="flex flex-col w-full">
                        {idInfo.map((info) => (
                            <div className="flex justify-end">
                                <React.Fragment>
                                    <Label className="mt-4">{info.name}</Label>
                                    <InputLine className={info.className}/>
                                </React.Fragment>
                            </div>
                            
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}