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

export const variants: Record<string, string> = {
  default: "",
  destructive: "bg-red-500 hover:bg-red-500/90",
};

interface ConfirmationModalProps {
  trigger?: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  type?: string;
  variant?: string;
  onClick?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ConfirmationModal({
  trigger,
  title,
  description,
  actionLabel,
  type,
  variant,
  onClick,
  open,
  onOpenChange,
}: ConfirmationModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            type={(type as "button" | "submit" | "reset") || "button"}
            onClick={onClick}
            className={variants[variant ?? variants.default]}
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}