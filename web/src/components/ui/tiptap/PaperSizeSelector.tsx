// "use client";
// import { useState } from "react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";

// type Props = {
//   onPaperSizeChange: (size: 'short' | 'long') => void;
// };

// const PaperSizeSelector = ({ onPaperSizeChange }: Props) => {
//   const [selectedSize, setSelectedSize] = useState<'short' | 'long'>('short');

//   const handleChange = (size: 'short' | 'long') => {
//     setSelectedSize(size);
//     onPaperSizeChange(size);
//   };

//   return (
//     <Select onValueChange={handleChange}>
//       <SelectTrigger className="w-[150px] bg-white">
//         <SelectValue placeholder="Paper Size" />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="short">Letter</SelectItem>
//         <SelectItem value="long">Legal</SelectItem>
//       </SelectContent>
//     </Select>
//   );
// };

// export default PaperSizeSelector;

"use client";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "../button/button";
import { Check, ChevronDown } from "lucide-react";

type Props = {
  onPaperSizeChange: (size: 'short' | 'long') => void;
};

const PaperSizeSelector = ({ onPaperSizeChange }: Props) => {
  const [selectedSize, setSelectedSize] = useState<'short' | 'long'>('short');

  const handleChange = (size: 'short' | 'long') => {
    setSelectedSize(size);
    onPaperSizeChange(size);
  };

  const sizeLabels = {
    short: "Letter",
    long: "Legal"
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
            {sizeLabels[selectedSize]}
          </span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[140px] p-1 rounded-md shadow-lg border bg-background">
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Paper Size
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(['short', 'long'] as const).map((size) => (
          <DropdownMenuItem
            key={size}
            onClick={() => handleChange(size)}
            className={`flex items-center px-2 py-1.5 text-sm rounded ${
              selectedSize === size
                ? 'bg-accent text-accent-foreground font-medium'
                : 'hover:bg-muted/50'
            }`}
          >
            {sizeLabels[size]}
            {selectedSize === size && (
              <Check className="h-4 w-4 ml-auto text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PaperSizeSelector;