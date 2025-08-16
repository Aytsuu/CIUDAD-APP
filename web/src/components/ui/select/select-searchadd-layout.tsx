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
  disabled?: boolean;
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
  disabled = false,
}: SelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if we're in a loading state
  const isLoading = options.some(option => option.id === "loading");

  // Initialize search term with selected option name only when dropdown is closed
  useEffect(() => {
    if (!isOpen) {
      if (value) {
        const selectedOption = options.find((opt) => opt.id === value);
        if (selectedOption && !isLoading) {
          setSearchTerm(selectedOption.name);
        }
      } else {
        setSearchTerm("");
      }
    }
  }, [value, options, isOpen, isLoading]);

  // Reset search term when dropdown opens to show all options
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Debug logging
  useEffect(() => {
    console.log('SelectLayoutWithAdd Debug:', {
      value,
      options: options.map(o => ({ id: o.id, name: o.name })),
      isLoading,
      searchTerm,
      isOpen
    });
  }, [value, options, isLoading, searchTerm, isOpen]);

  const filteredOptions = isOpen && searchTerm.trim() 
    ? options.filter((option) => {
        // Don't filter loading option
        if (option.id === "loading") return false;
        return option.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
      })
    : options.filter(option => option.id !== "loading"); // Show all non-loading options when no search

  const handleSelect = (selectedValue: string) => {
    // Don't allow selection of loading option
    if (selectedValue === "loading") return;
    
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
    if (onDelete && !isLoading) {
      onDelete(id);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading || disabled) return;
    
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setHighlightedIndex(-1);
    
    // Always keep dropdown open while typing
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || isLoading || disabled) return;

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
    if (disabled || isLoading) return;
    
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Clear search term when opening to show all options
      setSearchTerm("");
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
    (option) => option.name.toLowerCase() === searchTerm.toLowerCase().trim() && option.id !== "loading"
  );

  const shouldShowAddOption = searchTerm.trim() && !hasExactMatch && onAdd && !isLoading;

  const getDisplayValue = () => {
    if (isLoading) return "Loading categories...";
    if (value) {
      const selectedOption = options.find((opt) => opt.id === value);
      return selectedOption?.name || placeholder;
    }
    return placeholder;
  };

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      {/* Custom Trigger */}
      <button
        type="button"
        onClick={handleTriggerClick}
        disabled={disabled || isLoading}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          (disabled || isLoading) ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        )}
      >
        <span className={cn(
          "truncate",
          !value && "text-muted-foreground"
        )}>
          {getDisplayValue()}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 opacity-50 transition-transform duration-200",
          isOpen && !isLoading && "rotate-180"
        )} />
      </button>

      {/* Custom Dropdown */}
      {isOpen && !isLoading && (
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
              disabled={disabled}
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
                      option.id === value && "bg-blue-100 dark:bg-blue-900", // Highlight selected option
                      "hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => handleSelect(option.id)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="flex-1">{option.name}</span>
                    {/* Hide delete button for loading states and show only for valid options */}
                    {onDelete && !isLoading && option.id !== "loading" && !option.name.toLowerCase().includes('loading') && (
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