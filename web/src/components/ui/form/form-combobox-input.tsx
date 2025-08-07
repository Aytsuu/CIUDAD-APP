import { useState, useRef } from "react";
import { Button } from "@/components/ui/button/button";
import { Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface ComboboxInputProps<T> {
  value: string;
  options: T[];
  isLoading?: boolean;
  label: string;
  placeholder: string;
  emptyText: string;
  onSelect: (value: string, item?: T) => void;
  onCustomInput?: (value: string) => void;
  displayKey?: T extends string ? never : keyof T;
  valueKey?: T extends string ? never : keyof T;
  additionalDataKey?: T extends string ? never : keyof T;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export function ComboboxInput<T>({
  value,
  options,
  isLoading = false,
  label,
  placeholder,
  emptyText,
  onSelect,
  onCustomInput,
  displayKey,
  valueKey,
  additionalDataKey,
  className,
  disabled = false,
  readOnly = false,
}: ComboboxInputProps<T>) {
  const [open, setOpen] = useState(false);
  const commandListRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const element = commandListRef.current;
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const atTop = scrollTop === 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight;

    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
      e.preventDefault();
      return;
    }

    element.scrollTop += e.deltaY;
    e.preventDefault();
  };

  const getDisplayValue = (item: T): string => {
    if (item === null || item === undefined) return '';
    if (typeof item === 'string') return item;
    if (displayKey && item && typeof item === 'object') {
      const value = item[displayKey];
      return value !== null && value !== undefined ? String(value) : '';
    }
    return '';
  };

  const getValue = (item: T): string => {
    if (item === null || item === undefined) return '';
    if (typeof item === 'string') return item;
    if (valueKey && item && typeof item === 'object') {
      const value = item[valueKey];
      return value !== null && value !== undefined ? String(value) : '';
    }
    return '';
  };

  if (readOnly) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <label className="text-sm font-medium text-black/70">{label}</label>
        <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ">
          <span className="truncate">
            {value || <span className="text-muted-foreground">Not selected</span>}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full h-10 justify-between truncate"
            disabled={isLoading || disabled}
          >
            <span className="truncate">
              {isLoading ? "Loading..." : value || placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={placeholder}
              onValueChange={(inputValue) => {
                if (onCustomInput) {
                  const hasMatch = options.some(option => {
                    const displayValue = getDisplayValue(option);
                    return displayValue.toLowerCase().includes(inputValue.toLowerCase());
                  });
                  if (!hasMatch) {
                    onCustomInput(inputValue);
                  }
                }
              }}
            />
            <CommandList 
              ref={commandListRef}
              className="max-h-64 overflow-y-auto"
              onWheel={handleWheel}
            >
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup className="overflow-y-auto">
                {options.map((item, index) => {
                  if (item === null || item === undefined) return null;
                  
                  const displayValue = getDisplayValue(item);
                  const itemValue = getValue(item);
                  const additionalData = additionalDataKey && typeof item === 'object' && item !== null
                    ? String(item[additionalDataKey] ?? '')
                    : null;

                  return (
                    <CommandItem
                      key={typeof item === 'string' ? `${item}-${index}` : itemValue}
                      value={displayValue}
                      onSelect={() => {
                        onSelect(displayValue, item);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === displayValue ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {displayValue}
                      {additionalData && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {additionalData}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}