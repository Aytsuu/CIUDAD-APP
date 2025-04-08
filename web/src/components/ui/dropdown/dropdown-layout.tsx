import React from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent
} from "./dropdown-menu";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  name: React.ReactNode;
  icon?: React.ReactNode;
  variant?: string
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn("border-white focus:outline-none", className)}>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("", contentClassName)}>
        {options.map((option, index) => (
          <DropdownMenuItem 
            className={cn("cursor-pointer flex items-center gap-x-2", variant[option.variant ?? ""])}
            key={option.id || index} 
            onSelect={() => option.id && onSelect && onSelect(option.id)}
          >
            {option.icon}
            {option.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}