import {
  View,
  ActivityIndicator,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { getComplaintLists } from "../api-operations/queries/ComplaintGetQueries";
import { useRouter } from "expo-router";

export default function ComplaintPending() {
  const { data: complaint, isLoading, error } = getComplaintLists();
  const router = useRouter();

  if (isLoading)
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-2 text-gray-600">Loading complaints...</Text>
      </View>
    );

  if (error)
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-4">
        <Text className="text-red-600 text-center text-lg">
          Error loading complaints
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          Please try again later
        </Text>
      </View>
    );

  const complaints = complaint || [];

  const handleCancelRequests = (id: number) => {};

  return (
    <View className="flex-1 bg-gray-50">
      {complaints.length > 0 ? (
        <FlatList
          data={complaints}
          keyExtractor={(c: any) => c.comp_id.toString()}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="bg-white mb-4 rounded-xl shadow-sm border border-gray-100">
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(my-request)/complaint-tracking/compMainView",
                    params: {
                      complaint: JSON.stringify(item),
                    },
                  })
                }
                className="p-6"
                activeOpacity={0.7}
              >
                {/* Header Section */}
                <View className="mb-4">
                  <Text className="text-xl font-bold text-gray-900 mb-2">
                    {item.comp_incident_type}
                  </Text>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-amber-400 mr-2" />
                    <Text className="text-sm font-medium text-amber-600">
                      {item.comp_status}
                    </Text>
                  </View>
                </View>

                {/* Details Section */}
                <View className="space-y-3">
                  <View>
                    <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Location
                    </Text>
                    <Text className="text-base text-gray-900">
                      {item.comp_location}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Action Buttons Section */}
              <View className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    onPress={() => handleCancelRequests(item.comp_id)}
                    className="flex-1 bg-white border border-red-200 rounded-lg py-3 px-4"
                    activeOpacity={0.8}
                  >
                    <Text className="text-red-600 font-semibold text-center text-sm">
                      Cancel Request
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname:
                          "/(my-request)/complaint-tracking/compMainView",
                        params: {
                          complaint: JSON.stringify(item),
                        },
                      })
                    }
                    className="flex-1 bg-blue-600 rounded-lg py-3 px-4"
                    activeOpacity={0.7}
                  >
                    <Text className="text-white font-semibold text-center text-sm">
                      View Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      ) : (
        <View className="flex-1 justify-center items-center px-8">
          <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 w-full max-w-sm">
            <View className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 items-center justify-center">
              <Text className="text-2xl">📋</Text>
            </View>
            <Text className="text-lg font-semibold text-gray-900 text-center mb-2">
              No Pending Complaints
            </Text>
            <Text className="text-gray-500 text-center leading-relaxed">
              All your complaints have been processed or you haven't submitted
              any yet.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
