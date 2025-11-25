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
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function DialogLayout({
  trigger,
  className,
  title = "",
  description = "",
  mainContent,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
}: DialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onOpenChange =
    externalOnOpenChange !== undefined
      ? externalOnOpenChange
      : setInternalIsOpen;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={className}
        // Prevent dialog from closing when clicking on popover/combobox elements
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          // Check for various popover/combobox related elements
          if (
            target.closest("[data-radix-popper-content-wrapper]") ||
            target.closest("[cmdk-root]") ||
            target.closest("[data-radix-select-content]") ||
            target.closest(".popover-content") ||
            target.closest('[role="listbox"]') ||
            target.closest('[role="combobox"]')
          ) {
            e.preventDefault();
          }
        }}
        onFocusOutside={(e) => {
          const target = e.target as HTMLElement;
          // Prevent focus outside from closing dialog when interacting with popover elements
          if (
            target.closest("[data-radix-popper-content-wrapper]") ||
            target.closest("[cmdk-root]") ||
            target.closest("[data-radix-select-content]") ||
            target.closest(".popover-content") ||
            target.closest('[role="listbox"]') ||
            target.closest('[role="combobox"]')
          ) {
            e.preventDefault();
          }
        }}
        // Ensure proper z-index stacking
        style={{ zIndex: 50 }}
      >
        <DialogHeader className={`${!title && !description && 'hidden'}`}>
            <DialogTitle className="text-darkBlue1">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {mainContent}
      </DialogContent>
    </Dialog>
  );
}
