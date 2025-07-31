"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "../button/button";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

interface MarginSelectorProps {
  onMarginChange: (margin: string) => void;
}

function MarginSelector({ onMarginChange }: MarginSelectorProps) {
  const marginOptions = [
    { value: "96px", label: "Normal" },
    { value: "48px", label: "Narrow" },
  ];

  const [selectedMargin, setSelectedMargin] = useState("96px");

  const handleChange = (margin: string) => {
    setSelectedMargin(margin);
    onMarginChange(margin);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="px-3 py-1.5 h-auto flex items-center gap-2 hover:bg-muted/50"
        >
          <span className="text-xs font-medium">
            {marginOptions.find(opt => opt.value === selectedMargin)?.label || 'Margin'}
          </span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[140px] p-1 rounded-md shadow-lg border bg-background">
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Margin Size
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {marginOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleChange(option.value)}
            className={`flex items-center px-2 py-1.5 text-sm rounded ${
              selectedMargin === option.value
                ? 'bg-accent text-accent-foreground font-medium'
                : 'hover:bg-muted/50'
            }`}
          >
            {option.label}
            {selectedMargin === option.value && (
              <Check className="h-4 w-4 ml-auto text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default MarginSelector;
