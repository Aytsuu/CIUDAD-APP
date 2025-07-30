import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button/button';
import { useNavigate } from 'react-router';
import { getAllActivityLogs } from './restful-api/activityLogAPI';

interface ActivityLog {
  act_id: number;
  act_timestamp: string;
  act_type: string;
  act_description: string;
  feat: number | null;
  staff: number | null;
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
  const navigate = useNavigate();

  useEffect(() => {
    getAllActivityLogs()
      .then((data) => setLogs(data))
      .catch(() => setError('Failed to load activity logs.'))
      .finally(() => setLoading(false));
  }, []);

  const grouped = groupByDate(logs);
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="p-8 w-full">
      <h2 className="text-2xl font-bold text-darkBlue2 mb-1">Activity Logs</h2>
      <p className="text-sm text-darkGray mb-6">Manage and view activity logs</p>
      <hr className="mb-6" />
      {loading && <div className="text-center py-8">Loading...</div>}
      {error && <div className="text-center text-red-500 py-8">{error}</div>}
      {!loading && !error && (
        <div className="flex flex-col gap-6">
          {sortedDates.map((date) => (
            <div key={date} className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 pt-4 pb-2 text-lg font-semibold text-gray-700">{new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              {grouped[date].map((log) => (
                <div key={log.act_id} className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img src="/logo192.png" alt="User" className="w-12 h-12 rounded-full border" />
                    <div>
                      <div className="font-semibold text-lg text-darkBlue2">{log.act_type}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <span className="material-icons text-base align-middle">groups</span>
                          Staff #{log.staff}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{new Date(log.act_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <Button className="border px-6 py-2" variant="outline" onClick={() => navigate(`/record/activity-log/${log.act_id}`)}>View</Button>
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
