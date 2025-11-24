import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  Search,
  X,
  ListFilterIcon,
  CalendarIcon,
} from "lucide-react";
import { Link } from "react-router";
import { FaRegQuestionCircle } from "react-icons/fa";

export type FilterState = {
  types: string[];
  statuses: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
};

type ButtonConfig = {
  filter?: boolean;
  request?: boolean;
  archived?: boolean;
  newReport?: boolean;
  rejected?: boolean;
  requestCount?: number;
  rejectedCount?: number;
};

type Props = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  availableTypes: string[];
  availableStatuses: string[];
  buttons?: ButtonConfig;
};

export default function ComplaintFilterBar({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  availableTypes,
  availableStatuses,
  buttons = {
    filter: true,
    request: true,
    archived: true,
    newReport: true,
    rejected: false,
    requestCount: 0,
    rejectedCount: 0,
  },
}: Props) {
  const clearSearch = () => setSearchQuery("");

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    setFilters({ ...filters, types: newTypes });
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    setFilters({ ...filters, statuses: newStatuses });
  };

  const handleDateChange = (field: "start" | "end", value: string) => {
    setFilters({
      ...filters,
      dateRange: { ...filters.dateRange, [field]: value || null },
    });
  };

  const clearDateFilter = () => {
    setFilters({
      ...filters,
      dateRange: { start: null, end: null },
    });
  };

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.statuses.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;

  return (
    <div className="space-y-4 border-b-2">
      <div className="flex flex-wrap gap-2 bg-white p-4 justify-between">
        <div className="flex gap-x-2 flex-wrap">
          <div className="relative min-w-96">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Search..."
              className="pl-10 pr-10 h-9 border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all duration-200 rounded-lg w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Type Filter Dropdown */}
          {buttons.filter && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`gap-2 hover:text-black ${
                    filters.types.length > 0
                      ? "text-indigo-600 border-indigo-300 bg-indigo-50"
                      : "text-darkGray"
                  }`}
                >
                  <ListFilterIcon size={16} className="text-gray-400" />
                  <span>Type</span>
                  {filters.types.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                      {filters.types.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {availableTypes.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={filters.types.includes(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                  >
                    {type}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Status Filter Dropdown */}
          {buttons.filter && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`gap-2 hover:text-black ${
                    filters.statuses.length > 0
                      ? "text-indigo-600 border-indigo-300 bg-indigo-50"
                      : "text-darkGray"
                  }`}
                >
                  <ListFilterIcon size={16} className="text-gray-400" />
                  <span>Status</span>
                  {filters.statuses.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                      {filters.statuses.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {availableStatuses.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filters.statuses.includes(status)}
                    onCheckedChange={() => handleStatusToggle(status)}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Date Filter Dropdown */}
          {buttons.filter && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`gap-2 hover:text-black ${
                    filters.dateRange.start || filters.dateRange.end
                      ? "text-indigo-600 border-indigo-300 bg-indigo-50"
                      : "text-darkGray"
                  }`}
                >
                  <CalendarIcon size={16} className="text-gray-400" />
                  <span>Date</span>
                  {(filters.dateRange.start || filters.dateRange.end) && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                      •
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-3">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      From
                    </label>
                    <Input
                      type="date"
                      value={filters.dateRange.start || ""}
                      onChange={(e) =>
                        handleDateChange("start", e.target.value)
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      To
                    </label>
                    <Input
                      type="date"
                      value={filters.dateRange.end || ""}
                      onChange={(e) => handleDateChange("end", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  {(filters.dateRange.start || filters.dateRange.end) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearDateFilter}
                      className="w-full text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear dates
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setFilters({
                    types: [],
                    statuses: [],
                    dateRange: { start: null, end: null },
                  })
                }
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                <X />
                Clear
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {buttons.request && (
            <Link to="/complaint/archive">
              <Button
                variant="outline"
                className="gap-2 text-darkGray hover:text-black"
              >
                <FaRegQuestionCircle size={16} className="text-gray-400" />
                <span>Archive</span>
              </Button>
            </Link>
          )}
          {buttons.request && (
            <Link to="/complaint/request">
              <Button
                variant="outline"
                className="gap-2 text-darkGray hover:text-black"
              >
                <FaRegQuestionCircle size={16} className="text-gray-400" />
                <span>Request</span>
                <span className="flex items-center justify-center h-6 font-semibold w-7 rounded-md bg-orange-100 text-red-500">
                  {buttons.requestCount || 0}
                </span>
              </Button>
            </Link>
          )}
          {buttons.newReport && (
            <Link to="/complaint/report" className="sm:ml-auto">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow-sm transition-all duration-200 flex items-center gap-2 h-9 px-4 rounded-lg">
                <PlusCircle />
                <span className="hidden sm:inline">New Report</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
