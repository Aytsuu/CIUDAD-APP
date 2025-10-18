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
      // Track methods
      const method = record.method_used === "Others" && record.otherMethod 
        ? record.otherMethod 
        : record.method_used;
      if (method) methodsUsed.add(method);

      // Track follow-up status
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
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Methods',
      value: stats.methodsUsed,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Completed',
      value: stats.completedFollowUps,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Follow-up Today',
      value: stats.dueTodayFollowUps,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {statCards.map((stat, index) => (
          <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 truncate">{stat.title}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {stats.missedFollowUps > 0 && (
          <Card className="border border-red-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 truncate">Missed</p>
                  <p className="text-lg font-bold text-red-600">{stats.missedFollowUps}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};