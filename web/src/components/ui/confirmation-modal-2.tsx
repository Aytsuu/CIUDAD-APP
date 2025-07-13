import React from "react";
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
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";

export const variants: Record<string, string> = {
  default: "",
  destructive: "bg-red-500 hover:bg-red-500/90",
};

interface ConfirmationModalProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "button" | "submit" | "reset";
  variant?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCloseButton?: boolean;
}

export function ConfirmationModal2({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  type = "button",
  variant,
  onConfirm,
  onCancel,
  showCloseButton = true,
}: ConfirmationModalProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        {showCloseButton && (
          <div className="absolute right-4 top-4">
            <AlertDialogCancel
              className="border-0 p-1 h-auto hover:bg-transparent hover:opacity-70"
              // Don't call onCancel here, just let it close the modal
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </AlertDialogCancel>
          </div>
        )}
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            type={type}
            onClick={onConfirm}
            className={variants[variant || "default"]}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}