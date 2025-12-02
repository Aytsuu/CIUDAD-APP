import { format, parseISO, isSameMonth, isSameDay, addMonths } from 'date-fns';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions} from 'react-native';
import { Plus, Edit3, Trash} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useGetHotspotRecords, type Hotspot } from './queries/hotspotFetchQueries';
import ScreenLayout from '@/screens/_ScreenLayout';
import { useDeleteHotspot } from './queries/hotspotDeleteQueries';
import { formatTime } from '@/helpers/timeFormatter';
import { ConfirmationModal } from '@/components/ui/confirmationModal';

const { width } = Dimensions.get('window');
const DAY_SIZE = width / 7 - 10;

export default function WasteHotspotMain(){
    const {data: hotspotRecords = [], isLoading} = useGetHotspotRecords()
    const {mutate: deleteHotspot, isPending: deletePending} = useDeleteHotspot()
    const router = useRouter()
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
    const [selectedSitio, setSelectedSitio] = useState('0');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter data based on active tab
    const filteredHotspots = hotspotRecords.filter(item => 
        item.wh_is_archive === (activeTab === 'archive')
    );

    const formattedSchedules = filteredHotspots.map(item => ({
        ...item,
        rawDate: parseISO(item.wh_date),
        formattedDate: format(parseISO(item.wh_date), 'MM-dd'),
        day: format(parseISO(item.wh_date), 'EEEE'),
    }));

    // Filter schedules for current month
    const currentMonthSchedules = formattedSchedules.filter(item => 
        isSameMonth(item.rawDate, currentMonth)
    );

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => null);

    const handleMonthChange = (increment: number) => {
        setCurrentMonth(addMonths(currentMonth, increment));
        setSelectedDate(addMonths(selectedDate, increment));
    };

    const handleDateSelect = (date: number) => {
        setSelectedDate(new Date(year, month, date));
    };

    const renderDayHeader = (day: string) => (
        <View key={day} className="items-center py-2">
            <Text className="text-gray-500 text-sm font-medium">{day}</Text>
        </View>
    );

    const renderDateCell = (date: number | null, index: number) => {
        if (date === null) {
                return <View key={`blank-${index}`} style={{ width: DAY_SIZE, height: DAY_SIZE }} />;
        }
        
        const dateObj = new Date(year, month, date);
            const hasSchedule = currentMonthSchedules.some(schedule => 
                isSameDay(schedule.rawDate, dateObj)
            );
            const isSelected = isSameDay(selectedDate, dateObj);
            const isToday = isSameDay(dateObj, new Date());
            
            return (
                <TouchableOpacity
                key={date}
                className={`items-center justify-center rounded-full m-1 ${
                    isSelected 
                    ? 'bg-blue-600' 
                    : hasSchedule 
                        ? 'bg-blue-100' 
                        : isToday
                        ? 'bg-gray-200'
                        : 'bg-white'
                }`}
                style={{ width: DAY_SIZE, height: DAY_SIZE }}
                onPress={() => handleDateSelect(date)}
                >
                <Text className={`text-lg ${
                    isSelected 
                    ? 'text-white font-bold' 
                    : isToday
                        ? 'text-blue-600 font-bold'
                        : 'text-gray-800'
                }`}>
                    {date}
                </Text>
                {hasSchedule && !isSelected && (
                    <View className="w-1 h-1 rounded-full bg-blue-500 mt-1" />
                )}
                </TouchableOpacity>
            );
    };

   const filteredData = formattedSchedules
    .filter(item => {
        const matchesDate = isSameDay(item.rawDate, selectedDate);
        const matchesSitio = selectedSitio === '0' || item.sitio === selectedSitio;
        const matchesSearch = item.wh_add_info?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.sitio?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDate && matchesSitio && matchesSearch;
    })
    .sort((a, b) => {

        const startTimeCompare = a.wh_start_time.localeCompare(b.wh_start_time);
        if (startTimeCompare !== 0) return startTimeCompare;
        return a.wh_end_time.localeCompare(b.wh_end_time);
    });
    
    const handleEdit = (item:any) => {
      router.push({
        pathname: '/(waste)/waste-hotspot/waste-hotspot-edit',
        params: {
          wh_num: item.wh_num,
          date: item.wh_date,
          start_time: item.wh_start_time,
          end_time: item.wh_end_time,
          additionalInstructions: item.wh_add_info,
          sitio: item.sitio_id,
          watchman: item.wstp_id
        }
      })
    }

    const handleDelete = (wh_num: string) => {
        deleteHotspot(wh_num);
    };

    const renderItem = ({ item }: { item: Hotspot }) => (
      <View className="bg-white shadow-sm rounded-lg p-4 mb-3 mx-2 border border-gray-200">
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <Text className="text-gray-800 font-semibold text-base">
              {item.watchman}
            </Text>
            <Text className="text-gray-600 mt-1">
              {item.sitio}
            </Text>
          </View>
          
          {activeTab == 'active' &&(
                <View className="flex-row gap-1">
                <TouchableOpacity 
                    className="bg-blue-50 rounded py-1 px-1"
                    onPress={() => handleEdit(item)}
                    >
                    <Edit3 size={16} color="#00A8F0"/>
                </TouchableOpacity>

                <ConfirmationModal
                    trigger={
                        <TouchableOpacity className="bg-red-50 rounded py-1 px-1.5">
                        <Trash size={16} color="#dc2626" />
                        </TouchableOpacity>
                    }
                    title="Delete Schedule"
                    description="This schedule will be permanently deleted. Are you sure?"
                    actionLabel="Delete"
                    onPress={() => handleDelete(item.wh_num.toString())}
                />
            </View>
          )}
        </View>

        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-500">
            {format(parseISO(item.wh_date), 'MMM dd, yyyy')}
          </Text>
          <Text className="text-gray-500">
            {formatTime(item.wh_start_time)} - {formatTime(item.wh_end_time)}
          </Text>
        </View>

        {item.wh_add_info && (
          <View className="mt-2 pt-2 border-t border-gray-100">
            <Text className="text-gray-600 italic">
              {item.wh_add_info}
            </Text>
          </View>
        )}
      </View>
    );

    return(
    <ScreenLayout
        header="Hotspot Assignment & Schedule"
        description="Manage hotspot assignment Schedule"
        showBackButton={false}
        showExitButton={false}
        scrollable={false}
        loading={isLoading || deletePending}
        loadingMessage={ deletePending? "Deleting...": 
            "Loading..."
        }
    >
        {/* Archive - Active Toggler */}
        <View className="flex-row justify-center my-3" >
            <View className="flex-row border border-gray-300 rounded-full bg-gray-100 overflow-hidden">
                <TouchableOpacity
                className={`px-4 py-2 ${activeTab === 'active' ? 'bg-white' : ''}`}
                onPress={() => {
                    setActiveTab('active');
                    queryClient.invalidateQueries({ queryKey: ['hotspots'] });
                }}
                >
                <Text className={`text-sm font-medium ${activeTab === 'active' ? 'text-blue-500' : 'text-gray-500'}`}>
                    Active
                </Text>
                </TouchableOpacity>
                <TouchableOpacity
                className={`px-4 py-2 ${activeTab === 'archive' ? 'bg-white' : ''}`}
                onPress={() => {
                    setActiveTab('archive');
                    queryClient.invalidateQueries({ queryKey: ['hotspots'] });
                }}
                >
                <Text className={`text-sm font-medium ${activeTab === 'archive' ? 'text-blue-500' : 'text-gray-500'}`}>
                    Archive
                </Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Calendar */}
        <View className="bg-white shadow-sm py-4 px-2">
            <View className="flex-row justify-between items-center mb-4 px-2">
                <TouchableOpacity 
                onPress={() => handleMonthChange(-1)}
                className="p-2"
                >
                <MaterialIcons name="chevron-left" size={24} color="#3B82F6" />
                </TouchableOpacity>
                
                <Text className="text-xl font-bold text-gray-800">
                {format(currentMonth, 'MMMM yyyy')}
                </Text>
                
                <TouchableOpacity 
                onPress={() => handleMonthChange(1)}
                className="p-2"
                >
                <MaterialIcons name="chevron-right" size={24} color="#3B82F6" />
                </TouchableOpacity>
            </View>
            
            <View className="flex-row justify-around mb-2">
                {days.map(renderDayHeader)}
            </View>
            
            <View className="flex-row flex-wrap justify-around">
                {blankDays.map((date, index) => renderDateCell(date, index))}
                {dates.map(renderDateCell)}
            </View>
        </View>

        {/* Create Button */}
        <View className="flex-row justify-end pb-4 pt-4 px-4">
            <TouchableOpacity
            className="bg-blue-500 flex-row items-center px-4 py-4 rounded-full"
            onPress={() => router.push('/(waste)/waste-hotspot/waste-hotspot-create')}
            >
            <Plus size={20} className="text-white" />
            </TouchableOpacity>
        </View>

        {/* Data Display */}
        <View className="flex-1 px-2">
            <View className="flex-row justify-between items-center mb-4 px-2">
                <Text className="text-lg font-bold text-gray-800">
                {format(selectedDate, 'EEEE, MMMM d')}
                </Text>
                <Text className="text-blue-600">
                {filteredData.length} {filteredData.length === 1 ? 'Schedule' : 'Schedules'}
                </Text>
            </View>
            
            {filteredData.length > 0 ? (
                <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={item => item.wh_num.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                />
            ) : (
                <View className="flex-1 justify-center items-center">
                <Text className="text-gray-400 text-lg">
                    No {activeTab === 'active' ? 'active' : 'archived'} schedules found for this date
                </Text>
                </View>
            )}
        </View>
    </ScreenLayout>
    )
}