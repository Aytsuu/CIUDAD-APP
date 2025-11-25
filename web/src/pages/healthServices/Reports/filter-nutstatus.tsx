// components/filters/filter-status.tsx
import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface StatusOption {
  value: string;
  label: string;
}

interface FilterStatusProps {
  statusOptions: StatusOption[];
  groupedStatuses: Record<string, StatusOption[]>;
  selectedStatuses: string[];
  onStatusSelection: (status: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

export function FilterStatus({ statusOptions, groupedStatuses, selectedStatuses, onStatusSelection, onSelectAll }: FilterStatusProps) {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="relative">
      <Button onClick={() => setShowFilter(!showFilter)} className="gap-2" variant="outline">
        <Filter className="h-4 w-4" />
        Filter Status
        {selectedStatuses.length > 0 && ` (${selectedStatuses.length})`}
      </Button>

      {showFilter && (
        <div className="absolute top-full right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-white border rounded-md shadow-lg z-10 p-3">
          <div className="flex items-center space-x-2 mb-2 p-2 border-b">
            <Checkbox
              id="select-all-statuses"
              checked={selectedStatuses.length === statusOptions.length - 1} // -1 to exclude "all" option
              onCheckedChange={(checked) => onSelectAll(checked as boolean)}
            />
            <Label htmlFor="select-all-statuses" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Select All
            </Label>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {Object.entries(groupedStatuses).map(([category, options]) => (
              <div key={category}>
                <div className="font-semibold text-xs uppercase text-gray-500 mt-2 mb-1 px-2">{category}</div>
                {options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                    <Checkbox id={`status-${option.value}`} checked={selectedStatuses.includes(option.value)} onCheckedChange={(checked) => onStatusSelection(option.value, checked as boolean)} />
                    <Label htmlFor={`status-${option.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
