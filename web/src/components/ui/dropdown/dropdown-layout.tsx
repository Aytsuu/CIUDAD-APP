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
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
}

export default function DropdownLayout({ 
  label, 
  className, 
  contentClassName, 
  options, 
  value, 
  onChange 
}: DropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn("border-white focus:outline-none", className)}>
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("", contentClassName)}>
        {options.map((option, index) => (
          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-x-2" 
            key={option.id || index} 
            onSelect={() => option.id && onChange && onChange(option.id)}
          >
            {option.icons}
            {option.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}