import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { PlusCircle, Search, Archive, X, ListFilterIcon } from "lucide-react";
import { Link } from "react-router";
import { FaRegQuestionCircle } from "react-icons/fa";

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
  timeFilter: string | null;
  setTimeFilter: (value: string | null) => void;
  buttons?: ButtonConfig;
};

export default function ComplaintFilterBar({
  searchQuery,
  setSearchQuery,
  buttons = {
    filter: true,
    request: true,
    archived: true,
    newReport: true,
    rejected: false,
    requestCount: 0,
    rejectedCount: 0,
  }
}: Props) {
  const clearSearch = () => setSearchQuery("");

  return (
    <div className="space-y-4 border-b-2">
      <div className="flex flex-wrap gap-2 bg-white p-4 justify-between">
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
        <div className="flex gap-2">
          {buttons.filter && (
              <Button
                variant="outline"
                className="gap-2 text-darkGray hover:text-black"
              >
                <ListFilterIcon size={16} className="text-gray-400" />
                <span>Filter</span>
              </Button>
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

          {buttons.rejected && (
            <Link to="/complaint/rejected">
              <Button
                variant="outline"
                className="gap-2 text-darkGray hover:text-black"
              >
                <X size={16} className="text-gray-400" />
                <span>Rejected</span>
                <span className="h-5 w-5 rounded-full bg-red-500 text-white">
                  {buttons.rejectedCount || 0}
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