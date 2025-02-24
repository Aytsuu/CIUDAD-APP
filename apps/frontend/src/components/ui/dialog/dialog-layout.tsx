// components/DialogLayout.tsx
import React from "react";
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog/dialog";

interface DialogProps {
    trigger: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    mainContent: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DialogLayout({
    trigger,
    className,
    title = "",
    description = "",
    mainContent,
    isOpen,
    onOpenChange,
}: DialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
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