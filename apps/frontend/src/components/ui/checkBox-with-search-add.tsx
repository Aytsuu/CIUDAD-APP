import React, { useState } from 'react';
import { Button } from './button';

interface FilterAccordionProps {
  title: string;
  options: { id: string; label: string; checked: boolean }[];
  selectedCount: number;
  onReset: () => void;
  onChange: (id: string, checked: boolean) => void;
  onAddOption: (label: string) => void;
  showAddField: boolean;
}

export function FilterAccordion({
  title,
  options,
  selectedCount,
  onReset,
  onChange,
  onAddOption,
  showAddField,
}: FilterAccordionProps) {
  const [newOption, setNewOption] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if the search query matches any existing option
  const optionExists = options.some(
    (option) => option.label.toLowerCase() === searchQuery.toLowerCase()
  );

  // Handle adding a new option
  const handleAddOption = () => {
    if (searchQuery.trim() === '') {
      setMessage('Please enter a valid option.');
      return;
    }

    // Check if the option already exists
    const exists = options.some(
      (option) => option.label.toLowerCase() === searchQuery.toLowerCase()
    );

    if (exists) {
      setMessage('Option already exists.');
    } else {
      onAddOption(searchQuery); // Call the parent function to add the new option
      setSearchQuery(''); // Clear the search input
      setMessage(''); // Clear the message
    }
  };

  return (
    <details className="overflow-hidden rounded border border-gray-300 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer items-center justify-between gap-2 bg-white p-4 text-gray-900 transition">
        <span className="text-sm font-medium">{title}</span>
        <span className="transition group-open:-rotate-180">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </span>
      </summary>

      <div className="border-t border-gray-200 bg-white">
        {/* Header with selected count and reset button */}
        <header className="flex items-center justify-between p-4">
          <span className="text-sm text-gray-700">{selectedCount} Selected</span>
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-gray-900 underline underline-offset-4"
          >
            Reset
          </button>
        </header>

        {/* Search input */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* List of filtered options */}
        <ul className="space-y-1 border-t border-gray-200 p-4">
          {filteredOptions.map((option) => (
            <li key={option.id}>
              <label htmlFor={option.id} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  id={option.id}
                  checked={option.checked}
                  onChange={(e) => onChange(option.id, e.target.checked)}
                  className="size-5 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  {option.label}
                </span>
              </label>
            </li>
          ))}
        </ul>

        {/* Add new option section */}
        {showAddField && !optionExists && searchQuery.trim() !== '' && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handleAddOption}
              >
                Add "{searchQuery}"
              </Button>
            </div>
            {message && <p className="text-sm text-red-500 mt-2">{message}</p>}
          </div>
        )}
      </div>
    </details>
  );
}
