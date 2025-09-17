import React from "react";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
}) => {
  return ( 
    <DialogLayout 
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      trigger={<></>} // No trigger needed since we control it externally
      title={title}
      description={description}
      mainContent={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button   onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      }
    />
  );
};