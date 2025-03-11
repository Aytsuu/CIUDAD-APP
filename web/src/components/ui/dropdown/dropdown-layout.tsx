import React from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent
} from "./dropdown-menu";
import { cn } from "@/lib/utils";

interface Option {
  id?: string;
  name: React.ReactNode;
  icons?: React.ReactNode;
}

interface DropdownProps {
  label: React.ReactNode;
  className?: string;
  contentClassName?: string;
  itemClassName?: string
  options: Option[];
  onSelect?: (value: string) => void;
}

export default function DropdownLayout({ 
  label, 
  className, 
  contentClassName, 
  itemClassName,
  options, 
  onSelect 
}: DropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn("border-white focus:outline-none", className)}>
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("", contentClassName)}>
        {options.map((option, index) => (
          <DropdownMenuItem 
            className={cn("cursor-pointer flex items-center gap-x-2", itemClassName)}
            key={option.id || index} 
            onSelect={() => option.id && onSelect && onSelect(option.id)}
          >
            {option.icons}
            {option.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}