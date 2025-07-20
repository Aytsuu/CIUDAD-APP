import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog/dialog";
import React, { useState } from "react";

interface DialogProps {
    trigger?: React.ReactNode;
    className?: string;
    title?: string;
    description?: React.ReactNode;
    mainContent: React.ReactNode;
    isOpen?: boolean; // Make optional
    onOpenChange?: (open: boolean) => void; // Make optional
}

export default function DialogLayout({
    trigger,
    className,
    title = "",
    description = "",
    mainContent,
    isOpen: externalIsOpen, // Optional prop
    onOpenChange: externalOnOpenChange, // Optional prop
}: DialogProps) {
    // Internal state for managing dialog open/close
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    // Use external state if provided, otherwise use internal state
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const onOpenChange = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalIsOpen;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className={className}>
                {(title || description) && <DialogHeader>
                    {title && <DialogTitle className="text-darkBlue1">{title}</DialogTitle>}
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>}
                {mainContent}
            </DialogContent>
        </Dialog>
    );
}

