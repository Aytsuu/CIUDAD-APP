import React, { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from '@react-navigation/native';
import { FPPatientsCount, getFPPatientsCounts, getFPRecordsList } from "./GetRequest";
import { 
  ArrowDown, 
  ArrowUp, 
  Home, 
  RefreshCw, 
  Search, 
  User, 
  Users,
  FileText,
  Activity,
  Calendar,
  Stethoscope,
  TrendingUp,
  TrendingDown,
  Filter,
  Loader2,
  AlertCircle
} from "lucide-react-native";
import { Picker } from '@react-native-picker/picker';
import { router } from "expo-router";

// Custom Components
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

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800"
  };
  
  return (
    <View className={`px-3 py-1 rounded-full ${variants[variant]} ${className}`}>
      <Text className="text-xs font-medium">{children}</Text>
    </View>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, percentage, color = "#3B82F6" }) => (
  <Card className="flex-1 mx-1">
    <CardContent>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-medium text-gray-600">{title}</Text>
        <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={16} color={color} />
        </View>
      </View>
      <Text className="text-2xl font-bold text-gray-900 mb-1">{value}</Text>
      {percentage !== undefined && (
        <View className="flex-row items-center">
          {trend === 'up' ? (
            <TrendingUp size={12} color="#10B981" />
          ) : (
            <TrendingDown size={12} color="#F59E0B" />
          )}
          <Text className="text-xs text-gray-500 ml-1">{percentage}% of total</Text>
        </View>
      )}
    </CardContent>
  </Card>
);

const InfoRow = ({ icon: Icon, label, value, iconColor = "#6B7280" }) => (
  <View className="flex-row items-center mb-2">
    <View className="w-4 h-4 mr-3">
      <Icon size={14} color={iconColor} />
    </View>
    <View className="flex-1">
      <Text className="text-xs text-gray-500">{label}:</Text>
      <Text className="text-sm font-medium text-gray-900">{value}</Text>
    </View>
  </View>
);

// Define interfaces
interface FPRecord {
  fprecord_id: number;
  patient_id: string;
  client_id: string;
  patient_name: string;
  patient_age: number;
  client_type: string;
  patient_type: string;
  method_used: string;
  created_at: string;
  updated_at: string;
  sex: string;
}

interface SelectLayoutProps {
  options: { id: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

const SelectLayout: React.FC<SelectLayoutProps> = ({ options, value, onChange, placeholder, className }) => {
  return (
    <View className={`border border-gray-300 rounded-lg px-3 py-1 bg-white ${className}`}>
      <Picker
        selectedValue={value}
        onValueChange={(itemValue) => onChange(itemValue)}
        style={{ height: 40, width: '100%', color: '#1f2937' }}
      >
        <Picker.Item label={placeholder} value="" enabled={false} style={{ color: '#9ca3af' }} />
        {options.map((option) => (
          <Picker.Item key={option.id} label={option.name} value={option.id} />
        ))}
      </Picker>
    </View>
  );
};

export default function OverallFpRecordsScreen() {
  const navigation = useNavigation();
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const queryClient = useQueryClient();

  const {
    data: fpRecords = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<FPRecord[], Error>({
    queryKey: ["fpRecordsList"],
    queryFn: getFPRecordsList,
  });

  const {
    data: fpCounts,
    isLoading: isLoadingCounts,
    isError: isErrorCounts,
    error: errorCounts,
  } = useQuery<FPPatientsCount, Error>({
    queryKey: ["fpPatientCounts"],
    queryFn: getFPPatientsCounts,
  });

  const filteredRecords = useMemo(() => {
    let filtered = fpRecords;

    if (searchQuery) {
      filtered = filtered.filter(
        (record) =>
          record.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.client_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.client_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.method_used.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter((record) => record.client_type === selectedFilter);
    }

    return filtered;
  }, [fpRecords, searchQuery, selectedFilter]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["fpPatientCounts"] });
  };

  const clientTypeOptions = [
    { id: "all", name: "All Types" },
    { id: "New Acceptor", name: "New Acceptor" },
    { id: "Current User", name: "Current User" },
  ];

  const totalFPPatients = fpCounts?.total_fp_patients || 0;
  const residentFPPatients = fpCounts?.resident_fp_patients || 0;
  const transientFPPatients = fpCounts?.transient_fp_patients || 0;

  const residentFPPercentage = totalFPPatients > 0 ? Math.round((residentFPPatients / totalFPPatients) * 100) : 0;
  const transientFPPercentage = totalFPPatients > 0 ? Math.round((transientFPPatients / totalFPPatients) * 100) : 0;

  if (isLoading || isLoadingCounts) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <Loader2 size={32} color="#3B82F6" />
        <Text className="text-lg text-gray-600 mt-4">Loading records...</Text>
      </View>
    );
  }

  if (isError || isErrorCounts) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <AlertCircle size={32} color="#EF4444" />
        <Text className="text-lg text-red-600 mt-4 text-center">Failed to load data</Text>
        <Text className="text-sm text-gray-500 mt-2 text-center">{error?.message || errorCounts?.message}</Text>
        <TouchableOpacity onPress={handleRefresh} className="mt-4 bg-blue-600 px-6 py-3 rounded-lg">
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderRecordItem = ({ item }: { item: FPRecord }) => (
    <Card 
      className="mb-3"
      onPress={() => router.push({
        pathname: "/admin/familyplanning/individual",
        params: { patientId: item.patient_id }
      })}
    >
      <CardContent>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <FileText size={18} color="#3B82F6" />
            </View>
            <View>
              <Text className="text-base font-bold text-gray-800">Record #{item.fprecord_id}</Text>
              <Badge variant="secondary">{item.client_type}</Badge>
            </View>
          </View>
          <View className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center">
            <Text className="text-gray-600 text-xs">→</Text>
          </View>
        </View>

        {/* Patient Info */}
        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <InfoRow 
            icon={User} 
            label="Patient" 
            value={item.patient_name || "N/A"} 
            iconColor="#10B981"
          />
          <View className="flex-row">
            <View className="flex-1 mr-2">
              <InfoRow 
                icon={Calendar} 
                label="Age" 
                value={`${item.patient_age || "N/A"} years`} 
                iconColor="#10B981"
              />
            </View>
            <View className="flex-1 ml-2">
              <InfoRow 
                icon={User} 
                label="Sex" 
                value={item.sex || "N/A"} 
                iconColor="#10B981"
              />
            </View>
          </View>
        </View>

        {/* Method and Date */}
        <InfoRow 
          icon={Stethoscope} 
          label="Method Used" 
          value={item.method_used || "Not specified"} 
          iconColor="#EF4444"
        />
        <InfoRow 
          icon={Calendar} 
          label="Date Created" 
          value={new Date(item.created_at).toLocaleDateString()} 
          iconColor="#06B6D4"
        />
      </CardContent>
    </Card>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-6 pt-16 pb-6">
        <Text className="text-2xl font-bold text-white">Family Planning Records</Text>
        <Text className="text-blue-100 mt-1">Manage and view all patient records</Text>
      </View>

      <ScrollView className="flex-1 px-4 mt-4" showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View className="flex-row mb-4">
          <StatCard
            title="Total"
            value={totalFPPatients.toString()}
            icon={Users}
            color="#3B82F6"
          />
          <StatCard
            title="Resident"
            value={residentFPPatients.toString()}
            icon={Home}
            trend={residentFPPercentage > transientFPPercentage ? 'up' : 'down'}
            percentage={residentFPPercentage}
            color="#10B981"
          />
          <StatCard
            title="Transient"
            value={transientFPPatients.toString()}
            icon={User}
            trend={transientFPPercentage > residentFPPercentage ? 'up' : 'down'}
            percentage={transientFPPercentage}
            color="#F59E0B"
          />
        </View>

        {/* Search and Filter Card */}
        <Card className="mb-4">
          <CardContent>
            <View className="flex-row items-center space-x-3">
              {/* Search Input */}
              <View className="flex-1 relative">
                <View className="absolute left-3 top-3 z-10">
                  <Search size={16} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="Search patients, methods..."
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              
              {/* Filter Button */}
              <TouchableOpacity 
                onPress={() => {/* You can implement a modal here */}} 
                className="w-12 h-12 bg-gray-100 rounded-lg items-center justify-center"
              >
                <Filter size={18} color="#6B7280" />
              </TouchableOpacity>
              
              {/* Refresh Button */}
              <TouchableOpacity 
                onPress={handleRefresh} 
                className="w-12 h-12 bg-blue-600 rounded-lg items-center justify-center"
              >
                <RefreshCw size={18} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Filter Dropdown */}
            <View className="mt-3">
              <SelectLayout
                placeholder="Filter by client type..."
                options={clientTypeOptions}
                value={selectedFilter}
                onChange={handleFilterChange}
              />
            </View>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Card className="mb-4">
          <CardContent>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold text-gray-800">
                  {filteredRecords.length} Record{filteredRecords.length !== 1 ? 's' : ''}
                </Text>
                <Text className="text-sm text-gray-600">
                  {searchQuery || selectedFilter !== "all" 
                    ? `Filtered from ${fpRecords.length} total records` 
                    : "All family planning records"
                  }
                </Text>
              </View>
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                <Activity size={20} color="#10B981" />
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <Card className="py-12">
            <CardContent className="items-center">
              <FileText size={48} color="#9CA3AF" />
              <Text className="text-lg text-gray-500 mt-4 text-center">No Records Found</Text>
              <Text className="text-sm text-gray-400 mt-2 text-center">
                {searchQuery || selectedFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No Family Planning records are available."}
              </Text>
            </CardContent>
          </Card>
        ) : (
          <View className="mb-4">
                          <FlatList
              data={paginatedRecords}
              renderItem={renderRecordItem}
              keyExtractor={(item) => item.fprecord_id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Pagination */}
        {filteredRecords.length > 0 && totalPages > 1 && (
          <Card className="mb-6">
            <CardContent>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm text-gray-600">
                  Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
                  {Math.min(currentPage * pageSize, filteredRecords.length)} of{" "}
                  {filteredRecords.length} records
                </Text>
                <Text className="text-sm font-medium text-gray-800">
                  Page {currentPage} of {totalPages}
                </Text>
              </View>
              
              <View className="flex-row justify-center space-x-2">
                {/* Previous Button */}
                <TouchableOpacity
                  onPress={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === 1 ? "bg-gray-100" : "bg-blue-600"
                  }`}
                >
                  <Text className={`${currentPage === 1 ? "text-gray-400" : "text-white"} font-medium`}>
                    Previous
                  </Text>
                </TouchableOpacity>

                {/* Page Numbers */}
                <View className="flex-row space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <TouchableOpacity
                        key={pageNum}
                        onPress={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg items-center justify-center ${
                          currentPage === pageNum ? "bg-blue-600" : "bg-gray-100"
                        }`}
                      >
                        <Text className={`${currentPage === pageNum ? "text-white" : "text-gray-800"} font-medium`}>
                          {pageNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Next Button */}
                <TouchableOpacity
                  onPress={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === totalPages ? "bg-gray-100" : "bg-blue-600"
                  }`}
                >
                  <Text className={`${currentPage === totalPages ? "text-gray-400" : "text-white"} font-medium`}>
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Bottom Spacer */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}