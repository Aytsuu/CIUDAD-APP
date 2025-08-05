import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button/button';
import { getActivityLogById } from './restful-api/activityLogAPI';
import { Loader2 } from 'lucide-react';

interface ActivityLog {
  act_id: number;
  act_timestamp: string;
  act_type: string;
  act_description: string;
  feat: number | null;
  staff: number | null;
  staff_name: string;
}

const ActivityLogView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<ActivityLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getActivityLogById(Number(id))
        .then((data) => setActivity(data))
        .catch(() => setError('Failed to load activity log.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#1273B8]" />
    </div>
  );
  if (error || !activity) return <div className="p-8 text-center text-red-500">{error || 'Activity log not found.'}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-start mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          ← Back
        </Button>
      </div>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-darkBlue2">Activity Log Details</h1>
          </div>
        <div className="space-y-6">
                     <div className="flex flex-col gap-4">
             <div className="flex items-center gap-4">
               <h2 className="text-xl font-semibold">{activity.staff_name}</h2>
             </div>
             <div className="flex items-center gap-3">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                 <span className="text-sm font-medium text-gray-600">Activity Type:</span>
               </div>
                               <span className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm border-2 ${
                  activity.act_type.toLowerCase().includes('delete') ? 'bg-red-100 text-red-800 border-red-300' :
                  activity.act_type.toLowerCase().includes('create') ? 'bg-green-100 text-green-800 border-green-300' :
                  activity.act_type.toLowerCase().includes('update') ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                  'bg-blue-100 text-blue-800 border-blue-300'
                }`}>
                  {activity.act_type}
                </span>
             </div>
           </div>
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">Event Details</h3>
            <div className="space-y-2 text-sm">
              <div>Date: {new Date(activity.act_timestamp).toLocaleDateString()}</div>
              <div>Time: {new Date(activity.act_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded">
              {activity.act_description}
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogView;
