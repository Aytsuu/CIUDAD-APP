import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogDescription,
    DialogTitle,
    DialogTrigger 
} from "@/components/ui/dialog";

import BlotterForm from "./blotter-form";

interface ComplaintDialogProps{
    trigger: React.ReactNode,
    action: React.ReactNode
    title: string,
    description: string,

}

export default function ComplaintDialog({trigger, action, title, description}: ComplaintDialogProps){

    return(
        <Dialog>
            <DialogTrigger>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-[50%] h-2/8">
                <DialogHeader>
                    <DialogTitle className="text-darkBlue1">{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                    <BlotterForm action={action}/>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}