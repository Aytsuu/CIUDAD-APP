// components/followup-cards.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, Modal, FlatList } from "react-native";
import { Calendar, CheckCircle, Clock, AlertCircle, X, ChevronRight } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { LoadingState } from "@/components/ui/loading-state";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"vaccine" | "health">("vaccine");
  
  // Separate state for modal tabs to prevent re-renders
  const [modalActiveTab, setModalActiveTab] = useState<"pending" | "completed" | "missed">("pending");
  const [modalActiveChildHealthTab, setModalActiveChildHealthTab] = useState<"pending" | "completed" | "missed">("pending");

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

  // Full Follow-ups Modal
  const FollowUpsModal = ({
    visible,
    onClose,
    type,
  }: {
    visible: boolean;
    onClose: () => void;
    type: "vaccine" | "health";
  }) => {
    const isVaccine = type === "vaccine";
    const currentData = isVaccine ? categorizedFollowups : categorizedChildHealths;
    const currentActiveTab = isVaccine ? modalActiveTab : modalActiveChildHealthTab;
    const setCurrentActiveTab = isVaccine ? setModalActiveTab : setModalActiveChildHealthTab;
    const title = isVaccine ? "Follow-up Vaccines" : "Health Check-ups";
    const iconColor = isVaccine ? "#3b82f6" : "#10b981";

    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-white pt-4">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pb-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <Calendar size={20} color={iconColor} />
              <Text className="text-lg font-semibold text-gray-800 ml-2">
                {title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="flex-1 p-4">
            {/* Compact tabs */}
            <View className="flex flex-row mb-4 bg-gray-50 rounded-lg p-1">
              <TabButton
                active={currentActiveTab === "pending"}
                type="pending"
                count={currentData.pending.length}
                onClick={() => setCurrentActiveTab("pending")}
              />
              <TabButton
                active={currentActiveTab === "completed"}
                type="completed"
                count={currentData.completed.length}
                onClick={() => setCurrentActiveTab("completed")}
              />
              <TabButton
                active={currentActiveTab === "missed"}
                type="missed"
                count={currentData.missed.length}
                onClick={() => setCurrentActiveTab("missed")}
              />
            </View>

            {/* Follow-up list */}
            <View className="flex-1">
              {currentData[currentActiveTab].length === 0 ? (
                <EmptyState type={currentActiveTab} />
              ) : (
                <FlatList
                  data={currentData[currentActiveTab]}
                  keyExtractor={(item, index) => 
                    item.id || 
                    item.followup_id || 
                    `followup-${type}-${index}`
                  }
                  renderItem={({ item }) => (
                    <FollowUpItem
                      item={item}
                      type={currentActiveTab}
                      isVaccine={isVaccine}
                    />
                  )}
                  contentContainerStyle={{ paddingBottom: 16 }}
                  showsVerticalScrollIndicator={true}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Preview section component
  const PreviewSection = ({
    title,
    icon: Icon,
    iconColor,
    data,
    activeTab,
    setActiveTab,
    type,
  }: {
    title: string;
    icon: any;
    iconColor: string;
    data: any;
    activeTab: "pending" | "completed" | "missed";
    setActiveTab: (tab: "pending" | "completed" | "missed") => void;
    type: "vaccine" | "health";
  }) => {
    const previewItems = data[activeTab].slice(0, 3);
    const hasMoreItems = data[activeTab].length > 3;
    const totalCount = data[activeTab].length;

    const handleTabClick = (tab: "pending" | "completed" | "missed") => {
      setActiveTab(tab);
      // Also update the modal tab state when clicking preview tabs
      if (type === "vaccine") {
        setModalActiveTab(tab);
      } else {
        setModalActiveChildHealthTab(tab);
      }
    };

    const handleSectionClick = () => {
      setModalType(type);
      setModalVisible(true);
    };

    return (
      <TouchableOpacity 
        onPress={handleSectionClick}
        className="border border-gray-200 rounded-lg bg-white overflow-hidden"
      >
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Icon size={18} color={iconColor} />
              <Text className="font-semibold text-gray-800 ml-2">
                {title}
              </Text>
            </View>
            {totalCount > 0 && (
              <Text className="text-xs text-gray-500">
                {totalCount} total
              </Text>
            )}
          </View>

          {/* Content */}
          <View className="p-3">
            {/* Tabs */}
            <View 
              className="flex flex-row mb-3 bg-gray-50 rounded-lg p-1"
              // Stop propagation to prevent modal from opening when clicking tabs
              onStartShouldSetResponder={() => true}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <TabButton
                active={activeTab === "pending"}
                type="pending"
                count={data.pending.length}
                onClick={() => handleTabClick("pending")}
              />
              <TabButton
                active={activeTab === "completed"}
                type="completed"
                count={data.completed.length}
                onClick={() => handleTabClick("completed")}
              />
              <TabButton
                active={activeTab === "missed"}
                type="missed"
                count={data.missed.length}
                onClick={() => handleTabClick("missed")}
              />
            </View>

            {/* Preview Items */}
            {previewItems.length === 0 ? (
              <EmptyState type={activeTab} />
            ) : (
              <>
                {previewItems.map((item: any, index: number) => (
                  <FollowUpItem
                    key={index}
                    item={item}
                    type={activeTab}
                    isVaccine={type === "vaccine"}
                  />
                ))}
                
                {/* Show More Footer */}
                {hasMoreItems && (
                  <View className="border-t border-gray-100 bg-gray-50 -mx-3 -mb-3 px-4 py-3 flex-row items-center justify-between">
                    <Text className="text-sm text-blue-600 font-medium">
                      Show all {totalCount} items
                    </Text>
                    <ChevronRight size={16} color="#0EA5E9" />
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 space-y-4">
      {/* Follow-up Vaccines Section */}
      {showFollowupSection && (
        <PreviewSection
          title="Follow-up Vaccines"
          icon={Calendar}
          iconColor="#3b82f6"
          data={categorizedFollowups}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          type="vaccine"
        />
      )}

      {/* Child Health Follow-ups Section */}
      {showChildHealthSection && (
        <PreviewSection
          title="Health Check-ups"
          icon={Calendar}
          iconColor="#10b981"
          data={categorizedChildHealths}
          activeTab={activeChildHealthTab}
          setActiveTab={setActiveChildHealthTab}
          type="health"
        />
      )}

      {/* Full Follow-ups Modal */}
      <FollowUpsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        type={modalType}
      />
    </View>
  );
}