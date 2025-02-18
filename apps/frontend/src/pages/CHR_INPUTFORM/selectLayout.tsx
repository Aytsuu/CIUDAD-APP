import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Option {
  id: string;
  name: string;
}

interface SelectLayoutProps {
  label?: string;
  placeholder?: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  enableAddNew?: boolean;
  onAddNew?: (newOption: Option) => void;
  error?: string;
  disabled?: boolean;
  disableAddNew?: boolean; // New prop to disable "Add" functionality
  disableSearch?: boolean; // New prop to disable search functionality
}

export const SelectLayout2 = ({
  label,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  className = "",
  enableAddNew = false,
  onAddNew,
  error,
  disabled = false,
  disableAddNew = false, // Default to false
  disableSearch = false, // Default to false
}: SelectLayoutProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to update input value when the selected value changes
  useEffect(() => {
    const currentOption = options.find(opt => opt.id === value);
    setInputValue(currentOption ? currentOption.name : '');
  }, [value, options]);

  // Handle clicks outside the component to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle option selection
  const handleOptionSelect = (option: Option) => {
    setInputValue(option.name);
    onChange(option.id);
    setIsOpen(false); // Close dropdown after selection
  };

  // Handle adding a new option
  const handleAddNewOption = () => {
    if (inputValue.trim() && onAddNew && !disableAddNew) {
      const newOption = {
        id: inputValue.toLowerCase().replace(/\s+/g, '-'),
        name: inputValue.trim()
      };
      onAddNew(newOption);
      onChange(newOption.id);
      setInputValue('');
      setIsOpen(false); // Close dropdown after adding
    }
  };

  // Check if the input value already exists in the options
  const isExistingOption = options.some(
    option => option.name.toLowerCase() === inputValue.trim().toLowerCase()
  );

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            if (!disableSearch) {
              setInputValue(e.target.value); // Only update input value if search is enabled
            }
          }}
          onFocus={() => setIsOpen(true)}
          className={`w-full pr-8 ${error ? 'border-red-500' : ''}`}
          disabled={disabled}
          readOnly={disableSearch} // Make input read-only if search is disabled
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 focus:outline-none"
          disabled={disabled}
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {isOpen && !disabled && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          style={{ minWidth: '200px' }}
        >
          {options.length > 0 ? (
            <div className="max-h-[200px] overflow-y-auto">
              {options.map((option) => (
                <div
                  key={option.id}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors
                    ${option.id === value ? 'bg-gray-100 font-medium' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No options available
            </div>
          )}

          {enableAddNew && !disableAddNew && inputValue.trim() && !isExistingOption && (
            <div className="p-2 border-t">
              <Button
                type="button"
                onClick={handleAddNewOption}
                className="w-full justify-start text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add "{inputValue}"
              </Button>
            </div>
          )}

          {enableAddNew && !disableAddNew && isExistingOption && (
            <div className="px-4 py-2 text-sm text-gray-500">
              "{inputValue}" already exists.
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};