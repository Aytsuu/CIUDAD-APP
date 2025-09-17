import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, AlertTriangle} from 'lucide-react';

interface FollowUpRecord {
  fprecord?: string;
  dateOfFollowUp?: string;
  followv_status?: string;
  method_used?: string;
  otherMethod?: string;
  created_at: string;
}

interface FollowUpTimelineProps {
  records: FollowUpRecord[];
  onAddFollowUp: (record: FollowUpRecord) => void;
}

export const FollowUpTimeline: React.FC<FollowUpTimelineProps> = ({ records }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status?: string, date?: string) => {
    if (!status || !date) {
      return {
        icon: Clock,
        color: 'bg-muted',
        textColor: 'text-muted-foreground',
        badge: 'No Follow-up',
        badgeVariant: 'secondary' as const
      };
    }

    const today = new Date();
    const followUpDate = new Date(date);
    today.setHours(0, 0, 0, 0);
    followUpDate.setHours(0, 0, 0, 0);

    if (status.toLowerCase() === 'completed') {
      return {
        icon: CheckCircle,
        color: 'bg-green',
        textColor: 'text-white',
        badge: 'Completed',
        badgeVariant: 'default' as const
      };
    }

    if (status.toLowerCase() === 'pending') {
      if (followUpDate < today) {
        return {
          icon: AlertTriangle,
          color: 'bg-medical-danger',
          textColor: 'text-white',
          badge: 'Missed',
          badgeVariant: 'destructive' as const
        };
      } else if (followUpDate.getTime() === today.getTime()) {
        return {
          icon: Clock,
          color: 'bg-medical-warning',
          textColor: 'text-white',
          badge: 'Due Today',
          badgeVariant: 'secondary' as const
        };
      } else {
        return {
          icon: Clock,
          color: 'bg-medical-info',
          textColor: 'text-white',
          badge: 'Pending',
          badgeVariant: 'outline' as const
        };
      }
    }

    return {
      icon: Clock,
      color: 'bg-muted',
      textColor: 'text-muted-foreground',
      badge: status,
      badgeVariant: 'secondary' as const
    };
  };

  // Get upcoming follow-ups (next 7 days)
  const upcomingFollowUps = records.filter(record => {
    if (!record.dateOfFollowUp || !record.followv_status) return false;
    
    const followUpDate = new Date(record.dateOfFollowUp);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return (
      record.followv_status.toLowerCase() === 'pending' &&
      followUpDate >= today &&
      followUpDate <= nextWeek
    );
  }).sort((a, b) => {
    return new Date(a.dateOfFollowUp!).getTime() - new Date(b.dateOfFollowUp!).getTime();
  });

  // Get recent records with follow-ups
  const recentRecords = records
    .filter(record => record.dateOfFollowUp)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Upcoming Follow-ups */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Follow-ups
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingFollowUps.length > 0 ? (
            upcomingFollowUps.map((record, index) => {
              const statusConfig = getStatusConfig(record.followv_status, record.dateOfFollowUp);
              const method = record.method_used === 'Others' && record.otherMethod 
                ? record.otherMethod 
                : record.method_used;
              
              return (
                <div key={record.fprecord || index} className="flex items-center gap-3 p-3 bg-gradient-card rounded-lg">
                  <div className={`p-2 rounded-full ${statusConfig.color} ${statusConfig.textColor}`}>
                    <statusConfig.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{method || 'N/A'}</p>
                      <Badge variant={statusConfig.badgeVariant} className="text-xs">
                        {statusConfig.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(record.dateOfFollowUp || '')}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming follow-ups</p>
            </div>
          )}
        </CardContent>
      </Card>

    
    </div>
  );
};