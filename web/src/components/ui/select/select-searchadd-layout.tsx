import { useState, useEffect, useRef } from "react";
import { Trash2, ChevronDown } from "lucide-react";
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
  onChange: (value: string) => void;
  onAdd?: (newValue: string) => void;
  onDelete?: (id: string) => void;
}

export function SelectLayoutWithAdd({
  placeholder = "Select",
  label,
  className,
  options,
  value,
  onChange,
  onAdd,
  onDelete,
}: SelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Only sync search term when value changes from outside
  useEffect(() => {
    if (!isOpen && value) {
      const selectedOption = options.find((opt) => opt.id === value);
      if (selectedOption) {
        setSearchTerm(selectedOption.name);
      }
    } else if (!value) {
      setSearchTerm("");
    }
  }, [value, options, isOpen]);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleSelect = (selectedValue: string) => {
    // Check if this is adding a new item
    const existingOption = options.find((opt) => opt.id === selectedValue);
    
    if (!existingOption && onAdd && searchTerm.trim()) {
      onAdd(searchTerm.trim());
      setSearchTerm("");
    } else if (existingOption) {
      onChange(selectedValue);
      setSearchTerm(existingOption.name);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete) {
      onDelete(id);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setHighlightedIndex(-1);
    
    // Always keep dropdown open while typing
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const option = filteredOptions[highlightedIndex];
          handleSelect(option.id);
        } else if (searchTerm.trim() && onAdd) {
          const exactMatch = options.find(
            (opt) => opt.name.toLowerCase() === searchTerm.toLowerCase().trim()
          );
          if (exactMatch) {
            handleSelect(exactMatch.id);
          } else {
            onAdd(searchTerm.trim());
            setSearchTerm("");
            setIsOpen(false);
          }
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => prev > 0 ? prev - 1 : prev);
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const hasExactMatch = options.some(
    (option) => option.name.toLowerCase() === searchTerm.toLowerCase().trim()
  );

  const shouldShowAddOption = searchTerm.trim() && !hasExactMatch && onAdd;

  const displayValue = value 
    ? options.find((opt) => opt.id === value)?.name || placeholder
    : placeholder;

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      {/* Custom Trigger */}
      <button
        type="button"
        onClick={handleTriggerClick}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={cn(
          "truncate",
          !value && "text-muted-foreground"
        )}>
          {displayValue}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 opacity-50 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Custom Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {/* Search Input */}
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search or add..."
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="px-1">
            {label && (
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                {label}
              </div>
            )}
            
            {filteredOptions.length > 0 && (
              <>
                {filteredOptions.map((option, index) => (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-center justify-between rounded-sm px-2 py-1.5 text-sm cursor-pointer",
                      highlightedIndex === index && "bg-accent text-accent-foreground",
                      "hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => handleSelect(option.id)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="flex-1">{option.name}</span>
                    {onDelete && (
                      <button
                        onClick={(e) => handleDelete(option.id, e)}
                        className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded opacity-70 hover:opacity-100"
                        type="button"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </>
            )}
            
            {shouldShowAddOption && (
              <div
                className={cn(
                  "rounded-sm px-2 py-1.5 text-sm cursor-pointer italic text-blue-600",
                  highlightedIndex === filteredOptions.length && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleSelect(searchTerm.trim())}
                onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
              >
                Add "{searchTerm.trim()}"
              </div>
            )}
            
            {filteredOptions.length === 0 && !shouldShowAddOption && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {searchTerm.trim() ? "No matching options found" : "No options available"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}