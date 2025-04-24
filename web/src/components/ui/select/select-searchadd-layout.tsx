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
  onAdd?: (newValue: string) => void; // Updated to match confirmation flow
  onDelete?: (id: string) => void;
}

export function SelectLayoutWithAdd({
  placeholder,
  label,
  className,
  options,
  value,
  onChange,
  onAdd,
  onDelete,
}: SelectProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (selectedValue: string) => {
    if (!selectedValue.trim()) return;

    // Check if the selected value already exists in the options
    const existingOption = options.find((opt) => opt.id === selectedValue);
    if (!existingOption) {
      // If it doesn't exist, trigger the onAdd function (which will open the confirmation dialog)
      if (onAdd) {
        onAdd(selectedValue); // Pass the new category name to the parent for confirmation
      }
    } else {
      // If it exists, simply call onChange
      onChange(selectedValue);
    }
    setSearchTerm("");
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <Select value={value || undefined} onValueChange={handleSelect}>
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
          {filteredOptions.map((option) => (
            <div key={option.id} className="flex justify-between items-center">
              <SelectItem value={option.id} className="cursor-pointer flex-1">
                {option.name}
              </SelectItem>
              {onDelete && (
                <button
                  onClick={() => handleDelete(option.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ❌
                </button>
              )}
            </div>
          ))}
          {searchTerm.trim() &&
            !filteredOptions.some(
              (option) => option.name.toLowerCase() === searchTerm.toLowerCase()
            ) && (
              <SelectItem
                value={searchTerm.trim()}
                className="cursor-pointer italic"
                onClick={() => handleSelect(searchTerm.trim())}
              >
                Add "{searchTerm}"
              </SelectItem>
            )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}