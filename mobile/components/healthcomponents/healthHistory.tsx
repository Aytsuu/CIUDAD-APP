import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { 
  ClipboardList, 
  User, 
  AlertTriangle, 
  HeartPulse, 
  Soup, 
  Syringe, 
  Pill 
} from 'lucide-react-native';
import { formatDate } from '@/helpers/dateHelpers';
import { record } from 'zod';

interface ChildHealthHistoryRecord {
  id: string;
  date: string;
  chhist_id?: string;
  created_at?: string;
  height?: string;
  [key: string]: any;
}

interface HealthHistorySectionsProps {
  recordsToDisplay?: ChildHealthHistoryRecord[];
  chhistId?: string;
  supplementStatusesFields?: any[];
}

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon }) => (
  <View className="flex-row items-center mb-4 px-4">
    <View className="mr-3">
      {icon}
    </View>
    <Text className="text-lg font-semibold text-gray-900 flex-1">
      {title}
    </Text>
  </View>
);

interface DataRowProps {
  label: string;
  value: string | number | null | undefined;
  recordDate?: string;
}

const DataRow: React.FC<DataRowProps> = ({ label, value, recordDate }) => (
  <View className="flex-row justify-between items-center py-2 px-4">
    <View className="flex-1">
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
      {recordDate && (
        <Text className="text-xs text-gray-500 mt-1">{recordDate}</Text>
      )}
    </View>
    <View className="flex-1 items-end">
      {value ? (
        <View className="bg-green-50 border border-green-200 rounded-md px-2 py-1">
          <Text className="text-sm text-green-800">{value}</Text>
        </View>
      ) : (
        <Text className="text-sm text-gray-400">No data</Text>
      )}
    </View>
  </View>
);

interface HistoryComparisonProps {
  records: ChildHealthHistoryRecord[];
  fieldKey: string;
  label: string;
}

const HistoryComparison: React.FC<HistoryComparisonProps> = ({ 
  records, 
  fieldKey, 
  label 
}) => {
  if (!records || records.length === 0) {
    return (
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 px-4 mb-2">{label}</Text>
        <View className="px-4">
          <Text className="text-sm text-gray-400">No historical data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4 gap-4">
      <Text className="text-sm font-medium text-gray-700 px-4 mb-2">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-3">
        <View className="flex-row space-x-3">
          {records.map((record, index) => (
            <View key={record.id || record.chhist_id || index} className=" bg-blue-50 border border-gray-200 mr-2 rounded-lg">
              <View className="p-3">
                <Text className="text-xs text-gray-500 mb-1">
                  {formatDate(record.date) || formatDate(record.created_at) || `Record ${index + 1}`}
                </Text>
                <Text className="text-sm font-medium">
                  {record[fieldKey] || 'N/A'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const EmptyState: React.FC<{ message?: string }> = ({ message = "No health records available" }) => (
  <View className="flex-1 justify-center items-center p-8">
    <ClipboardList size={48} color="#9CA3AF" />
    <Text className="text-lg font-medium text-gray-500 mt-4 text-center">
      {message}
    </Text>
    <Text className="text-sm text-gray-400 mt-2 text-center">
      Health records will appear here once they are added.
    </Text>
  </View>
);

const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View className="mb-3 bg-white shadow-sm">
    {children}
  </View>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View className="p-4 border-b border-gray-100">
    {children}
  </View>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View className="p-4 ">
    {children}
  </View>
);

const Separator: React.FC = () => (
  <View className="h-px bg-gray-300 my-3" />
);

export function HealthHistorySections({
  recordsToDisplay = [],
  chhistId = '',
  supplementStatusesFields = [],
}: HealthHistorySectionsProps) {
  // Handle loading or empty state
  if (!recordsToDisplay || recordsToDisplay.length === 0) {
    return <EmptyState />;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* TT Status of Mother Section */}
      <SectionCard>
        <CardHeader>
          <SectionHeader 
            title="TT Status of the Mother" 
            icon={<ClipboardList size={20} color="#6B7280" />} 
          />
        </CardHeader>
        <CardContent>
          {/* <HistoryComparison 
            records={recordsToDisplay}
            fieldKey="tt_status"
            label="TT Status History"

          /> */}
          <Separator />
          {recordsToDisplay.map((record, index) => (
            <DataRow
              key={`tt-${index}`}
              label="TT Status"
              value={record.tt_status}
              recordDate={formatDate(record.created_at || record.date) ?? undefined}
            />
          ))}
        </CardContent>
      </SectionCard>

      {/* Exclusive Breastfeeding Section */}
      <SectionCard>
        <CardHeader>
          <SectionHeader 
            title="Exclusive Breastfeeding Checks" 
            icon={<HeartPulse size={20} color="#6B7280" />} 
          />
        </CardHeader>
        <CardContent>
          <HistoryComparison 
            records={recordsToDisplay}
            fieldKey="exclusive_breastfeeding"
            label="Breastfeeding Status"
          />
          <Separator />
          {recordsToDisplay.map((record, index) => (
            <View key={`ebf-${index}`}>
              <DataRow
                label="Exclusive Breastfeeding"
                value={record.exclusive_breastfeeding ? 'Yes' : 'No'}
                recordDate={formatDate(record.created_at || record.date)}
              />
              <DataRow
                label="Duration (months)"
                value={record.breastfeeding_duration}
              />
            </View>
          ))}
        </CardContent>
      </SectionCard>

      {/* Findings Details Section */}
      <SectionCard>
        <CardHeader>
          <SectionHeader 
            title="Findings Details" 
            icon={<User size={20} color="#6B7280" />} 
          />
        </CardHeader>
        <CardContent>
          {recordsToDisplay.map((record, index) => (
            <View key={`findings-${index}`}>
              <Text className="text-sm font-medium text-gray-600 mb-2">
                Record {index + 1} - {(formatDate(record.created_at || record.date)) || 'No date'}
              </Text>
              <DataRow label="Assessment Summary" value={record.general_findings} />
              <DataRow label="Objective Findings" value={record.physical_exam} />
              <DataRow label="Subjective Findings" value={record.developmental_assessment} />
               <DataRow label="Plan/Treat" value={record.developmental_assessment} />
              {index < recordsToDisplay.length - 1 && <Separator />}
            </View>
          ))}
        </CardContent>
      </SectionCard>

      {/* Disabilities Section */}
      <SectionCard>
        <CardHeader>
          <SectionHeader 
            title="Disabilities" 
            icon={<AlertTriangle size={20} color="#6B7280" />} 
          />
        </CardHeader>
        <CardContent>
          {recordsToDisplay.map((record, index) => (
            <View key={`disabilities-${index}`}>
              <DataRow
                label="Disabilities Identified"
                value={record.disabilities || 'None'}
                recordDate={formatDate(record.created_at || record.date)}
              />
              <DataRow
                label="Support Required"
                value={record.support_required}
              />
              {index < recordsToDisplay.length - 1 && <Separator />}
            </View>
          ))}
        </CardContent>
      </SectionCard>

      {/* Vital Signs & Notes Section */}
      <SectionCard>
        <CardHeader>
          <SectionHeader 
            title="Vital Signs & Notes" 
            icon={<HeartPulse size={20} color="#6B7280" />} 
          />
        </CardHeader>
        <CardContent>
          {/* <HistoryComparison 
            records={recordsToDisplay}
            fieldKey="weight"
            label="Weight History (kg)"
          />
          <HistoryComparison 
            records={record.height}
            fieldKey="height"
            label="Height History (cm)"
          /> */}
          <Separator />
          {recordsToDisplay.map((record, index) => (
            <View key={`vitals-${index}`}>
              <Text className="text-sm font-medium text-gray-600 mb-2">
                {formatDate(record.created_at || record.date) || `Record ${index + 1}`}
              </Text>
              <DataRow label="Age" value={record.age} />
              <DataRow label="Weight (kg)" value={record.weight} />
              <DataRow label="Height (cm)" value={record.height} />
              <DataRow label="Temperature (°C)" value={record.temperature} />
              <DataRow label="Heart Rate" value={record.heart_rate} />
              <DataRow label="Notes" value={record.notes} />
              {index < recordsToDisplay.length - 1 && <Separator />}
            </View>
          ))}
        </CardContent>
      </SectionCard>

      {/* Nutritional Status Section */}
      <SectionCard>
        <CardHeader>
          <SectionHeader 
            title="Nutritional Status" 
            icon={<Soup size={20} color="#6B7280" />} 
          />
        </CardHeader>
        <CardContent>
          <HistoryComparison 
            records={recordsToDisplay}
            fieldKey="nutritional_status"
            label="Nutritional Status History"
          />
          <Separator />
          {recordsToDisplay.map((record, index) => (
            <View key={`nutrition-${index}`}>
              <DataRow
                label="Nutritional Status"
                value={record.nutritional_status}
                recordDate={formatDate(record.created_at || record.date)}
              />
              <DataRow label="BMI" value={record.bmi} />
              <DataRow label="Growth Chart Status" value={record.growth_chart_status} />
              {index < recordsToDisplay.length - 1 && <Separator />}
            </View>
          ))}
        </CardContent>
      </SectionCard>

      {/* Immunization Section */}
      <SectionCard>
        <CardHeader>
          <SectionHeader 
            title="Immunization" 
            icon={<Syringe size={20} color="#6B7280" />} 
          />
        </CardHeader>
        <CardContent>
          {recordsToDisplay.map((record, index) => (
            <View key={`immunization-${index}`}>
              <Text className="text-sm font-medium text-gray-600 mb-2">
                {formatDate(record.created_at || record.date) || `Record ${index + 1}`}
              </Text>
              <DataRow label="Vaccines Given" value={record.vaccines_given} />
              <DataRow label="Next Due Date" value={record.next_vaccine_date} />
              <DataRow label="Immunization Status" value={record.immunization_status} />
              {index < recordsToDisplay.length - 1 && <Separator />}
            </View>
          ))}
        </CardContent>
      </SectionCard>

      {/* Supplements Section */}
      <SectionCard>
        <CardHeader>
          <SectionHeader 
            title="Supplements & Supplement Status" 
            icon={<Pill size={20} color="#6B7280" />} 
          />
        </CardHeader>
        <CardContent>
          <HistoryComparison 
            records={recordsToDisplay}
            fieldKey="supplements_given"
            label="Supplements History"
          />
          <Separator />
          {recordsToDisplay.map((record, index) => (
            <View key={`supplements-${index}`}>
              <Text className="text-sm font-medium text-gray-600 mb-2">
                {formatDate(record.created_at) || formatDate(record.date) || `Record ${index + 1}`}
              </Text>
              <DataRow label="Supplements Given" value={record.supplements_given} />
              <DataRow label="Dosage" value={record.supplement_dosage} />
              <DataRow label="Compliance" value={record.supplement_compliance} />
              {supplementStatusesFields.length > 0 && supplementStatusesFields.map((field, fieldIndex) => (
                <DataRow
                  key={`supplement-field-${fieldIndex}`}
                  label={field.label || `Field ${fieldIndex + 1}`}
                  value={record[field.key]}
                />
              ))}
              {index < recordsToDisplay.length - 1 && <Separator />}
            </View>
          ))}
        </CardContent>
      </SectionCard>
    </ScrollView>
  );
}
