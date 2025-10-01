"use client";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import {
  SafeAreaView,
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  FlatList
} from "react-native";
import {
  User,
  Trash2,
  Truck,
  ArchiveRestore,
  Plus,
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
import { SearchInput } from "@/components/ui/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import { LoadingModal } from '@/components/ui/loading-modal';

export default function WastePersonnelMain() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedRole, setSelectedRole] = useState<Role>("LOADER");
  const [truckViewMode, setTruckViewMode] = useState<"active" | "archive">("active");
  const [currentPage, setCurrentPage] = useState(1);
  const searchInputRef = useRef<TextInput>(null);

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

  // Render truck item
  const renderTruckItem = (truck: TruckData) => (
    <TouchableOpacity
      key={truck.truck_id}
      onPress={() => handleEditTruck(truck)}
      activeOpacity={0.7}
      className="mb-4"
    >
      <View
        className={`bg-white rounded-lg border border-gray-300 p-3 flex-row items-center justify-between ${
          truckViewMode === "archive" ? "bg-gray-50" : ""
        }`}
      >
        <View className="flex-1">
          <Text className="text-sm font-medium">
            {truck.truck_plate_num}
          </Text>
          <Text className="text-xs text-gray-500">
            {truck.truck_model}
          </Text>
          <Text
            className={`text-xs px-2 py-1 rounded-full mt-1 ${
              truck.truck_status === "Operational"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {truck.truck_status}
          </Text>
        </View>
        <View className="flex-row space-x-4">
          {truck.truck_is_archive ? (
            <ConfirmationModal
              trigger={
                <TouchableOpacity
                  className="p-2"
                  disabled={restoreTruckMutation.isPending}
                >
                  {restoreTruckMutation.isPending ? (
                    <ActivityIndicator size="small" color="#10b981" />
                  ) : (
                    <ArchiveRestore size={20} color="#10b981" />
                  )}
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
                <TouchableOpacity
                  className="p-2"
                  disabled={deleteTruckMutation.isPending}
                >
                  {deleteTruckMutation.isPending ? (
                    <ActivityIndicator size="small" color="#f59e0b" />
                  ) : (
                    <Trash2 size={20} color="#ef4444" />
                  )}
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
                <TouchableOpacity
                  className="p-2"
                  disabled={deleteTruckMutation.isPending}
                >
                  {deleteTruckMutation.isPending ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Ban size={20} color="#ef4444" />
                  )}
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
    </TouchableOpacity>
  );

  const renderPersonnelItem = (item: PersonnelItem) => (
    <View
      key={item.id}
      className="flex-row items-center px-6 py-5 mb-3 bg-white border border-gray-300 rounded-xl shadow-sm"
    >
      <View className="flex-1 pr-4">
        <Text
          className={`font-semibold text-[#1a1a1a] ${
            width < 400 ? "text-sm" : "text-base"
          }`}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
      </View>
      <View className="w-px h-6 bg-gray-300" />
      <View className="flex-1 pl-4">
        <Text
          className={`font-semibold text-[#1a1a1a] text-right ${
            width < 400 ? "text-sm" : "text-base"
          }`}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.contact}
        </Text>
      </View>
    </View>
  );

  const isLoading = (selectedRole === "Trucks" ? isTrucksLoading : isPersonnelLoading);
  const isFetching = (selectedRole === "Trucks" ? isTrucksFetching : isPersonnelFetching);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2a3a61" />
      </SafeAreaView>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerTitle={<Text>Waste Personnel and Collection Vehicle Management</Text>}
      rightAction={<View></View>}
    >
      <LoadingModal visible={isSearching} />

      {/* Fixed Header Section - Outside ScrollView via absolute positioning */}
      <View className="bg-white border-b border-gray-300">
        <View className="flex-row justify-between items-center gap-x-2 px-4">
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

      {/* Search and Filter Section */}
      <View className="px-5 pt-4 pb-3 bg-white">
        <View className="flex-row items-center gap-x-2 mb-3">
          <View className="relative flex-1 h-12">
            {searchQuery.length > 0 && (
              <TouchableOpacity
                className="absolute right-3 top-0 bottom-0 z-10 flex items-center justify-center"
                onPress={() => {
                  setSearchValue("searchQuery", "");
                  searchInputRef.current?.focus();
                }}
              >
                {/* <XCircle size={16} color="#9CA3AF" /> */}
              </TouchableOpacity>
            )}
            <SearchInput
              value={searchQuery}
              onChange={(text) => {
                setSearchValue("searchQuery", text);
                setCurrentPage(1);
              }}
              onSubmit={() => {}}
            />
          </View>
          {selectedRole === "Trucks" && truckViewMode === "active" && (
            <TouchableOpacity
              className="bg-primaryBlue p-2 rounded-full"
              onPress={handleAddTruck}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {selectedRole === "Trucks" && (
          <View className="flex-row justify-center">
            <View className="flex-row bg-gray-100 overflow-hidden">
              <TouchableOpacity
                className={`px-4 py-2 ${
                  truckViewMode === "active" ? "bg-gray-100" : "bg-white"
                }`}
                onPress={() => {
                  setTruckViewMode("active");
                  setCurrentPage(1);
                }}
              >
                <Text className="text-sm font-medium">Active</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-4 py-2 ${
                  truckViewMode === "archive" ? "bg-gray-100" : "bg-white"
                }`}
                onPress={() => {
                  setTruckViewMode("archive");
                  setCurrentPage(1);
                }}
              >
                <Text className="text-sm font-medium">Disposed</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Content Area - This is what scrolls and reloads */}
      <View className="flex-1 px-5">
        {isFetching && searchQuery === debouncedSearchTerm ? (
          <View className="py-8">
            <ActivityIndicator size="small" color="#2a3a61" />
          </View>
        ) : (
          <View className="pb-4">
            {selectedRole === "Trucks" ? (
              filteredTrucks.length > 0 ? (
                filteredTrucks.map(truck => renderTruckItem(truck))
              ) : (
                <Text className="mt-4 text-sm text-center text-gray-500">
                  No trucks found.
                </Text>
              )
            ) : (
              preparedPersonnel.length > 0 ? (
                preparedPersonnel.map(item => renderPersonnelItem(item))
              ) : (
                <Text className="mt-4 text-sm text-center text-gray-500">
                  No results found.
                </Text>
              )
            )}
          </View>
        )}
      </View>
    </PageLayout>
  );
}