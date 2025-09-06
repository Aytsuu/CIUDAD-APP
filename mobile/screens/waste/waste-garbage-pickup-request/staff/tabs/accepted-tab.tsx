import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Image } from "react-native";
import { X, Search, Info, ChevronRight } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useGetGarbageAcceptRequest } from "../queries/garbagePickupStaffFetchQueries";
import { useRouter } from "expo-router";

export default function AcceptedGarbageRequest() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { data: acceptedReqData = [], isLoading } = useGetGarbageAcceptRequest();

  const filteredData = acceptedReqData.filter((request) => {
    const searchString = `
      ${request.garb_requester} 
      ${request.garb_location} 
      ${request.garb_waste_type}
      ${request.sitio_name}
      ${request.assignment_info?.driver || ""}
      ${request.assignment_info?.collectors?.join(" ") || ""}
    `.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const handleViewAssignment = (garb_id: string) => {
    router.push({
      pathname: '/(waste)/garbage-pickup/staff/view-accepted-details',
      params: {
        garb_id: garb_id
      }
    });
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <Text className="text-lg font-medium text-gray-800 mb-2">
        Accepted Requests ({filteredData.length})
      </Text>

      {/* Search Bar */}
      {!isLoading?(
        <View className="flex-row items-center bg-white border border-gray-200 rounded-lg px-3 mb-4 mt-2">
          <Search size={18} color="#6b7280" />
          <Input
            className="flex-1 ml-2 bg-white text-black"
            placeholder="Search accepted requests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ borderWidth: 0, shadowOpacity: 0 }}
          />
        </View>
      ):( null )}

      {/* List */}
      {isLoading ? (
        <View className="justify-center items-center">
          <Text className="text-center text-gray-500 py-8">Loading accepted requests...</Text>
        </View>
      ) : filteredData.length === 0 ? (
        <View className="justify-center items-center">
          <View className="bg-blue-50 p-6 rounded-lg items-center">
            <Info size={24} color="#3b82f6" className="mb-2" />
            <Text className="text-center text-gray-600">
              {acceptedReqData.length === 0 
                ? "No accepted requests available" 
                : "No matching requests found"}
            </Text>
            {searchQuery && (
              <Text className="text-center text-gray-500 mt-1">
                Try a different search term
              </Text>
            )}
          </View>
        </View>
      ) : (
        <ScrollView className="pb-4" showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
          <View className="gap-4">
            {filteredData.map((request) => (
              <TouchableOpacity 
                key={request.garb_id}
                onPress={() => handleViewAssignment(request.garb_id)}
                activeOpacity={0.8}
              >
                <Card className="border border-gray-200 rounded-lg bg-white">
                  <CardHeader className="border-b border-gray-200 p-4">
                     <View className="flex flex-row justify-between items-center">
                      <View className="flex-1">
                        <View className='flex flex-row items-center gap-2 mb-1'>
                          <View className="bg-blue-600 px-3 py-1 rounded-full self-start">
                            <Text className="text-white font-bold text-sm tracking-wide">{request.garb_id}</Text>
                          </View>
                          <Text className="font-medium">{request.garb_requester}</Text>
                        </View>
                        <View className='flex flex-row justify-between items-center gap-2'>
                            <Text className="text-xs text-gray-500">
                              Sitio: {request.sitio_name}, {request.garb_location}
                            </Text>
                            <Text className="text-xs text-gray-500">{formatTimestamp(request.garb_created_at)}</Text>
                        </View>
                      </View>
                  </View>
                  </CardHeader>
                  <CardContent className="p-4">
                    <View className="gap-3">
                      {/* Waste Type */}
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">Waste Type:</Text>
                        <Text className="text-sm font-medium">{request.garb_waste_type}</Text>
                      </View>

                      {/* Decision Date */}
                      {request.dec_date && (
                        <View className="flex-row justify-between">
                          <Text className="text-sm text-gray-600">Date Accepted:</Text>
                          <Text className="text-sm">{formatTimestamp(request.dec_date)}</Text>
                        </View>
                      )}
                    </View>
                  </CardContent>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}