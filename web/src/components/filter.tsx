import React, { useState } from 'react';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { SelectLayout } from './ui/select/select-layout';

// Define filter configurations
const filterConfigs = {
  date: {
    type: 'date-range',
    subFilters: ['Start Date', 'End Date']
  },
  category: {
    type: 'multi-select',
    subFilters: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports']
  },
  price: {
    type: 'range',
    subFilters: ['Min Price', 'Max Price']
  },
  status: {
    type: 'single-select',
    subFilters: ['Active', 'Inactive', 'Pending', 'Completed']
  },
  tags: {
    type: 'checkbox-group',
    subFilters: ['Popular', 'New', 'Sale', 'Featured', 'Limited']
  },
  location: {
    type: 'text-input',
    subFilters: ['City', 'State', 'Country']
  }
};

interface FilterValue {
  [key: string]: any;
}

interface DynamicFilterProps {
  title: string;
  onFilterChange?: (filters: FilterValue) => void;
  availableFilters?: string[];
}

export const DynamicFilter: React.FC<DynamicFilterProps> = ({ 
  title, 
  onFilterChange,
  availableFilters = ['date', 'category', 'price', 'status'] 
}) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValue>({});

  const addFilter = (filterType: string) => {
    if (!activeFilters.includes(filterType)) {
      setActiveFilters([...activeFilters, filterType]);
      // Initialize filter values based on type
      const config = filterConfigs[filterType as keyof typeof filterConfigs];
      const initialValue = getInitialValue(config.type);
      setFilterValues(prev => ({ ...prev, [filterType]: initialValue }));
    }
  };

  const removeFilter = (filterType: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filterType));
    const newValues = { ...filterValues };
    delete newValues[filterType];
    setFilterValues(newValues);
    onFilterChange?.(newValues);
  };

  const getInitialValue = (type: string) => {
    switch (type) {
      case 'date-range':
        return { startDate: null, endDate: null };
      case 'multi-select':
        return [];
      case 'range':
        return { min: '', max: '' };
      case 'single-select':
        return '';
      case 'checkbox-group':
        return [];
      case 'text-input':
        return {};
      default:
        return null;
    }
  };

  const updateFilterValue = (filterType: string, value: any) => {
    const newValues = { ...filterValues, [filterType]: value };
    setFilterValues(newValues);
    onFilterChange?.(newValues);
  };

  const renderSubFilter = (filterType: string, config: any) => {
    const value = filterValues[filterType];

    switch (config.type) {
      case 'date-range':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value?.startDate ? value.startDate.toLocaleDateString() : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={value?.startDate}
                    onSelect={(date) => updateFilterValue(filterType, { ...value, startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value?.endDate ? value.endDate.toLocaleDateString() : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={value?.endDate}
                    onSelect={(date) => updateFilterValue(filterType, { ...value, endDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      case 'multi-select':
        return (
          <div className="space-y-2">
            {config.subFilters.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${filterType}-${option}`}
                  checked={value?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const newValue = checked 
                      ? [...(value || []), option]
                      : (value || []).filter((v: string) => v !== option);
                    updateFilterValue(filterType, newValue);
                  }}
                />
                <Label htmlFor={`${filterType}-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Min</Label>
              <Input
                type="number"
                placeholder="Min value"
                value={value?.min || ''}
                onChange={(e) => updateFilterValue(filterType, { ...value, min: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Max</Label>
              <Input
                type="number"
                placeholder="Max value"
                value={value?.max || ''}
                onChange={(e) => updateFilterValue(filterType, { ...value, max: e.target.value })}
              />
            </div>
          </div>
        );

      case 'single-select':
        return (
          <Select value={value || ''} onValueChange={(val: any) => updateFilterValue(filterType, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {config.subFilters.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox-group':
        return (
          <div className="grid grid-cols-2 gap-2">
            {config.subFilters.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${filterType}-${option}`}
                  checked={value?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const newValue = checked 
                      ? [...(value || []), option]
                      : (value || []).filter((v: string) => v !== option);
                    updateFilterValue(filterType, newValue);
                  }}
                />
                <Label htmlFor={`${filterType}-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'text-input':
        return (
          <div className="space-y-2">
            {config.subFilters.map((field: string) => (
              <div key={field}>
                <Label className="text-xs">{field}</Label>
                <Input
                  placeholder={`Enter ${field.toLowerCase()}`}
                  value={value?.[field] || ''}
                  onChange={(e) => updateFilterValue(filterType, { ...value, [field]: e.target.value })}
                />
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setFilterValues({});
    onFilterChange?.({});
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {activeFilters.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Filter Dropdown */}
        <div className="flex flex-wrap gap-2">
          <Select onValueChange={addFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Add filter..." />
            </SelectTrigger>
            <SelectContent>
              {availableFilters
                .filter(filter => !activeFilters.includes(filter))
                .map(filter => (
                  <SelectItem key={filter} value={filter}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        <div className="space-y-3">
          {activeFilters.map(filterType => {
            const config = filterConfigs[filterType as keyof typeof filterConfigs];
            return (
              <Card key={filterType} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">
                      {filterType}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(filterType)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {renderSubFilter(filterType, config)}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Applied Filters Summary */}
        {Object.keys(filterValues).length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Applied Filters:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto">
              {JSON.stringify(filterValues, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Example usage component
const FilterExample: React.FC = () => {
  const [_, setFilters] = useState({});

  const handleFilterChange = (newFilters: FilterValue) => {
    setFilters(newFilters);
    console.log('Filters changed:', newFilters);
  };

  return (
    <div className="p-6 space-y-6">
      <DynamicFilter
        title="Product Filters"
        onFilterChange={handleFilterChange}
        availableFilters={['date', 'category', 'price', 'status', 'tags', 'location']}
      />
      
      <DynamicFilter
        title="User Filters"
        onFilterChange={handleFilterChange}
        availableFilters={['date', 'status', 'location']}
      />
    </div>
  );
};

export default FilterExample;