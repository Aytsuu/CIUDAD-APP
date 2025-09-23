import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react-native';

interface FollowUpsProps {
  followupVaccines?: any[];
  childHealthFollowups?: any[];
}

export function FollowUpsCard({
  followupVaccines = [],
  childHealthFollowups = [],
}: FollowUpsProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'missed'>('pending');
  const [activeChildHealthTab, setActiveChildHealthTab] = useState<'pending' | 'completed' | 'missed'>('pending');

  // Categorize follow-ups
  const categorizedFollowups = {
    pending: followupVaccines.filter((v) => v.followup_status === 'pending'),
    completed: followupVaccines.filter((v) => v.followup_status === 'completed'),
    missed: followupVaccines.filter((v) => v.missed_status === 'missed' || v.followup_status === 'missed'),
  };

  const categorizedChildHealths = {
    pending: childHealthFollowups.filter((v) => v.followup_status === 'pending'),
    completed: childHealthFollowups.filter((v) => v.followup_status === 'completed'),
    missed: childHealthFollowups.filter((v) => v.missed_status === 'missed' || v.followup_status === 'missed'),
  };

  const showFollowupSection = followupVaccines.length > 0;
  const showChildHealthSection = childHealthFollowups.length > 0;

  if (!showFollowupSection && !showChildHealthSection) {
    return null;
  }

  const TabButton = ({
    active,
    type,
    count,
    onPress,
  }: {
    active: boolean;
    type: 'pending' | 'completed' | 'missed';
    count: number;
    onPress: () => void;
  }) => {
    const colors = {
      pending: {
        border: 'border-blue-500',
        icon: active ? 'text-blue-500' : 'text-gray-400',
        text: active ? 'text-blue-700 font-medium' : 'text-gray-500',
        bg: active ? 'bg-blue-100' : 'bg-gray-100',
      },
      completed: {
        border: 'border-green-500',
        icon: active ? 'text-green-500' : 'text-gray-400',
        text: active ? 'text-green-700 font-medium' : 'text-gray-500',
        bg: active ? 'bg-green-100' : 'bg-gray-100',
      },
      missed: {
        border: 'border-red-500',
        icon: active ? 'text-red-500' : 'text-gray-400',
        text: active ? 'text-red-700 font-medium' : 'text-gray-500',
        bg: active ? 'bg-red-100' : 'bg-gray-100',
      },
    }[type];

    const Icon = {
      pending: Clock,
      completed: CheckCircle,
      missed: AlertCircle,
    }[type];

    return (
      <TouchableOpacity
        onPress={onPress}
        className={`flex-1 py-3 items-center justify-center flex-row ${active ? colors.border : 'border-transparent'} border-b-2`}
      >
        <Icon size={16} className={colors.icon} />
        <Text className={`ml-2 text-sm capitalize ${colors.text}`}>
          {type}
        </Text>
        <View className={`ml-2 px-2 py-1 rounded-full ${colors.bg}`}>
          <Text className="text-xs">
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = ({
    type,
  }: {
    type: 'pending' | 'completed' | 'missed';
  }) => {
    const Icon = {
      pending: Clock,
      completed: CheckCircle,
      missed: AlertCircle,
    }[type];

    const messages = {
      pending: {
        title: 'No pending follow-ups',
        description: 'No pending follow-ups found',
      },
      completed: {
        title: 'No completed follow-ups',
        description: 'No completed follow-ups found',
      },
      missed: {
        title: 'No missed follow-ups',
        description: 'No missed follow-ups found',
      },
    }[type];

    return (
      <View className="flex-1 items-center justify-center py-10">
        <View className="bg-gray-100 rounded-full p-4 mb-3">
          <Icon size={24} className="text-gray-500" />
        </View>
        <Text className="text-gray-700 font-medium">{messages.title}</Text>
        <Text className="text-sm text-gray-500 mt-1">{messages.description}</Text>
      </View>
    );
  };

  const FollowUpItem = ({
    item,
    type,
    isVaccine = true,
  }: {
    item: any;
    type: 'pending' | 'completed' | 'missed';
    isVaccine?: boolean;
  }) => {
    const colorClass = {
      pending: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      missed: 'bg-red-100 text-red-800 border-red-200',
    }[type];

    const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      console.warn('Invalid date format:', dateString);
      return 'Invalid date';
    }
  };

  // Debugging: Log the item to see its structure
  console.log('FollowUpItem:', item);

   return (
    <View className="bg-white rounded-lg p-3 border border-gray-200 mb-2">
      <View className="flex-row items-center gap-3 mb-2">
        <View className={`w-3 h-3 rounded-full ${
          type === 'pending' ? 'bg-blue-400' :
          type === 'completed' ? 'bg-green-500' : 'bg-red-400'
        }`} />
        <Text className="font-medium text-gray-800">
          {isVaccine ? item.vac_name : item.followup_description}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {/* Always show follow-up date */}
        <View className={`px-3 py-1 text-xs rounded-full ${colorClass} border`}>
          <Text className='text-sm'>Follow-Up: {formatDate(item.followup_date)}</Text>
        </View>

        {/* For completed items */}
        {type === 'completed' && item.completed_at && (
          <View className={`px-3 py-1 text-xs rounded-full ${colorClass} border`}>
            <Text className='text-sm'>Completed: {formatDate(item.completed_at)}</Text>
          </View>
        )}

        {/* For missed items */}
        {type === 'missed' && (
          <>
            {item.days_missed && (
              <View className={`px-3 py-1 text-xs rounded-full ${colorClass} border`}>
                <Text className='text-sm'>Missed by: {item.days_missed} days</Text>
              </View>
            )}
            <View className={`px-3 py-1 text-xs rounded-full ${colorClass} border`}>
              <Text className='text-sm'>
                {item.completed_at
                  ? `Completed late: ${formatDate(item.completed_at)}`
                  : 'Pending completion'}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

  return (
    <View className="space-y-4">
      {/* Follow-up Vaccines Section */}
      {showFollowupSection && (
        <View className="bg-white rounded-lg p-4 border border-gray-200">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="p-2 bg-blue-100 rounded-lg">
              <Calendar size={20} className="text-blue-600" />
            </View>
            <Text className="text-lg font-semibold text-gray-800">
              Follow-ups
            </Text>
          </View>

          <View className="flex-row border-b border-gray-200 mb-4">
            <TabButton
              active={activeTab === 'pending'}
              type="pending"
              count={categorizedFollowups.pending.length}
              onPress={() => setActiveTab('pending')}
            />
            <TabButton
              active={activeTab === 'completed'}
              type="completed"
              count={categorizedFollowups.completed.length}
              onPress={() => setActiveTab('completed')}
            />
            <TabButton
              active={activeTab === 'missed'}
              type="missed"
              count={categorizedFollowups.missed.length}
              onPress={() => setActiveTab('missed')}
            />
          </View>

          <View className="min-h-[250px]">
            <FlatList
              data={categorizedFollowups[activeTab]}
              renderItem={({ item }) => <FollowUpItem item={item} type={activeTab} />}
              keyExtractor={(item, index) => index.toString()}
              ListEmptyComponent={<EmptyState type={activeTab} />}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      )}

      {/* Child Health Follow-ups Section */}
      {showChildHealthSection && (
        <View className="bg-white rounded-lg p-4 border border-gray-200">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="p-2 bg-green-100 rounded-lg">
              <Calendar size={20} className="text-green-600" />
            </View>
            <Text className="text-lg font-semibold text-gray-800">
              Health Check-ups
            </Text>
          </View>

          <View className="flex-row border-b border-gray-200 mb-4">
            <TabButton
              active={activeChildHealthTab === 'pending'}
              type="pending"
              count={categorizedChildHealths.pending.length}
              onPress={() => setActiveChildHealthTab('pending')}
            />
            <TabButton
              active={activeChildHealthTab === 'completed'}
              type="completed"
              count={categorizedChildHealths.completed.length}
              onPress={() => setActiveChildHealthTab('completed')}
            />
            <TabButton
              active={activeChildHealthTab === 'missed'}
              type="missed"
              count={categorizedChildHealths.missed.length}
              onPress={() => setActiveChildHealthTab('missed')}
            />
          </View>

          <View className="min-h-[250px]">
            <FlatList
              data={categorizedChildHealths[activeChildHealthTab]}
              renderItem={({ item }) => (
                <FollowUpItem item={item} type={activeChildHealthTab} isVaccine={false} />
              )}
              keyExtractor={(item, index) => index.toString()}
              ListEmptyComponent={<EmptyState type={activeChildHealthTab} />}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      )}
    </View>
  );
}