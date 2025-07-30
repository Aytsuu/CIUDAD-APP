import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button/button';
import { getActivityLogById } from './restful-api/activityLogAPI';

interface ActivityLog {
  act_id: number;
  act_timestamp: string;
  act_type: string;
  act_description: string;
  feat: number | null;
  staff: number | null;
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error || !activity) return <div className="p-8 text-center text-red-500">{error || 'Activity log not found.'}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-start">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          ← Back
        </Button>
      </div>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Activity Log Details</h1>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Staff #{activity.staff}</h2>
            <span className="px-3 py-1 rounded text-sm bg-blue-100 text-blue-800">
              {activity.act_type}
            </span>
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
  );
};

export default ActivityLogView;
