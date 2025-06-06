import { useState } from "react";
import { Trash2 } from "lucide-react";
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
  placeholder?: string;
  label: string;
  className?: string;
  options: Option[];
  value: string;
  displayValue?: string;
  onChange: (value: string) => void;
  onAdd?: (newValue: string) => void;
  onDelete?: (id: string) => void;
}

export function SelectLayoutWithAdd({
  placeholder = "Select", // Default placeholder
  label,
  className,
  options,
  value,
  displayValue,
  onChange,
  onAdd,
  onDelete,
}: SelectProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (selectedValue: string) => {
    if (!selectedValue.trim()) return;

    const existingOption = options.find((opt) => opt.id === selectedValue);
    if (!existingOption && onAdd) {
      onAdd(selectedValue);
    } else {
      onChange(selectedValue);
    }
    setSearchTerm("");
  };

  const handleDelete = (id: string) => {
    if (onDelete) onDelete(id);
  };

  return (
    <Select value={value} onValueChange={handleSelect}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {value ? displayValue : undefined}
        </SelectValue>
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
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          {searchTerm.trim() &&
            !filteredOptions.some(
              (option) =>
                option.name.toLowerCase() === searchTerm.toLowerCase()
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
