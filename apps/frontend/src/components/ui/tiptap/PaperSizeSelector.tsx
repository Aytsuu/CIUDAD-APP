"use client";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";

type Props = {
  onPaperSizeChange: (size: 'short' | 'long') => void;
};

const PaperSizeSelector = ({ onPaperSizeChange }: Props) => {
  const [selectedSize, setSelectedSize] = useState<'short' | 'long'>('short');

  const handleChange = (size: 'short' | 'long') => {
    setSelectedSize(size);
    onPaperSizeChange(size);
  };

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Paper Size" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="short">Letter</SelectItem>
        <SelectItem value="long">Legal</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default PaperSizeSelector;