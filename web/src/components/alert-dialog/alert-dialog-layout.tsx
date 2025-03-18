import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/alert-dialog/alert-dialog"
import React from "react"

type AlertDialogProps = {
    trigger: React.ReactNode,
    title: string,
    description: string,
    onConfirm: (value: any) => void
}
  
export default function AlertDialogLayout({
    trigger, 
    title, 
    description, 
    onConfirm} : AlertDialogProps
){
    return(
        <AlertDialog>
            <AlertDialogTrigger>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                    {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
  