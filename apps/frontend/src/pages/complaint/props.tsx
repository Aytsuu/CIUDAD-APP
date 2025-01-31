import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const dialogProps = {

    addTrigger: <Button className="bg-blue hover:bg-blue hover:opacity-[80%]">
                    <Plus/> New Record
                </Button>,
    
    addAction: <Button type="submit" className="bg-blue hover:bg-blue hover:opacity-[80%]">
                    Submit
                </Button>,
    
    viewTrigger: <Button variant='outline' className="border-2 border-blue text-darkBlue1 hover:bg-white hover:opacity-[80%]">
                    View
                </Button>,
    
    ViewAction: <Button type="submit" variant="destructive">
                    Raise Issue
                </Button>,
}

export default dialogProps