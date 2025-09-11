import React, { useState, useRef, useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form/form";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  control: any;
  name: string;
  label: string;
  readOnly?: boolean;
  year?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  control,
  name,
  label,
  readOnly = false,
  year,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatDisplay = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  // Close dropdown when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showPicker]);

  const handleInputClick = () => {
    if (!readOnly) {
      setShowPicker(!showPicker);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-black/70">{label}</FormLabel>
          <FormControl>
            <div className="relative" ref={pickerRef}>
              <input
                ref={inputRef}
                type="text"
                readOnly
                value={formatDisplay(field.value)}
                className={cn(
                  "bg-white border w-full py-1.5 px-2 pr-10 rounded-md text-[14px] shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer",
                  readOnly && "bg-gray-100 cursor-not-allowed"
                )}
                onClick={handleInputClick}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Calendar className="text-gray-500" size={16} />
              </div>
              
              {showPicker && !readOnly && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-50 p-3 mt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Date</label>
                      <input
                        type="date"
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const date = e.target.value;
                          const time = field.value ? new Date(field.value).toTimeString().slice(0, 5) : '00:00';
                          field.onChange(`${date}T${time}`);
                        }}
                        className="w-full border rounded px-2 py-1 text-sm"
                        min={year ? `${year}-01-01` : undefined}
                        max={year ? `${year}-12-31` : undefined}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Time</label>
                      <input
                        type="time"
                        value={field.value ? new Date(field.value).toTimeString().slice(0, 5) : ''}
                        onChange={(e) => {
                          const time = e.target.value;
                          const date = field.value ? new Date(field.value).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                          field.onChange(`${date}T${time}`);
                        }}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Close button */}
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowPicker(false)}
                      className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};