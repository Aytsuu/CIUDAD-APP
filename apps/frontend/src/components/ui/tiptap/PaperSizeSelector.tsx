"use client";
import { useState } from "react";

type Props = {
  onPaperSizeChange: (size: 'short' | 'long') => void;
};

const PaperSizeSelector = ({ onPaperSizeChange }: Props) => {
  const [selectedSize, setSelectedSize] = useState<'short' | 'long'>('short');

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const size = event.target.value as 'short' | 'long';
    setSelectedSize(size);
    onPaperSizeChange(size);
  };

  return (
    <select value={selectedSize} onChange={handleChange}>
      <option value="short">Letter</option>
      <option value="long">Legal</option>
    </select>
  );
};

export default PaperSizeSelector;