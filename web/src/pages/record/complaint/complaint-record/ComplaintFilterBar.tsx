import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Archive, Calendar, ChevronDown, X } from "lucide-react"
import { Link } from "react-router"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

type Props = {
  searchQuery: string
  setSearchQuery: (value: string) => void
  timeFilter: string | null
  setTimeFilter: (value: string | null) => void
  pageSize: number
  setPageSize: (size: number) => void
}

const timeFilterLabels = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  year: "This Year",
}

export default function ComplaintFilterBar({ searchQuery, setSearchQuery, timeFilter, setTimeFilter }: Props) {
  const clearSearch = () => setSearchQuery("")
  const clearTimeFilter = () => setTimeFilter(null)

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search complaints by name, ID, or description..."
            className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50 focus:bg-white transition-all duration-200 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Action Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Left side - Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Time Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`flex items-center gap-2 h-10 border-gray-300 hover:bg-gray-50 transition-all duration-200 ${
                    timeFilter ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100" : "hover:border-gray-400"
                  }`}
                >
                  <Calendar size={16} />
                  {timeFilter ? timeFilterLabels[timeFilter as keyof typeof timeFilterLabels] : "All Time"}
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 p-1" align="start">
                <DropdownMenuItem
                  onClick={() => setTimeFilter(null)}
                  className="flex items-center justify-between cursor-pointer rounded-md"
                >
                  All Time
                  {!timeFilter && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTimeFilter("today")}
                  className="flex items-center justify-between cursor-pointer rounded-md"
                >
                  Today
                  {timeFilter === "today" && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTimeFilter("week")}
                  className="flex items-center justify-between cursor-pointer rounded-md"
                >
                  This Week
                  {timeFilter === "week" && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTimeFilter("month")}
                  className="flex items-center justify-between cursor-pointer rounded-md"
                >
                  This Month
                  {timeFilter === "month" && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTimeFilter("year")}
                  className="flex items-center justify-between cursor-pointer rounded-md"
                >
                  This Year
                  {timeFilter === "year" && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Active Filters Display */}
            {(searchQuery || timeFilter) && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Filters:</span>
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                  >
                    Search: "{searchQuery.length > 20 ? searchQuery.substring(0, 20) + "..." : searchQuery}"
                    <button
                      onClick={clearSearch}
                      className="ml-1 hover:bg-blue-300 rounded-full p-0.5 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                )}
                {timeFilter && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                  >
                    {timeFilterLabels[timeFilter as keyof typeof timeFilterLabels]}
                    <button
                      onClick={clearTimeFilter}
                      className="ml-1 hover:bg-green-300 rounded-full p-0.5 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearSearch()
                    clearTimeFilter()
                  }}
                  className="text-gray-500 hover:text-gray-700 h-7 px-2 text-xs hover:bg-gray-100 transition-colors"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Right side - Action Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/complaint-report">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 h-10">
                <Plus size={16} />
                New Report
              </Button>
            </Link>
            <Link to="/complaint-archive">
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2 h-10 transition-all duration-200"
              >
                <Archive size={16} />
                Archived
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
