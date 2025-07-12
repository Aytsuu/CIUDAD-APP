import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
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
}

const timeFilterLabels = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  year: "This Year",
}

export default function ComplaintFilterBar({ searchQuery, setSearchQuery, timeFilter, setTimeFilter }: Props) {
  const clearSearch = () => setSearchQuery("")

  return (
    <div className="space-y-4 border-b-2">
      {/* First Row - Search + New Report */}
      <div className="flex flex-col sm:flex-row gap-4 w-full py-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search complaints..."
            className="pl-10 pr-10 h-10 border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all duration-200 rounded-lg w-full"
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
        
        <Link to="/complaint/report" className="sm:ml-auto">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow-sm transition-all duration-200 flex items-center gap-2 h-10 px-4 rounded-lg">
            <Plus size={16} />
            <span className="hidden sm:inline">New Report</span>
          </Button>
        </Link>
      </div>

      {/* Second Row - Time Filter + Archive */}
      <div className="flex flex-wrap gap-2 bg-white p-4 justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`flex items-center gap-2 font-medium text-black/70 h-8 border-gray-200 hover:bg-gray-50 transition-all duration-200 rounded-lg ${
                timeFilter ? "border-indigo-400 bg-indigo-50 text-indigo-600" : ""
              }`}
            >
              <Calendar size={16} className={timeFilter ? "text-indigo-500" : "text-gray-500"} />
              {timeFilter ? timeFilterLabels[timeFilter as keyof typeof timeFilterLabels] : "Time"}
              <ChevronDown size={16} className={timeFilter ? "text-indigo-500" : "text-gray-500"} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 p-1 rounded-lg shadow-lg border border-gray-100" align="start">
            <DropdownMenuItem
              onClick={() => setTimeFilter(null)}
              className="flex items-center justify-between cursor-pointer rounded-md px-3 py-2 hover:bg-gray-50 text-sm"
            >
              <span>All Time</span>
              {!timeFilter && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-100" />
            {Object.entries(timeFilterLabels).map(([key, label]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setTimeFilter(key)}
                className="flex items-center justify-between cursor-pointer rounded-md px-3 py-2 hover:bg-gray-50 text-sm"
              >
                <span>{label}</span>
                {timeFilter === key && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Link to="/complaint/archive">
          <Button
            variant="outline"
            className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 flex items-center gap-2 h-8 px-3 transition-all duration-200 rounded-lg bg-transparent font-medium text-black/70"
          >
            <Archive size={16} className="text-gray-300" />
            <span>Archived</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}