// components/filters/filter-sitio.tsx
import { useState } from "react";
import { Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Sitio {
  id: string;
  sitio_name: string;
}

interface FilterSitioProps {
  sitios: Sitio[];
  isLoading?: boolean;
  selectedSitios: string[];
  onSitioSelection: (sitioName: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onManualSearch: (value: string) => void;
  manualSearchValue: string;
}

export function FilterSitio({ sitios, isLoading = false, selectedSitios, onSitioSelection, onSelectAll, onManualSearch, manualSearchValue }: FilterSitioProps) {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="relative">
      <Button onClick={() => setShowFilter(!showFilter)} className="gap-2" variant="outline">
        <Filter className="h-4 w-4" />
        Filter Sitios
        {selectedSitios.length > 0 && ` (${selectedSitios.length})`}
      </Button>

      {showFilter && (
        <div className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-y-auto bg-white border rounded-md shadow-lg z-10 p-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading sitios...
            </div>
          ) : (
            <>
              <div className="mb-2">
                <Input placeholder="Search sitios..." value={manualSearchValue} onChange={(e) => onManualSearch(e.target.value)} className="w-full text-sm" />
              </div>

              <div className="flex items-center space-x-2 mb-2 p-2 border-b">
                <Checkbox id="select-all-sitios" checked={selectedSitios.length === sitios.length && sitios.length > 0} onCheckedChange={(checked) => onSelectAll(checked as boolean)} />
                <Label htmlFor="select-all-sitios" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Select All
                </Label>
              </div>

              <div className="max-h-48 overflow-y-auto">
                {sitios.map((sitio) => (
                  <div key={sitio.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                    <Checkbox id={`sitio-${sitio.id}`} checked={selectedSitios.includes(sitio.sitio_name)} onCheckedChange={(checked) => onSitioSelection(sitio.sitio_name, checked as boolean)} />
                    <Label htmlFor={`sitio-${sitio.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {sitio.sitio_name}
                    </Label>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
