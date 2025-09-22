// components/followup-cards.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react-native";
import { Text } from "@/components/ui/text";

interface FollowUps {
  followupVaccines?: any[];
  childHealthFollowups?: any[];
}

export function FollowUpsCard({
  followupVaccines = [],
  childHealthFollowups = [],
}: FollowUps) {
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "missed">("pending");
  const [activeChildHealthTab, setActiveChildHealthTab] = useState<"pending" | "completed" | "missed">("pending");


  // Helper function to determine if an item is missed
  const isMissedItem = (item: any) => {
    if (item.days_missed !== undefined && item.days_missed !== null && item.days_missed > 0) {
      return true;
    }
    return item.missed_status === "missed" || item.followup_status === "missed";
  };

  // Categorize follow-ups
  const categorizedFollowups = {
    pending: followupVaccines.filter((v) => v.followup_status === "pending" && !isMissedItem(v)),
    completed: followupVaccines.filter((v) => v.followup_status === "completed"),
    missed: followupVaccines.filter((v) => isMissedItem(v)),
  };

  const categorizedChildHealths = {
    pending: childHealthFollowups.filter((v) => v.followup_status === "pending" && !isMissedItem(v)),
    completed: childHealthFollowups.filter((v) => v.followup_status === "completed"),
    missed: childHealthFollowups.filter((v) => isMissedItem(v)),
  };

  const showFollowupSection = followupVaccines.length > 0;
  const showChildHealthSection = childHealthFollowups.length > 0;

  if (!showFollowupSection && !showChildHealthSection) {
    return null;
  }



  // Compact tab button component
  const TabButton = ({
    active,
    type,
    count,
    onClick,
  }: {
    active: boolean;
    type: "pending" | "completed" | "missed";
    count: number;
    onClick: () => void;
  }) => {
    const config = {
      pending: { icon: Clock, color: "#3b82f6", bgColor: "bg-blue-50", textColor: "text-blue-700" },
      completed: { icon: CheckCircle, color: "#10b981", bgColor: "bg-green-50", textColor: "text-green-700" },
      missed: { icon: AlertCircle, color: "#ef4444", bgColor: "bg-red-50", textColor: "text-red-700" },
    }[type];

    return (
      <TouchableOpacity
        onPress={onClick}
        className={`flex-1 py-2 px-3 rounded-lg mx-1 ${
          active ? config.bgColor : "bg-gray-100"
        }`}
      >
        <View className="flex flex-row items-center justify-center gap-1">
          <config.icon
            size={14}
            color={active ? config.color : "#6b7280"}
          />
          <Text className={`text-xs font-medium ${active ? config.textColor : "text-gray-600"}`}>
            {type}
          </Text>
          <View className={`px-1.5 py-0.5 rounded-full ${active ? "bg-white" : "bg-gray-200"}`}>
            <Text className={`text-xs ${active ? config.textColor : "text-gray-600"}`}>
              {count}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Compact empty state
  const EmptyState = ({ type }: { type: "pending" | "completed" | "missed" }) => {
    const messages = {
      pending: "No pending items",
      completed: "No completed items", 
      missed: "No missed items",
    }[type];

    return (
      <View className="flex items-center justify-center py-8">
        <Text className="text-sm text-gray-500">{messages}</Text>
      </View>
    );
  };

  // Compact item display
  const FollowUpItem = ({
    item,
    type,
    isVaccine = true,
  }: {
    item: any;
    type: "pending" | "completed" | "missed";
    isVaccine?: boolean;
  }) => {
    const statusConfig = {
      pending: { color: "bg-blue-100", dot: "bg-blue-500" },
      completed: { color: "bg-green-100", dot: "bg-green-500" },
      missed: { color: "bg-red-100", dot: "bg-red-500" },
    }[type];

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    return (
      <View className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
        <View className="flex flex-row items-start gap-3">
          <View className={`w-2 h-2 rounded-full mt-2 ${statusConfig.dot}`} />
          
          <View className="flex-1">
            <Text className="font-medium text-gray-800 text-sm mb-1">
              {isVaccine ? item.vac_name : item.followup_description}
            </Text>
            
            <View className="flex flex-row flex-wrap gap-1">
              {/* Follow-up date */}
              <View className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                <Text className="text-xs text-gray-700">
                  Due: {item.followup_date ? formatDate(item.followup_date) : "N/A"}
                </Text>
              </View>

              {/* Additional info based on type */}
              {type === "completed" && item.completed_at && (
                <View className="px-2 py-1 rounded text-xs bg-gray-100">
                  <Text className="text-xs text-gray-600">
                    Done: {formatDate(item.completed_at)}
                  </Text>
                </View>
              )}

              {type === "missed" && item.days_missed && (
                <View className="px-2 py-1 rounded text-xs bg-red-100">
                  <Text className="text-xs text-red-700">
                    {item.days_missed}d late
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Section header component
  const SectionHeader = ({
    title,
    icon: Icon,
    iconColor,
  }: {
    title: string;
    icon: any;
    iconColor: string;
  }) => (
    <View className="flex flex-row items-center gap-2 py-2 px-1">
      <Icon size={18} color={iconColor} />
      <Text className="font-semibold text-gray-800">{title}</Text>
     
    </View>
  );

  return (
    <ScrollView className="flex-1">
      <View className="space-y-4">
        {/* Follow-up Vaccines Section */}
        {showFollowupSection && (
          <View className="bg-white rounded-xl border border-gray-200">
            <View className="p-4 border-b border-gray-100">
              <SectionHeader
                title="Follow-ups"
                icon={Calendar}
                iconColor="#3b82f6"
                // count={followupVaccines.length}
              />
            </View>

            {/* Always show content */}
            <View className="p-4">
                {/* Compact tabs */}
                <View className="flex flex-row mb-4 bg-gray-50 rounded-lg p-1">
                  <TabButton
                    active={activeTab === "pending"}
                    type="pending"
                    count={categorizedFollowups.pending.length}
                    onClick={() => setActiveTab("pending")}
                  />
                  <TabButton
                    active={activeTab === "completed"}
                    type="completed"
                    count={categorizedFollowups.completed.length}
                    onClick={() => setActiveTab("completed")}
                  />
                  <TabButton
                    active={activeTab === "missed"}
                    type="missed"
                    count={categorizedFollowups.missed.length}
                    onClick={() => setActiveTab("missed")}
                  />
                </View>

                {/* Content */}
                <View className="max-h-80">
                  <ScrollView nestedScrollEnabled>
                    {categorizedFollowups[activeTab].length > 0 ? (
                      categorizedFollowups[activeTab].map((item, index) => (
                        <FollowUpItem key={index} item={item} type={activeTab} />
                      ))
                    ) : (
                      <EmptyState type={activeTab} />
                    )}
                  </ScrollView>
                </View>
              </View>
            </View>
        )}

        {/* Child Health Follow-ups Section */}
        {showChildHealthSection && (
          <View className="bg-white rounded-xl border border-gray-200">
            <View className="p-4 border-b border-gray-100">
              <SectionHeader
                title="Health Check-ups"
                icon={Calendar}
                iconColor="#10b981"
              />
            </View>

            {/* Always show content */}
            <View className="p-4">
                {/* Compact tabs */}
                <View className="flex flex-row mb-4 bg-gray-50 rounded-lg p-1">
                  <TabButton
                    active={activeChildHealthTab === "pending"}
                    type="pending"
                    count={categorizedChildHealths.pending.length}
                    onClick={() => setActiveChildHealthTab("pending")}
                  />
                  <TabButton
                    active={activeChildHealthTab === "completed"}
                    type="completed"
                    count={categorizedChildHealths.completed.length}
                    onClick={() => setActiveChildHealthTab("completed")}
                  />
                  <TabButton
                    active={activeChildHealthTab === "missed"}
                    type="missed"
                    count={categorizedChildHealths.missed.length}
                    onClick={() => setActiveChildHealthTab("missed")}
                  />
                </View>

                {/* Content */}
                <View className="max-h-80">
                  <ScrollView nestedScrollEnabled>
                    {categorizedChildHealths[activeChildHealthTab].length > 0 ? (
                      categorizedChildHealths[activeChildHealthTab].map((item, index) => (
                        <FollowUpItem
                          key={index}
                          item={item}
                          type={activeChildHealthTab}
                          isVaccine={false}
                        />
                      ))
                    ) : (
                      <EmptyState type={activeChildHealthTab} />
                    )}
                  </ScrollView>
                </View>
              </View>
            </View>
        )}
      </View>
    </ScrollView>
  );
}