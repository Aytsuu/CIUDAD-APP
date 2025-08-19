import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent
} from "./dropdown-menu";
import { cn } from "@/lib/utils";
import { ConfirmationModal } from "../confirmation-modal";

interface Option {
  id: string;
  name: React.ReactNode;
  icon?: React.ReactNode;
  variant?: string;
  disabled?: boolean
}

interface DropdownProps {
  trigger: React.ReactNode;
  className?: string;
  contentClassName?: string;
  options: Option[];
  onSelect?: (value: string) => void;
}

export const variant: Record<string, string> = {
  delete: "text-red-500 focus:text-red-500",
  default: "focus:text-buttonBlue"
};

export default function DropdownLayout({
  trigger,
  className,
  contentClassName,
  options,
  onSelect
}: DropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleItemSelect = (optionId: string) => {
    // Close dropdown first, then handle the action
    setDropdownOpen(false);
    
    // Use setTimeout to ensure dropdown closes before handling action
    setTimeout(() => {
      if (onSelect) {
        onSelect(optionId);
      }
    }, 0);  
  };

  const handleDeleteAction = (optionId: string) => {
    // For delete actions, we want to keep dropdown closed
    setDropdownOpen(false);
    
    setTimeout(() => {
      if (onSelect) {
        onSelect(optionId);
      }
    }, 0);
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild className={cn("focus:outline-none", className)}>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("", contentClassName)}>
        {options.map((option, index) => (
          !option.disabled && (option.variant === "delete" ? (
            <ConfirmationModal
              key={option.id || index}
              trigger={
                <DropdownMenuItem
                  className={cn("cursor-pointer flex items-center gap-x-2", variant[option.variant ?? ""])}
                  onSelect={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {option.icon}
                  {option.name}
                </DropdownMenuItem>
              }
              title="Confirm Removal"
              description="Are you sure you want to remove this staff?"
              actionLabel="Confirm"
              variant="destructive"
              onClick={() => handleDeleteAction(option.id)}
            />
          ) : (
            <DropdownMenuItem
              className={cn("cursor-pointer flex items-center gap-x-2", variant[option.variant ?? ""])}
              key={option.id || index}
              onSelect={(e) => {
                e.preventDefault();
                handleItemSelect(option.id);
              }}
            >
              {option.icon}
              {option.name}
            </DropdownMenuItem>
          ))
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}