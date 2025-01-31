import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const dialogProps = {

    addTrigger: <Button className="bg-blue hover:bg-blue hover:opacity-[80%]">
                    <Plus/> New Record
                </Button>,
    
    addAction: <Button type="submit" className="bg-blue hover:bg-blue hover:opacity-[80%]">
                    Submit
                </Button>,
    
    addTitle: "Complaint Record",
    addDescription: "Please fill all required fields (Type N/A if the information is not available for the specific field)",
    
    viewTrigger: <Button variant='outline' className="border-2 border-blue text-darkBlue1 hover:bg-white hover:opacity-[80%]">
                    View
                </Button>,
    
    ViewAction: <Button type="submit" variant="destructive">
                    Raise Issue
                </Button>,
    
    viewTitle: "Complaint Record",
    viewDescription: "All information provided should be securely protectd",
}

export default dialogProps