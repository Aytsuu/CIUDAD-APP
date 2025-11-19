import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button/button';
import { getActivityLogById } from './restful-api/activityLogAPI';
import { Spinner } from '@/components/ui/spinner';
import { ActivityLog } from './queries/ActlogQueries';
import { ChevronLeft } from 'lucide-react';

const ActivityLogView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<ActivityLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/record/activity-log');
    }
  };

  useEffect(() => {
    if (id) {
      getActivityLogById(Number(id))
        .then((data) => setActivity(data))
        .catch(() => setError('Failed to load activity log.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-snow min-h-screen w-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="bg-snow min-h-screen w-full flex items-center justify-center">
        <div className="text-center text-red-500 text-sm sm:text-base">
          {error || 'Activity log not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-snow min-h-screen w-full p-6">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex flex-row items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleBack}>
            <ChevronLeft />
          </Button>
          <h1 className="font-semibold text-2xl text-darkBlue2">Activity Log Details</h1>
        </div>
        <p className="text-xs sm:text-sm text-darkGray ml-12">
          View the context of each recorded action for transparency
        </p>
      </div>
      <hr className="border-gray mb-5 sm:mb-4" />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden">
                  {activity.staff_profile_image ? (
                    <img
                      src={activity.staff_profile_image}
                      alt={activity.staff_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full bg-[#1273B8]/10 flex items-center justify-center text-[#1273B8] font-semibold text-sm">${activity.staff_name?.[0] ?? 'U'}</div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1273B8]/10 flex items-center justify-center text-[#1273B8] font-semibold text-sm">
                      {activity.staff_name?.[0] ?? 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Staff</div>
                  <div className="text-base font-medium text-darkBlue2">{activity.staff_name}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`items-center px-3 py-1 rounded-full text-xs font-medium border ${
                    activity.act_type.toLowerCase().includes('delete')
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : activity.act_type.toLowerCase().includes('create')
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : activity.act_type.toLowerCase().includes('update')
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {activity.act_type}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row bg-slate-50">
              <div className="flex-1 border rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-1">Record ID</div>
                <div className="text-sm font-medium text-gray-800">{activity.act_record_id || '—'}</div>
              </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-slate-50">
                <div className="text-xs text-gray-500 mb-1">Date</div>
                <div className="text-sm font-medium text-gray-800">
                  {new Date(activity.act_timestamp).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-slate-50">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-sm font-medium text-gray-800">
                  {new Date(activity.act_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-slate-50">
                <div className="text-xs text-gray-500 mb-1">Action</div>
                <div className="text-sm font-medium text-gray-800 capitalize">
                  {activity.act_action || activity.act_type}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Description</div>
              <div className="text-gray-700 bg-gray-50 p-4 rounded-md border leading-relaxed">
                {activity.act_description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogView;
