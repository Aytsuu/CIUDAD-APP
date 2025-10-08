"use client";
import { useRouter } from "expo-router";
import { useState} from "react";
import {
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  FlatList,
} from "react-native";
import {
  User,
  Trash2,
  Truck,
  ArchiveRestore,
  ChevronLeft,
  Ban,
} from "lucide-react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  useGetTrucks,
  useGetAllPersonnel,
  useDeleteTruck,
  useRestoreTruck,
} from "./waste-personnel-truck-queries";
import  { PersonnelItem, TruckData, SearchFormValues, Role, SearchFormSchema, WastePersonnel } from "./waste-personnel-types";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import PageLayout from "@/screens/_PageLayout";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/emptyState";
import { LoadingModal } from "@/components/ui/loading-modal";
import { LoadingState } from "@/components/ui/loading-state";

export default function WastePersonnelMain() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedRole, setSelectedRole] = useState<Role>("LOADER");
  const [truckViewMode, setTruckViewMode] = useState<"active" | "archive">("active");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    control: searchControl,
    watch: watchSearch,
    setValue: setSearchValue,
  } = useForm<SearchFormValues>({
    resolver: zodResolver(SearchFormSchema),
    defaultValues: {
      searchQuery: "",
    },
  });

  const searchQuery = watchSearch("searchQuery");
  const debouncedSearchTerm = useDebounce(searchQuery, 500);

  const { 
    data: personnelData = { results: [], count: 0 }, 
    isLoading: isPersonnelLoading, 
    isFetching: isPersonnelFetching,
    refetch: refetchPersonnel 
  } = useGetAllPersonnel(
    currentPage,
    10, 
    debouncedSearchTerm,
    selectedRole !== "Trucks" ? selectedRole : undefined,
    {
      enabled: selectedRole !== "Trucks",
    }
  );

  const { 
    data: trucksData = { results: [], count: 0 }, 
    isLoading: isTrucksLoading, 
    isFetching: isTrucksFetching,
    refetch: refetchTrucks 
  } = useGetTrucks(
    selectedRole === "Trucks" ? currentPage : 1,
    selectedRole === "Trucks" ? 10 : 100, 
    selectedRole === "Trucks" ? debouncedSearchTerm : "",
    truckViewMode === "archive",
    { enabled: selectedRole === "Trucks" }
  );

  const deleteTruckMutation = useDeleteTruck();
  const restoreTruckMutation = useRestoreTruck();
  const [refreshing, setRefreshing] = useState(false)

  const isSearching = (selectedRole === "Trucks" && isTrucksFetching && searchQuery !== debouncedSearchTerm) || 
                     (selectedRole !== "Trucks" && isPersonnelFetching && searchQuery !== debouncedSearchTerm);

  const onRefresh = async () => {
    setRefreshing(true)
    if (selectedRole === "Trucks") {
      await refetchTrucks()
    } else {
      await refetchPersonnel()
    }
    setRefreshing(false)
  }

  const filteredTrucks = trucksData.results || [];
  const filteredPersonnel = personnelData.results || [];

  const handleEditTruck = (truck: TruckData) => {
    router.push({
      pathname: "/(waste)/waste-personnel/waste-truck-edit",
      params: { id: truck.truck_id.toString() },
    });
  };

  const handleDeleteTruck = (truck: TruckData) => {
    deleteTruckMutation.mutate({ 
      id: truck.truck_id.toString(),
      permanent: false 
    });
  };

  const handlePermanentDeleteTruck = (truck: TruckData) => {
    deleteTruckMutation.mutate({ 
      id: truck.truck_id.toString(),
      permanent: true 
    });
  };

  const handleRestoreTruck = (truck: TruckData) => {
    restoreTruckMutation.mutate(truck.truck_id.toString());
  };

  const handleAddTruck = () => {
    router.push("/(waste)/waste-personnel/waste-truck-create");
  };

  const buttonData = [
    {
      label: "DRIVER LOADER",
      icon: <User size={width < 400 ? 22 : 28} color="orange" />,
    },
    {
      label: "LOADER",
      icon: <Trash2 size={width < 400 ? 22 : 25} color="blue" />,
    },
    {
      label: "Trucks",
      icon: <Truck size={width < 400 ? 22 : 28} color="purple" />,
    },
  ];

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setSearchValue("searchQuery", "");
    setCurrentPage(1);
  };

  const preparePersonnelItem = (personnel: WastePersonnel): PersonnelItem => {
    const profile = personnel.staff?.profile;
    const personal = profile?.personal;
    const position = personnel.staff?.pos || personnel.staff?.profile?.position;

    return {
      id: personnel.wstp_id.toString(),
      name: personal
        ? `${personal.fname || ""} ${personal.mname || ""} ${
            personal.lname || ""
          } ${personal.suffix || ""}`.trim()
        : "Unknown Name",
      position: position?.pos_title || "LOADER",
      contact: personal?.contact || "N/A",
    };
  };

  const preparedPersonnel = filteredPersonnel.map(preparePersonnelItem);

  // Render Truck Card (styled like Budget Plan)
  const RenderTruckCard = ({ truck }: { truck: TruckData }) => (
    <TouchableOpacity
      onPress={() => handleEditTruck(truck)}
      activeOpacity={0.8}
      className="mb-3"
    >
      <Card className="border-2 border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-semibold text-lg text-[#1a2332] mb-1">
                {truck.truck_plate_num}
              </Text>
              <Text className="text-sm text-gray-500">
                {truck.truck_model}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  truck.truck_status === "Operational"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {truck.truck_status}
              </Text>
            </View>
          </View>
        </CardHeader>

        <CardContent className="pt-3 border-t border-gray-200">
          <View className="flex-row justify-end items-center">
            <View className="flex-row space-x-2">
              {truck.truck_is_archive ? (
                <ConfirmationModal
                  trigger={
                    <TouchableOpacity className="bg-green-50 p-2 rounded-lg">
                      <ArchiveRestore size={16} color="#10b981" />
                    </TouchableOpacity>
                  }
                  title="Confirm Restore"
                  description={`Restore truck ${truck.truck_plate_num}?`}
                  actionLabel="Restore"
                  onPress={() => handleRestoreTruck(truck)}
                  loading={restoreTruckMutation.isPending}
                />
              ) : (
                <ConfirmationModal
                  trigger={
                    <TouchableOpacity className="bg-red-50 p-2 rounded-lg">
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  }
                  title="Confirm Dispose"
                  description={`Are you sure you want to record truck ${truck.truck_plate_num} as disposed? It will be moved to the disposed trucks list.`}
                  actionLabel="Confirm"
                  onPress={() => handleDeleteTruck(truck)}
                  loading={deleteTruckMutation.isPending}
                />
              )}
              {truckViewMode === "archive" && (
                <ConfirmationModal
                  trigger={
                    <TouchableOpacity className="bg-red-50 p-2 rounded-lg">
                      <Ban size={16} color="#ef4444" />
                    </TouchableOpacity>
                  }
                  title="Confirm Permanent Delete"
                  description={`Permanently delete truck ${truck.truck_plate_num}? This cannot be undone.`}
                  actionLabel="Delete"
                  variant="destructive"
                  onPress={() => handlePermanentDeleteTruck(truck)}
                  loading={deleteTruckMutation.isPending}
                />
              )}
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  // Render Personnel Card (styled like Budget Plan)
  const RenderPersonnelCard = ({ item }: { item: PersonnelItem }) => (
    <Card className="border-2 border-gray-200 shadow-sm bg-white mb-3">
      <CardHeader className="pb-3">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="font-semibold text-lg text-[#1a2332] mb-1">
              {item.name}
            </Text>
            {/* <Text className="text-sm text-gray-500">
              {item.position}
            </Text> */}
          </View>
        </View>
      </CardHeader>

      <CardContent className="pt-3 border-t border-gray-200">
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-gray-600">Contact:</Text>
          <Text className="text-sm font-medium text-black">
            {item.contact}
          </Text>
        </View>
      </CardContent>
    </Card>
  );

  const isLoading = (selectedRole === "Trucks" ? isTrucksLoading : isPersonnelLoading);
  const isMutationLoading = deleteTruckMutation.isPending || restoreTruckMutation.isPending;

  const getLoadingMessage = () => {
    if (deleteTruckMutation.isPending) return "Processing truck...";
    if (restoreTruckMutation.isPending) return "Restoring truck...";
    return `Loading ${selectedRole === "Trucks" ? "trucks" : "personnel"}...`;
  };

  // Empty state component
  const renderEmptyState = () => {
    const emptyMessage = searchQuery
      ? `No ${selectedRole === "Trucks" ? "trucks" : "personnel"} found matching your search`
      : `No ${selectedRole === "Trucks" ? "trucks" : "personnel"} found`;
    
    return (
      <View className="flex-1 justify-center items-center py-8">
        <EmptyState emptyMessage={emptyMessage} />
      </View>
    );
  };

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <ActivityIndicator size="large" color="#2a3a61" />
      <Text className="text-sm text-gray-500 mt-2">
        Loading {selectedRole === "Trucks" ? "trucks" : "personnel"}...
      </Text>
    </View>
  );

return (
  <>
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="font-semibold text-lg text-[#2a3a61]">Waste Personnel & Vehicles</Text>}
      rightAction={<View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>}
      wrapScroll={false}
    >
      <View className="flex-1">
        {/* Role Selection Buttons */}
        <View className="bg-white border-b border-gray-300">
          <View className="flex-row justify-between items-center gap-x-2 px-6 py-3">
            {buttonData.map((item, index) => (
              <View key={index} className="flex-1">
                <TouchableOpacity
                  className={`items-center justify-center rounded-lg py-3 px-1 ${
                    selectedRole === item.label ? "bg-gray-100" : "bg-white"
                  }`}
                  onPress={() => handleRoleChange(item.label as Role)}
                  activeOpacity={0.7}
                >
                  {item.icon}
                  <Text
                    className={`font-medium mt-1 text-black text-center ${
                      width < 400 ? "text-xs" : "text-sm"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Search and Filter Section - Styled like Resolution */}
        <View className="px-6 pt-4 pb-3 bg-white">
          <View className="flex-row items-center gap-2 pb-3">
            <View className="relative flex-1">
              <TextInput
                placeholder={`Search ${selectedRole === "Trucks" ? "trucks" : "personnel"}...`}
                className="pl-2                                                 w-full h-[45px] bg-white text-base rounded-xl p-2 border border-gray-300"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchValue("searchQuery", text);
                  setCurrentPage(1);
                }}
              />
            </View>
          </View>

          {/* Truck Tabs - Styled like Budget Plan */}
          {selectedRole === "Trucks" && (
            <View className="pb-3">
              <Tabs value={truckViewMode} onValueChange={val => setTruckViewMode(val as "active" | "archive")}>
                <TabsList className="bg-blue-50 flex-row justify-between">
                  <TabsTrigger 
                    value="active" 
                    className={`flex-1 mx-1 ${truckViewMode === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
                  >
                    <Text className={`${truckViewMode === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                      Active
                    </Text>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="archive" 
                    className={`flex-1 mx-1 ${truckViewMode === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
                  >
                    <Text className={`${truckViewMode === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                      Disposed
                    </Text>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </View>
          )}

          {/* Add Truck Button - Styled like Resolution */}
          {selectedRole === "Trucks" && truckViewMode === "active" && (
            <Button 
              onPress={handleAddTruck} 
              className="bg-primaryBlue rounded-xl"
            >
              <Text className="text-white text-[17px]">Add Truck</Text>
            </Button>
          )}
        </View>

        {/* Content Area */}
        <View className="flex-1 px-6">
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <LoadingState/>
            </View>
          ) : (
            <View className="flex-1">
              {selectedRole === "Trucks" ? (
                filteredTrucks.length === 0 ? (
                  renderEmptyState()
                ) : (
                  <FlatList
                    data={filteredTrucks}
                    renderItem={({ item }) => <RenderTruckCard truck={item} />}
                    keyExtractor={(item) => item.truck_id.toString()}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#00a8f0']}
                      />
                    }
                    contentContainerStyle={{ 
                      paddingBottom: 16,
                      paddingTop: 16
                    }}
                  />
                )
              ) : (
                preparedPersonnel.length === 0 ? (
                  renderEmptyState()
                ) : (
                  <FlatList
                    data={preparedPersonnel}
                    renderItem={({ item }) => <RenderPersonnelCard item={item} />}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#00a8f0']}
                      />
                    }
                    contentContainerStyle={{ 
                      paddingBottom: 16,
                      paddingTop: 16
                    }}
                  />
                )
              )}
            </View>
          )}
        </View>
      </View>
    </PageLayout>

    {/* Loading Modal only for mutations (delete, restore) */}
    <LoadingModal 
      visible={deleteTruckMutation.isPending || restoreTruckMutation.isPending} 
    />
  </>
);
}