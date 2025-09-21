import React from "react";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Loader2 } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  isLoading = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
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
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      }
    />
  );
};