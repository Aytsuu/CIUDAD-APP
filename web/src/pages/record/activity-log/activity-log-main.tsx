import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button/button';
import { useNavigate } from 'react-router';
import { getAllActivityLogs } from './restful-api/activityLogAPI';
import { Search, UserCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface ActivityLog {
  act_id: number;
  act_timestamp: string;
  act_type: string;
  act_description: string;
  feat: number | null;
  staff: number | null;
  staff_name: string;
}

function groupByDate(logs: ActivityLog[]) {
  return logs.reduce((acc, log) => {
    const date = new Date(log.act_timestamp).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, ActivityLog[]>);
}

const ActivityLogMain = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAllActivityLogs()
      .then((data) => setLogs(data))
      .catch(() => setError('Failed to load activity logs.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) =>
      l.act_type?.toLowerCase().includes(q) ||
      l.act_description?.toLowerCase().includes(q) ||
      l.staff_name?.toLowerCase().includes(q)
    );
  }, [logs, query]);

  const grouped = groupByDate(filteredLogs);
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="px-6 py-6 w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-darkBlue2">Activity Logs</h2>
        <p className="text-sm text-darkGray">Manage and view activity logs</p>
      </div>

      <div className="mb-5">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by type, description, or staff..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1273B8]/20 focus:border-[#1273B8]/40 text-sm"
          />
        </div>
      </div>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}
      {error && <div className="text-center text-red-500 py-8">{error}</div>}
      {!loading && !error && filteredLogs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border">
          <div className="text-gray-500 text-lg mb-2">No activity logs found</div>
          <div className="text-gray-400 text-sm">There are currently no activity logs to display.</div>
        </div>
      )}
      {!loading && !error && filteredLogs.length > 0 && (
        <div className="flex flex-col gap-6">
          {sortedDates.map((date) => (
            <div key={date} className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 pt-4 pb-2 text-lg font-semibold text-gray-700">
                {new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              {grouped[date].map((log) => (
                <div key={log.act_id} className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-full bg-[#1273B8]/10 flex items-center justify-center text-[#1273B8] font-semibold border border-[#1273B8]/20">
                      {log.staff_name?.[0] ?? 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            log.act_type.toLowerCase().includes('delete') ? 'bg-red-400' :
                            log.act_type.toLowerCase().includes('create') ? 'bg-green-400' :
                            log.act_type.toLowerCase().includes('update') ? 'bg-yellow-400' :
                            'bg-blue-400'
                          }`}></div>
                          <span className="font-semibold text-darkBlue2">
                            {log.act_type}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <UserCircle className="w-5 h-5" />
                          {log.staff_name}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{new Date(log.act_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <Button className="px-4" variant="outline" onClick={() => navigate(`/record/activity-log/${log.act_id}`)}>View</Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLogMain;
