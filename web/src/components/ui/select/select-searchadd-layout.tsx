import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  name: string;
}

interface SelectProps {
  placeholder: string;
  label: string;
  className?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export function SelectLayoutWithAdd({
  placeholder,
  label,
  className,
  options,
  value,
  onChange,
}: SelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dynamicOptions, setDynamicOptions] = useState<Option[]>(options);

  const filteredOptions = dynamicOptions.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (selectedValue: string) => {
    const existingOption = dynamicOptions.find((opt) => opt.id === selectedValue);
    if (!existingOption) {
      // Add new option if it doesn't exist
      const newOption = { id: selectedValue, name: selectedValue };
      setDynamicOptions((prev) => [...prev, newOption]);
    }
    onChange(selectedValue);
    setSearchTerm(""); // Reset search after selection
  };

  return (
    <Select value={value} onValueChange={handleSelect}>
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <input
            type="text"
            placeholder="Search or add..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2 py-1 border rounded-md"
          />
        </div>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <SelectItem
                key={option.id}
                value={option.id}
                className="cursor-pointer"
              >
                {option.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem
              value={searchTerm}
              className="cursor-pointer italic"
            >
              Add "{searchTerm}"
            </SelectItem>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
