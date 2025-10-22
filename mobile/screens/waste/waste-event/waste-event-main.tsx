import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
  TextInput,
} from 'react-native';
import { useGetActiveWasteEvents, useGetArchivedWasteEvents, type WasteEvent } from './queries/waste-event-fetch-queries';
import { useArchiveWasteEvent, useRestoreWasteEvent, useDeleteWasteEvent } from './queries/waste-event-delete-queries';
import { Plus, Trash, Archive, ArchiveRestore, Edit3, Search, ChevronLeft, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { formatTime } from '@/helpers/timeFormatter';
import { formatDate } from '@/helpers/dateHelpers';
import { SelectLayout } from '@/components/ui/select-layout';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import PageLayout from '@/screens/_PageLayout';
import { useDebounce } from '@/hooks/use-debounce';

// Day options for filtering
const dayOptions = [
  { label: "All Days", value: "0" },
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" }
];

const WasteEventMain = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('active');
  const [selectedDay, setSelectedDay] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add debouncing for search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch data with search and filter parameters
  const { data: activeEventsData = [], isLoading: isActiveLoading } = useGetActiveWasteEvents(debouncedSearchQuery);
  const { data: archivedEventsData = [], isLoading: isArchivedLoading } = useGetArchivedWasteEvents(debouncedSearchQuery);

  // Mutation hooks
  const { mutate: archiveWasteEvent, isPending: isArchiving } = useArchiveWasteEvent();
  const { mutate: deleteWasteEvent, isPending: isDeleting } = useDeleteWasteEvent();
  const { mutate: restoreWasteEvent, isPending: isRestoring } = useRestoreWasteEvent();

  // Filter data by day
  const filterByDay = (events: WasteEvent[]) => {
    if (selectedDay === '0') return events;
    
    return events.filter(event => {
      if (!event.we_date) return false;
      const eventDate = new Date(event.we_date);
      const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'long' });
      return dayName === selectedDay;
    });
  };

  // Filter Active Events
  const activeFilteredData = useMemo(() => {
    return filterByDay(activeEventsData);
  }, [activeEventsData, selectedDay]);

  // Filter Archived Events
  const archivedFilteredData = useMemo(() => {
    return filterByDay(archivedEventsData);
  }, [archivedEventsData, selectedDay]);

  // Grouping function
  const groupByDate = (data: WasteEvent[]) => {
    const groups: { [key: string]: WasteEvent[] } = {};
    data.forEach(item => {
      if (item.we_date) {
        const dateKey = formatDate(item.we_date as string);
        if (dateKey) {
          if (!groups[dateKey]) {
            groups[dateKey] = [];
          }
          groups[dateKey].push(item);
        }
      }
    });
    const result = Object.keys(groups).map(date => ({
      title: date,
      data: groups[date],
    }));
    return result.sort((a, b) => new Date(a.title).getTime() - new Date(b.title).getTime());
  };

  const activeGroupedData = useMemo(() => groupByDate(activeFilteredData), [activeFilteredData]);
  const archivedGroupedData = useMemo(() => groupByDate(archivedFilteredData), [archivedFilteredData]);

  const handleEdit = (item: WasteEvent) => {
    router.push({
      pathname: '/(waste)/waste-event/waste-event-edit',
      params: {
        weNum: item.we_num.toString(),
        eventName: item.we_name,
        location: item.we_location,
        date: item.we_date,
        time: item.we_time,
        organizer: item.we_organizer,
        invitees: item.we_invitees || '',
        description: item.we_description || '',
      }
    });
  };

  const handleDelete = (weNum: number) => {
    deleteWasteEvent(weNum);
  };

  const handleArchive = (weNum: number) => {
    archiveWasteEvent(weNum);
  };

  const handleRestore = (weNum: number) => {
    restoreWasteEvent(weNum);
  };

  const renderItem = ({ item }: { item: WasteEvent }) => (
    <View className="bg-white shadow-sm rounded-lg p-4 mb-3 mx-2 border border-gray-200">
      {/* First row with event name and action icons */}
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-gray-800 font-semibold text-base flex-1 mr-2">{item.we_name}</Text>
        <View className="flex-row gap-1">
          {activeTab === 'active' ? (
            <>
              <TouchableOpacity
                className="bg-blue-50 rounded py-1 px-1"
                onPress={() => handleEdit(item)}
              >
                <Edit3 size={16} color="#00A8F0" />
              </TouchableOpacity>

              <ConfirmationModal
                trigger={
                  <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
                    <Archive size={16} color="#dc2626" />
                  </TouchableOpacity>
                }
                title="Archive Event"
                description="This event will be archived. Are you sure?"
                actionLabel="Archive"
                onPress={() => handleArchive(item.we_num)}
              />
            </>
          ) : (
            <>
              <ConfirmationModal
                trigger={
                  <TouchableOpacity className="bg-green-50 rounded py-1 px-1.5">
                    <ArchiveRestore size={16} color="#15803d" />
                  </TouchableOpacity>
                }
                title="Restore Event"
                description="This event will be restored. Are you sure?"
                actionLabel="Restore"
                onPress={() => handleRestore(item.we_num)}
              />

              <ConfirmationModal
                trigger={
                  <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
                    <Trash size={16} color="#dc2626" />
                  </TouchableOpacity>
                }
                title="Delete Event"
                description="This event will be permanently deleted. Are you sure?"
                actionLabel="Delete"
                onPress={() => handleDelete(item.we_num)}
              />
            </>
          )}
        </View>
      </View>

      {/* Location and time row */}
      <View className="mb-1">
        <Text className="text-gray-600 text-sm">📍 {item.we_location}</Text>
        <Text className="text-gray-500 text-sm">🕒 {formatTime(item.we_time)}</Text>
      </View>

      {/* Organizer */}
      <View className="mb-1">
        <Text className="text-gray-600 text-sm">👤 Organizer: {item.we_organizer}</Text>
      </View>

      {/* Description if exists */}
      {item.we_description && item.we_description !== "None" && (
        <View className="mt-1">
          <Text className="text-gray-600 text-sm">{item.we_description}</Text>
        </View>
      )}

      {/* Invitees if exists */}
      {item.we_invitees && item.we_invitees !== "None" && (
        <View className="mt-1">
          <Text className="text-gray-600 text-sm">👥 Invitees: {item.we_invitees}</Text>
        </View>
      )}
    </View>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View className="bg-orange-50 py-3 px-4 rounded-md mb-3 mt-3">
      <Text className="text-lg font-bold text-orange-800">{section.title}</Text>
    </View>
  );

  const isLoading = activeTab === 'active' ? isActiveLoading : isArchivedLoading;
  const currentData = activeTab === 'active' ? activeGroupedData : archivedGroupedData;

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-md">
          Waste Events
        </Text>
      }
      rightAction={
        <View className="w-10 h-10 rounded-full items-center justify-center"></View>
      }
      wrapScroll={false}      
    >
      {isLoading || isRestoring || isArchiving || isDeleting ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2a3a61" />
          <Text className="text-sm text-gray-500 mt-2 text-center">
            {
              isArchiving ? "Archiving Event..." : 
              isRestoring ? "Restoring Event..." : 
              isDeleting ? "Deleting Event..." :
              "Loading..."
            }
          </Text>
        </View>
      ) : (
        <>
          {/* Search and Filter */}
          <View className="px-4 pb-4 pt-4">
            <View className="flex-row items-center gap-2">
              <View className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-500" size={17} />
                <TextInput
                  placeholder="Search events..."
                  className="pl-3 w-full h-[45px] bg-white text-base rounded-xl p-2 border border-gray-300"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <View className="w-[120px] pb-5">
                <SelectLayout
                  options={dayOptions}
                  className="h-8"
                  selectedValue={selectedDay}
                  onSelect={(option) => setSelectedDay(option.value)}
                  placeholder="Day"
                  isInModal={false}
                />
              </View>
            </View>
          </View>

          {/* Create Button */}
          <View className="pb-4 px-4">
            <TouchableOpacity
              className="bg-orange-500 flex-row items-center justify-center w-full px-4 py-4 rounded-lg mb-3"
              onPress={() => router.push('/(waste)/waste-event/waste-event-create')}
            >
              <Plus size={16} className="text-white mr-2" />
              <Text className="text-white text-lg font-medium">Create Event</Text>
            </TouchableOpacity>
          </View>      

          {/* View Mode Toggle */}
          <View className="flex-row justify-center px-3 mb-3">
            <View className="flex-row bg-orange-50 mb-3 w-full p-2 rounded-md items-center">
              <TouchableOpacity
                className={`flex-1 mx-1 h-8 items-center justify-center ${activeTab === 'active' ? 'bg-white border-b-2 border-orange-500' : ''}`}
                onPress={() => setActiveTab('active')}
              >
                <Text className={`text-sm ${activeTab === 'active' ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 mx-1 h-8 items-center justify-center ${activeTab === 'archive' ? 'bg-white border-b-2 border-orange-500' : ''}`}
                onPress={() => setActiveTab('archive')}
              >
                <View className="flex-row items-center justify-center">
                  <Archive 
                    size={14} 
                    className="mr-1" 
                    color={activeTab === 'archive' ? '#f97316' : '#6b7280'} 
                  />
                  <Text className={`text-sm ${activeTab === 'archive' ? 'text-orange-600 font-medium' : 'text-gray-500'} pl-1`}>
                    Archive
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Conditional rendering based on active tab */}
          <View className="flex-1 px-4">
            {currentData.length > 0 ? (
              <SectionList
                sections={currentData}
                keyExtractor={item => item.we_num.toString()}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={true}
              />
            ) : (
              <View className="flex-1 justify-center items-center py-10">
                <Calendar size={48} color="#d1d5db" />
                <Text className="text-gray-400 text-lg mt-2">
                  {activeTab === 'active' ? 'No active events found' : 'No archived events found'}
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </PageLayout>
  );
};

export default WasteEventMain;
