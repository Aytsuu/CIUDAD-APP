import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button/button';
import { useNavigate } from 'react-router';
import { getActivityLogs } from './restful-api/activityLogAPI';
import { Search, UserCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useQuery } from '@tanstack/react-query';
import { useLoading } from '@/context/LoadingContext';
import { useDebounce } from '@/hooks/use-debounce';
import { ActivityLog, ActivityLogResponse } from './queries/ActlogQueries';
import PaginationLayout from '@/components/ui/pagination/pagination-layout';

function groupByDate(logs: ActivityLog[]) {
  return logs.reduce((acc, log) => {
    const date = new Date(log.act_timestamp).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, ActivityLog[]>);
}

const ActivityLogMain = () => {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("all");
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  
  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(query, 500);

  const { data: activityLogsData, isLoading, error } = useQuery<ActivityLogResponse>({
    queryKey: ["activityLogs", currentPage, debouncedQuery, filterType],
    queryFn: () => getActivityLogs(debouncedQuery, currentPage, 10, filterType === "all" ? undefined : filterType),
  });

  // Handle loading state
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, filterType]);

  const logs = activityLogsData?.results || [];
  const totalCount = activityLogsData?.count || 0;
  const totalPages = Math.ceil(totalCount / 10);
  

  const grouped = groupByDate(logs);
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="px-6 py-6 w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-darkBlue2">Activity Logs</h2>
        <p className="text-sm text-darkGray">Manage and view activity logs</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by type, description, or staff..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1273B8]/20 focus:border-[#1273B8] text-sm transition-all duration-200 hover:border-gray-400"
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none w-full lg:w-48 px-4 py-3 pr-10 rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1273B8]/20 focus:border-[#1273B8] text-sm transition-all duration-200 hover:border-gray-400 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="view">View</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
      </div>
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading activity logs...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center py-16 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-600 text-lg font-medium mb-2">Failed to load activity logs</div>
          <div className="text-red-500 text-sm">Please try refreshing the page or contact support if the problem persists.</div>
        </div>
      )}
      
      {!isLoading && !error && logs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <div className="text-gray-600 text-lg font-medium mb-2">
            {query || filterType !== "all" ? "No matching activity logs found" : "No activity logs found"}
          </div>
          <div className="text-gray-400 text-sm">
            {query || filterType !== "all" 
              ? "Try adjusting your search terms or filters" 
              : "Activity logs will appear here when actions are performed in the system"
            }
          </div>
        </div>
      )}
      {!isLoading && !error && logs.length > 0 && (
        <div className="flex flex-col gap-6">
          {sortedDates.map((date) => (
            <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="text-lg font-semibold text-gray-800">
                  {new Date(date).toLocaleDateString(undefined, { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {grouped[date].length} activit{grouped[date].length !== 1 ? 'ies' : 'y'}
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {grouped[date].map((log) => (
                  <div key={log.act_id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full border border-gray-200 flex-shrink-0 overflow-hidden">
                        {log.staff_profile_image ? (
                          <img
                            src={log.staff_profile_image}
                            alt={log.staff_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to letter if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="w-full h-full bg-[#1273B8]/10 flex items-center justify-center text-[#1273B8] font-semibold text-sm">${log.staff_name?.[0] ?? 'U'}</div>`;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-[#1273B8]/10 flex items-center justify-center text-[#1273B8] font-semibold text-sm">
                            {log.staff_name?.[0] ?? 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-2 h-2 rounded-full ${
                            log.act_type.toLowerCase().includes('delete') ? 'bg-red-500' :
                            log.act_type.toLowerCase().includes('create') ? 'bg-green-500' :
                            log.act_type.toLowerCase().includes('update') ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}></div>
                          <span className="font-semibold text-gray-900 text-sm">
                            {log.act_type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.act_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                          {log.act_description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <UserCircle className="w-4 h-4" />
                            {log.staff_name}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Button 
                          className="px-3 py-1 text-xs" 
                          variant="outline" 
                          onClick={() => navigate(`/record/activity-log/${log.act_id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination Controls */}
      {!isLoading && !error && logs.length > 0 && totalPages > 1 && (
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span>-<span className="font-medium">{Math.min(currentPage * 10, totalCount)}</span> of <span className="font-medium">{totalCount}</span> rows
            </div>
            <PaginationLayout
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogMain;
