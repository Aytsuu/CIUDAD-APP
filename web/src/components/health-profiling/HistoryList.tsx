import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, ChevronDown, ChevronUp } from 'lucide-react';

interface HistoryItem {
  history_id: string;
  history_date: string;
  history_type: string;
  history_user_name?: string;
  [key: string]: any;
}

interface HistoryListProps {
  history: HistoryItem[];
  entityType: 'ncd' | 'tb' | 'survey' | 'water-supply' | 'sanitary-facility' | 'solid-waste';
  entityTitle: string;
  isLoading?: boolean;
}

export const HistoryList = ({ history, isLoading }: HistoryListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="mx-auto h-12 w-12 mb-2 text-gray-400" />
        <p>No update history available</p>
      </div>
    );
  }

  const getHistoryTypeBadge = (type: string) => {
    switch (type) {
      case '+':
        return <Badge className="bg-green-500">Created</Badge>;
      case '~':
        return <Badge className="bg-blue-500">Updated</Badge>;
      case '-':
        return <Badge className="bg-red-500">Deleted</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      // NCD fields
      ncd_riskclass_age: 'Risk Class/Age',
      ncd_comorbidities: 'Comorbidities',
      ncd_lifestyle_risk: 'Lifestyle Risk',
      ncd_maintenance_status: 'Maintenance Status',
      // TB fields
      tb_meds_source: 'Medication Source',
      tb_days_taking_meds: 'Days Taking Meds',
      tb_status: 'TB Status',
      // Survey fields
      si_filled_by: 'Filled By',
      si_informant: 'Informant',
      si_checked_by: 'Checked By',
      si_date: 'Date',
      // Water Supply fields
      water_sup_type: 'Water Supply Type',
      water_conn_type: 'Connection Type',
      water_sup_desc: 'Description',
      // Sanitary Facility fields
      sf_type: 'Facility Type',
      sf_desc: 'Facility Description',
      sf_toilet_type: 'Toilet Type',
      // Solid Waste fields
      swn_desposal_type: 'Disposal Type',
      swm_desc: 'Description',
    };
    return labels[key] || key;
  };

  const getChangedFields = (current: HistoryItem, previous: HistoryItem | undefined) => {
    if (!previous) return [];
    
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
    const ignoreFields = ['history_id', 'history_date', 'history_type', 'history_user', 'history_user_name'];
    
    Object.keys(current).forEach(key => {
      if (!ignoreFields.includes(key) && current[key] !== previous[key]) {
        changes.push({
          field: getFieldLabel(key),
          oldValue: previous[key] || 'None',
          newValue: current[key] || 'None'
        });
      }
    });
    
    return changes;
  };

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto">
      {history.map((item, index) => {
        const nextItem = history[index + 1];
        const isExpanded = expandedId === item.history_id;
        const changes = item.history_type === '~' ? getChangedFields(item, nextItem) : [];
        
        return (
          <Card
            key={item.history_id}
            className="p-3 transition-colors"
          >
            <div 
              className="cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : item.history_id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium">
                    {item.history_user_name || 'Unknown User'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getHistoryTypeBadge(item.history_type)}
                  {item.history_type === '~' && changes.length > 0 && (
                    isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <p>{new Date(item.history_date).toLocaleString()}</p>
              </div>
            </div>

            {/* Show changes if expanded */}
            {isExpanded && item.history_type === '~' && changes.length > 0 && (
              <div className="mt-3 pt-3 border-t space-y-2">
                <p className="text-xs font-semibold text-gray-700">Changes:</p>
                {changes.map((change, idx) => (
                  <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                    <p className="font-medium text-gray-700">{change.field}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-red-600">From: {String(change.oldValue)}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600">To: {String(change.newValue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show message for creation/deletion */}
            {item.history_type === '+' && (
              <div className="mt-2 text-xs text-green-600">
                <p className="italic">Record created</p>
              </div>
            )}
            {item.history_type === '-' && (
              <div className="mt-2 text-xs text-red-600">
                <p className="italic">Record deleted</p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
