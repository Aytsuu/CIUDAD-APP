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
  }
  
  interface DropdownProps {
    label: React.ReactNode;
    className?: string;
    contentClassName: React.ReactNode
    options: Option[];
    value: string;
    onChange: (value: string) => void;
  }
  
  export default function DropdownLayout({ label, className, contentClassName, options, value, onChange }: DropdownProps) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className={cn("border-white focus:outline-none", className)}>{label}</DropdownMenuTrigger>
        <DropdownMenuContent className={cn("", contentClassName)}>
          {options.map((option) => (
            <DropdownMenuItem className="cursor-pointer" key={option.id} onSelect={() => onChange(option.id)}>
              {option.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  