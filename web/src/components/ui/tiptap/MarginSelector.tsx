"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";

interface MarginSelectorProps {
  onMarginChange: (margin: string) => void;
}

function MarginSelector({ onMarginChange }: MarginSelectorProps) {
  return (
    <Select onValueChange={onMarginChange}>
      <SelectTrigger className="w-[150px] bg-white">
        <SelectValue placeholder="Margin" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="96px">Normal</SelectItem>
        <SelectItem value="48px">Narrow</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default MarginSelector;

