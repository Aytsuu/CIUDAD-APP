"use client";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl
} from "react-native";
import {
  Shield,
  User,
  Trash2,
  Truck,
  Archive,
  ArchiveRestore,
  Plus,
  ChevronLeft
} from "lucide-react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  useTrucks,
  usePersonnel,
  useDeleteTruck,
  useRestoreTruck,
} from "./waste-personnel-truck-queries";
import  { PersonnelItem, TruckData, SearchFormValues, Role, SearchFormSchema } from "./waste-personnel-types";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import PageLayout from "@/screens/_PageLayout";
import { SearchInput } from "@/components/ui/search-input";

export default function WastePersonnelMain() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedRole, setSelectedRole] = useState<Role>("Watchman");
  const [truckViewMode, setTruckViewMode] = useState<"active" | "archive">("active");
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
  const { data: trucks = [], isLoading: isTrucksLoading, refetch } = useTrucks();
  const { data: personnel = [], isLoading: isPersonnelLoading } = usePersonnel();
  const deleteTruckMutation = useDeleteTruck();
  const restoreTruckMutation = useRestoreTruck();
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const personnelData = {
    Watchman: personnel.filter((p) => p.position === "Watchman"),
    "Waste Driver": personnel.filter((p) => p.position === "Waste Driver"),
    "Waste Collector": personnel.filter(
      (p) => p.position === "Waste Collector"
    ),
    Trucks: trucks,
  };

  const filteredTrucks = personnelData.Trucks.filter((truck) => {
    const searchString =
      `${truck.truck_id} ${truck.truck_plate_num} ${truck.truck_model} ${truck.truck_capacity} ${truck.truck_status}`.toLowerCase();
    return (
      searchString.includes(searchQuery.toLowerCase()) &&
      (truckViewMode === "active"
        ? !truck.truck_is_archive
        : truck.truck_is_archive)
    );
  });

  const filteredPersonnel = (
    personnelData[selectedRole] as PersonnelItem[]
  ).filter((item) =>
    Object.values(item).some((val) =>
      val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleAddTruck = () => {
    router.push("/(waste)/waste-personnel/waste-truck-create");
  };

  const handleEditTruck = (truck: TruckData) => {
    router.push({
      pathname: "/(waste)/waste-personnel/waste-truck-edit",
      params: { id: truck.truck_id },
    });
  };

  const buttonData = [
    {
      label: "Watchman",
      icon: <Shield size={width < 400 ? 22 : 28} color="green" />,
    },
    {
      label: "Waste Driver",
      icon: <User size={width < 400 ? 22 : 28} color="orange" />,
    },
    {
      label: "Waste Collector",
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
  };

  if (isTrucksLoading || isPersonnelLoading) {
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
          rightAction={
            <View></View>
          }
        >
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="bg-white border-b border-gray-300 px-4">
          <View className="flex-row justify-between items-center gap-x-2">
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

        <ScrollView
          className="mt-4 px-5"
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          <View className="mb-4">
            {selectedRole === "Trucks" && (
              <View className="flex-row justify-center mb-3">
                <View className="flex-row border border-gray-300 rounded-full bg-gray-100 overflow-hidden">
                  <TouchableOpacity
                    className={`px-4 py-2 ${
                      truckViewMode === "active" ? "bg-white" : ""
                    }`}
                    onPress={() => setTruckViewMode("active")}
                  >
                    <Text className="text-sm font-medium">Active</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`px-4 py-2 ${
                      truckViewMode === "archive" ? "bg-white" : ""
                    }`}
                    onPress={() => setTruckViewMode("archive")}
                  >
                    <Text className="text-sm font-medium">Archived</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View className="flex-row items-center gap-x-2 mb-4">
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
                  onChange={(text) => setSearchValue("searchQuery", text)}
                  onSubmit={() => {
                    // Optional submit logic
                  }}
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
          </View>

          {selectedRole === "Trucks" ? (
            <View>
              {filteredTrucks.map((truck) => (
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
                          onPress={() => restoreTruckMutation.mutate(truck.truck_id)}
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
                                <Archive size={20} color="#ef4444" />
                              )}
                            </TouchableOpacity>
                          }
                          title="Confirm Archive"
                          description={`Archive truck ${truck.truck_plate_num}?`}
                          actionLabel="Archive"
                          onPress={() => deleteTruckMutation.mutate({ id: truck.truck_id, permanent: false })}
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
                                <Trash2 size={20} color="#ef4444" />
                              )}
                            </TouchableOpacity>
                          }
                          title="Confirm Permanent Delete"
                          description={`Permanently delete truck ${truck.truck_plate_num}? This cannot be undone.`}
                          actionLabel="Delete"
                          variant="destructive"
                          onPress={() => deleteTruckMutation.mutate({ id: truck.truck_id, permanent: true })}
                          loading={deleteTruckMutation.isPending}
                        />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              {filteredTrucks.length === 0 && (
                <Text className="mt-4 text-sm text-center text-gray-500">
                  No trucks found.
                </Text>
              )}
            </View>
          ) : (
            <View className="space-y-6">
              {filteredPersonnel.map((item: PersonnelItem) => (
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
                      {item.position}
                    </Text>
                  </View>
                </View>
              ))}
              {filteredPersonnel.length === 0 && (
                <Text className="mt-4 text-base text-center text-gray-500">
                  No results found.
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </ScrollView>
    </PageLayout>
  );
}