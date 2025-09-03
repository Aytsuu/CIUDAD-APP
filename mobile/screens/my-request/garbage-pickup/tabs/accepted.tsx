import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { X, Search, Info, ChevronRight } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/helpers/timestampformatter";

// Mock data interface
interface GarbageRequest {
  garb_id: string;
  garb_location: string;
  garb_waste_type: string;
  garb_created_at: string;
  dec_date?: string;
  sitio_name?: string;
  assignment_info?: {
    driver?: string;
    collectors?: string[];
  };
}

export default function ResidentAccepted() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data - replace with your actual data source
  const [requestsData, setRequestsData] = useState<GarbageRequest[]>([
    {
      garb_id: "1",
      garb_location: "Main Street",
      garb_waste_type: "General Waste",
      garb_created_at: "2023-10-10T08:30:00Z",
      dec_date: "2023-10-11T10:15:00Z",
      sitio_name: "Sitio 1",
      assignment_info: {
        driver: "John Driver",
        collectors: ["Alice", "Bob", "Charlie"]
      }
    },
    {
      garb_id: "2",
      garb_location: "Park Avenue",
      garb_waste_type: "Recyclables",
      garb_created_at: "2023-10-11T09:15:00Z",
      dec_date: "2023-10-12T14:20:00Z",
      sitio_name: "Sitio 2",
      assignment_info: {
        driver: "Jane Driver",
        collectors: ["David", "Eva"]
      }
    }
  ]);

  const isLoading = false; // Replace with actual loading state if needed

  const filteredData = requestsData.filter((request) => {
    const searchString = `
      ${request.garb_location} 
      ${request.garb_waste_type}
      ${request.sitio_name}
      ${request.assignment_info?.driver || ""}
      ${request.assignment_info?.collectors?.join(" ") || ""}
    `.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const handleViewAssignment = (garb_id: string) => {
    console.log("View assignment:", garb_id);
    // Navigate to assignment details
  };

  return (
    <View className="flex-1 p-4">
      {/* Header */}
      <Text className="text-lg font-semibold text-gray-800 mb-2">
        Accepted Requests ({filteredData.length})
      </Text>

      {/* Search Bar */}
      {!isLoading && (
        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 mb-4 mt-2">
          <Search size={18} color="#6b7280" />
          <Input
            className="flex-1 ml-2 bg-white text-black"
            placeholder="Search accepted requests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ borderWidth: 0, shadowOpacity: 0 }}
          />
        </View>
      )}

      {/* List */}
      {isLoading ? (
        <View className="justify-center items-center py-8">
          <Text className="text-center text-gray-500">Loading accepted requests...</Text>
        </View>
      ) : filteredData.length === 0 ? (
        <View className="justify-center items-center py-8">
          <View className="bg-blue-50 p-6 rounded-lg items-center">
            <Info size={24} color="#3b82f6" className="mb-2" />
            <Text className="text-center text-gray-600">
              {requestsData.length === 0 
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
                <Card className="border border-gray-200 rounded-lg bg-white shadow-sm">
                  <CardHeader className="border-b border-gray-200 p-4">
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-sm text-gray-500">
                            Sitio: {request.sitio_name}, {request.garb_location}
                        </Text>
                      </View>
                      <View className="flex-row gap-1 items-center">
                        <Text className="text-xs text-gray-500">
                          {formatTimestamp(request.garb_created_at)}
                        </Text>
                        <ChevronRight size={18} color="black" />
                      </View>
                    </View>
                  </CardHeader>
                  <CardContent className="p-4">
                    <View className="gap-3">
                      {/* Waste Type */}
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">Waste Type:</Text>
                        <Text className="text-sm font-semibold ">{request.garb_waste_type}</Text>
                      </View>

                      {/* Decision Date */}
                      {request.dec_date && (
                        <View className="flex-row justify-between">
                          <Text className="text-sm text-gray-600">Date Accepted:</Text>
                          <Text className="text-sm font-medium text-green-700">
                            {formatTimestamp(request.dec_date)}
                          </Text>
                        </View>
                      )}

                      {/* Assignment Info */}
                      {request.assignment_info && (
                        <View className="mt-3 pt-3 border-t border-gray-100">
                          <Text className="text-sm font-medium text-gray-700 mb-1">Assigned Team:</Text>
                          <Text className="text-sm">
                            <Text className="font-medium text-gray-600">Driver:</Text>{" "}
                            <Text className="font-semibold text-blue-700">
                              {request.assignment_info.driver || "Not assigned"}
                            </Text>
                          </Text>
                          {request.assignment_info.collectors && request.assignment_info.collectors.length > 0 && (
                            <Text className="text-sm mt-1">
                              <Text className="font-medium text-gray-600">Collectors:</Text>{" "}
                              <Text className="font-semibold text-green-700">
                                {request.assignment_info.collectors.join(", ")}
                              </Text>
                            </Text>
                          )}
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