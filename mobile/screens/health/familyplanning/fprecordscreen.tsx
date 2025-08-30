// UserFpRecordsScreen.tsx
import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, Stethoscope, Calendar, Loader2, AlertCircle } from "lucide-react-native";
import { getFPRecordsForPatient } from "../admin/admin-familyplanning/GetRequest";

// Reusing components from admin/individual.tsx
const Card = ({ children, className = "", onPress = null }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
    activeOpacity={onPress ? 0.95 : 1}
  >
    {children}
  </TouchableOpacity>
);

const CardContent = ({ children, className = "" }) => (
  <View className={`p-4 ${className}`}>
    {children}
  </View>
);

const InfoRow = ({ icon: Icon, label, value, iconColor = "#6B7280" }) => (
  <View className="flex-row items-center mb-2">
    <View className="w-5 h-5 mr-3">
      <Icon size={16} color={iconColor} />
    </View>
    <View className="flex-1">
      <Text className="text-sm text-gray-600">{label}:</Text>
      <Text className="text-sm font-medium text-gray-900">{value}</Text>
    </View>
  </View>
);

interface UserFPRecord {
  fprecord_id: number;
  method_used: string;
  created_at: string;
  // Add other relevant fields for display
}

export default function UserFpRecordsScreen() {
  // This patientId would come from the logged-in user's context/auth state
  const userId = "USER_LOGGED_IN_ID"; // Replace with actual user ID from authentication

  const {
    data: userFpRecords = [],
    isLoading,
    isError,
    error,
  } = useQuery<UserFPRecord[]>({
    queryKey: ["userFpRecords", userId],
    queryFn: () => getFPRecordsForPatient(userId),
    enabled: !!userId,
  });

  const handleViewRecordDetails = (fprecordId: number) => {
    // Navigate to the detailed view screen
    // router.push({ pathname: "/user/familyplanning/record-detail", params: { fprecordId } });
    console.log("Navigate to record detail for:", fprecordId);
  };

  const renderRecordItem = ({ item }: { item: UserFPRecord }) => (
    <Card className="mb-4" onPress={() => handleViewRecordDetails(item.fprecord_id)}>
      <CardContent>
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <FileText size={20} color="#3B82F6" />
            </View>
            <Text className="text-lg font-bold text-gray-800">Record #{item.fprecord_id}</Text>
          </View>
        </View>

        <View className="space-y-2">
          <InfoRow
            icon={Stethoscope}
            label="Method Used"
            value={item.method_used || "Not specified"}
            iconColor="#10B981"
          />
          <InfoRow
            icon={Calendar}
            label="Date Created"
            value={new Date(item.created_at).toLocaleDateString()}
            iconColor="#10B981"
          />
        </View>

        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <Text className="text-sm text-gray-500">Tap to view details</Text>
          <View className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center">
            <Text className="text-gray-600 text-xs">→</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <Loader2 size={32} color="#3B82F6" />
        <Text className="text-lg text-gray-600 mt-4">Loading your records...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <AlertCircle size={32} color="#EF4444" />
        <Text className="text-lg text-red-600 mt-4 text-center">Failed to load records</Text>
        <Text className="text-sm text-gray-500 mt-2 text-center">{error?.message}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-6 pt-16 pb-6">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => console.log("Go back")} // Replace with actual navigation.goBack() or router.back()
            className="mr-4 w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">My FP Records</Text>
            <Text className="text-blue-100 mt-1">Your Family Planning History</Text>
          </View>
        </View>
      </View>

      <View className="flex-1 px-4 -mt-2">
        {/* Summary Card */}
        <Card className="mb-4">
          <CardContent>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold text-gray-800">Total Records</Text>
                <Text className="text-sm text-gray-600">
                  {userFpRecords.length} record{userFpRecords.length !== 1 ? 's' : ''} found
                </Text>
              </View>
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                <FileText size={20} color="#3B82F6" />
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Records List */}
        {userFpRecords.length === 0 ? (
          <Card className="flex-1">
            <CardContent className="flex-1 items-center justify-center py-12">
              <FileText size={48} color="#9CA3AF" />
              <Text className="text-lg text-gray-500 mt-4 text-center">No Records Found</Text>
              <Text className="text-sm text-gray-400 mt-2 text-center">
                You haven't created any Family Planning records yet.
              </Text>
            </CardContent>
          </Card>
        ) : (
          <FlatList
            data={userFpRecords}
            renderItem={renderRecordItem}
            keyExtractor={(item) => item.fprecord_id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}
