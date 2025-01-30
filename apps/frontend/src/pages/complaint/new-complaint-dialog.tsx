import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogDescription,
    DialogTitle,
    DialogTrigger 
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BlotterForm from "./blotter-form";

export default function NewComplaintDialog(){

    return(
        <Dialog>
            <DialogTrigger>
                <Button
                    className="bg-blue hover:bg-blue hover:opacity-[80%]"                
                >
                    <Plus/> New Record
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[50%] h-2/8">
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                    <DialogDescription>

                    </DialogDescription>
                    <BlotterForm/>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}