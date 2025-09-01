import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl
} from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetCouncilEvents, useGetAttendanceSheets } from '../ce-events/queries';
import { SearchInput } from '@/components/ui/search-input';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import PageLayout from '@/screens/_PageLayout';
import { AttendanceRecords } from '../ce-events/ce-att-typeFile';

const AttendanceRecord = () => {
  const router = useRouter();
  const { data: councilEvents = [], isLoading, error, refetch } = useGetCouncilEvents();
  const { data: attendanceSheets = [] } = useGetAttendanceSheets();
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const filteredTableData: AttendanceRecords[] = React.useMemo(() => {
    const data = councilEvents
      .filter(event => event.ce_type === 'meeting' && !event.ce_is_archive)
      .map(event => {
        const nonArchivedSheets = attendanceSheets.filter(
          sheet => sheet.ce_id === event.ce_id && !sheet.att_is_archive
        );
        return {
          ceId: event.ce_id,
          attMettingTitle: event.ce_title || 'Untitled Meeting',
          attMeetingDate: event.ce_date || 'N/A',
          attMeetingDescription: event.ce_description || 'No description',
          isArchived: false,
          sheets: nonArchivedSheets,
        };
      });

    return data.filter((record) => {
      const searchableText = [
        record.attMettingTitle,
        record.attMeetingDate,
        record.attMeetingDescription,
      ].join(" ").toLowerCase();
      return searchableText.includes(searchTerm.toLowerCase());
    });
  }, [councilEvents, attendanceSheets, searchTerm]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500">Error: {error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <PageLayout
          leftAction={
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={30} color="black" className="text-black" />
            </TouchableOpacity>
          }
          headerTitle={<Text>Attendance Records</Text>}
          rightAction={
            <TouchableOpacity>
              <ChevronLeft size={30} color="black" className="text-white" />
            </TouchableOpacity>
          }
        >
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onSubmit={() => {
              // Optional: Add any submit logic if needed
              // Currently your search filters as you type, so this might not be necessary
            }}
          />

          {filteredTableData.map((record, index) => (
            <TouchableOpacity
              key={record.ceId}
              onPress={() =>
                router.push({
                  pathname: '/(council)/attendance/attendance-info',
                  params: { ceId: record.ceId, sheets: JSON.stringify(record.sheets) },
                })
              }
              accessibilityLabel={`View details for ${record.attMettingTitle}`}
              accessibilityRole="button"
            >
              <Card
                className={`bg-white rounded-lg p-4 border border-gray-200 ${
                  index === filteredTableData.length - 1 ? 'mb-0' : 'mb-4'
                }`}
              >
                <CardHeader className="pb-3">
                  <View className="flex-row items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-black flex-1 pr-2">
                      {record.attMettingTitle}
                    </CardTitle>
                  </View>
                </CardHeader>

                <CardContent className="pt-0">
                  <Text className="text-sm text-black leading-5 mb-4">
                    {record.attMeetingDescription}
                  </Text>

                  <View className="border-t border-gray-200 pt-3">
                    <Text className="text-sm font-medium text-black">
                      Date of Meeting: {record.attMeetingDate}
                    </Text>
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          ))}

          {/* Empty state spacing */}
          {filteredTableData.length === 0 && (
            <View className="flex-1 justify-center items-center py-12">
              <Text className="text-gray-500 text-center">
                No attendance records found
              </Text>
            </View>
          )}
          </ScrollView>
    </PageLayout>
  );
};

export default AttendanceRecord;