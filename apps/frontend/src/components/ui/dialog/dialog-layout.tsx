import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog/dialog";

import React from "react";

interface DialogProps{
   trigger: React.ReactNode,
   className: string,
   title: string,
   description: string,
   mainContent: React.ReactNode
}

export default function DialogLayout({trigger, className, title = "", description = "",  mainContent} : DialogProps){
   return(
       <Dialog>
           <DialogTrigger>
                {trigger}
           </DialogTrigger>
           <DialogContent className={className}>
               <DialogHeader>
                   <DialogTitle className="text-darkBlue1">{title}</DialogTitle>
                   <DialogDescription>{description}</DialogDescription>
               </DialogHeader> 
               {mainContent}
           </DialogContent>
       </Dialog>
   );
}