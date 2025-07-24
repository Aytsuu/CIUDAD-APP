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

  const handleDeleteAction = (optionId: string) => {
    if (onSelect) {
      onSelect(optionId);
    }
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild className={cn("border-white focus:outline-none", className)}>
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
              onClick={() => {
                setDropdownOpen(false);
                handleDeleteAction(option.id);
              }}
            />
          ) : (
            <DropdownMenuItem
              className={cn("cursor-pointer flex items-center gap-x-2", variant[option.variant ?? ""])}
              key={option.id || index}
              onSelect={() => option.id && onSelect && onSelect(option.id)}
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