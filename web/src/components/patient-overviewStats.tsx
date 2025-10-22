import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react';

interface FPRecord {
  fprecord?: string;
  method_used?: string;
  otherMethod?: string;
  followv_status?: string;
  dateOfFollowUp?: string;
  created_at: string;
}

interface PatientOverviewStatsProps {
  records: FPRecord[];
}

export const PatientOverviewStats: React.FC<PatientOverviewStatsProps> = ({ records }) => {
  const getStats = () => {
    const totalRecords = records.length;
    let completedFollowUps = 0;
    let pendingFollowUps = 0;
    let missedFollowUps = 0;
    let dueTodayFollowUps = 0;
    
    const methodsUsed = new Set<string>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    records.forEach(record => {
      const method = record.method_used === "Others" && record.otherMethod 
        ? record.otherMethod 
        : record.method_used;
      if (method) methodsUsed.add(method);

      if (record.followv_status && record.dateOfFollowUp) {
        const followUpDate = new Date(record.dateOfFollowUp);
        followUpDate.setHours(0, 0, 0, 0);

        if (record.followv_status.toLowerCase() === 'completed') {
          completedFollowUps++;
        } else if (record.followv_status.toLowerCase() === 'pending') {
          if (followUpDate < today) {
            missedFollowUps++;
          } else if (followUpDate.getTime() === today.getTime()) {
            dueTodayFollowUps++;
          } else {
            pendingFollowUps++;
          }
        }
      }
    });

    return {
      totalRecords,
      completedFollowUps,
      pendingFollowUps,
      missedFollowUps,
      dueTodayFollowUps,
      methodsUsed: methodsUsed.size
    };
  };

  const stats = getStats();

  const statCards = [
    {
      title: 'Records',
      value: stats.totalRecords,
      icon: Activity,
      color: 'text-indigo-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-blue-50',
      borderColor: 'border-indigo-100'
    },
    {
      title: 'Methods',
      value: stats.methodsUsed,
      icon: Calendar,
      color: 'text-violet-600',
      bgColor: 'bg-gradient-to-br from-violet-50 to-purple-50',
      borderColor: 'border-violet-100'
    },
    {
      title: 'Completed',
      value: stats.completedFollowUps,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-100'
    },
    {
      title: 'Follow-up Today',
      value: stats.dueTodayFollowUps,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
      borderColor: 'border-amber-100'
    }
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <Card 
            key={index} 
            className={`border ${stat.borderColor} bg-white shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 rounded-xl overflow-hidden`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${stat.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                  <stat.icon className={`h-5 w-5 ${stat.color} transition-colors duration-300`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 truncate tracking-tight">{stat.title}</p>
                  <p className="text-xl font-semibold text-gray-800">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {stats.missedFollowUps > 0 && (
          <Card 
            className="border border-rose-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 rounded-xl overflow-hidden"
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gradient-to-br from-rose-50 to-red-50 transition-transform duration-300 group-hover:scale-110">
                  <AlertTriangle className="h-5 w-5 text-rose-600 transition-colors duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 truncate tracking-tight">Missed</p>
                  <p className="text-xl font-semibold text-rose-600">{stats.missedFollowUps}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};