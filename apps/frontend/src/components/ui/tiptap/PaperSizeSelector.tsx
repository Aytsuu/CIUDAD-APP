// "use client";
// import { useState } from "react";


// type Props = {
//   onPaperSizeChange: (size: 'short' | 'long') => void;
// };

// const PaperSizeSelector = ({ onPaperSizeChange }: Props) => {
//   const [selectedSize, setSelectedSize] = useState<'short' | 'long'>('short');

//   const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     const size = event.target.value as 'short' | 'long';
//     setSelectedSize(size);
//     onPaperSizeChange(size);
//   };

//   return (
//     <select value={selectedSize} onChange={handleChange}>
//       <option value="short">Letter</option>
//       <option value="long">Legal</option>
//     </select>
//   );
// };

// export default PaperSizeSelector;


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