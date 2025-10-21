import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import PageLayout from "@/screens/_PageLayout";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Home } from "@/lib/icons/Home";
import { householdFormSchema } from "@/form-schema/profiling-schema";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/ui/toast";
import api2 from "@/api/api";
import { useQuery } from "@tanstack/react-query";
// @ts-ignore - TypeScript cache issue, file exists and works at runtime
import { CustomDropdown } from "@/components/ui/custom-dropdown";

type HouseholdFormData = z.infer<typeof householdFormSchema>;

export default function HouseholdRegistration() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToastContext();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedResident, setSelectedResident] = React.useState<any>(null);

  const form = useForm<HouseholdFormData>({
    resolver: zodResolver(householdFormSchema),
    defaultValues: {
      householdHead: "",
      nhts: "",
      address: "",
      add_id: "",
    },
  });

  // Fetch residents list (only residents without households)
  const { data: residentsData, isLoading: loadingResidents } = useQuery({
    queryKey: ["residents-list", searchQuery],
    queryFn: async () => {
      const response = await api2.get("profiling/resident/", {
        params: {
          is_staff: false,
          exclude_independent: true,
          is_search_only: false,
          search: searchQuery,
        },
      });
      return response.data;
    },
  });

  // Fetch all addresses (will be filtered by selected resident)
  const { data: allAddressesData, isLoading: loadingAddresses } = useQuery({
    queryKey: ["per-addresses-list"],
    queryFn: async () => {
      const response = await api2.get("profiling/per_address/list/");
      return response.data;
    },
  });

  // Filter addresses based on selected resident's per_id
  const addressesData = React.useMemo(() => {
    if (!selectedResident?.personal_info?.per_id || !allAddressesData) return [];
    
    const filteredAddresses = allAddressesData.filter(
      (address: any) => address.per === selectedResident.personal_info.per_id
    );
    
    console.log('Selected resident per_id:', selectedResident.personal_info.per_id);
    console.log('Filtered addresses:', filteredAddresses);
    console.log('Sample address structure:', filteredAddresses[0]);
    
    return filteredAddresses;
  }, [selectedResident, allAddressesData]);

  // Format residents for dropdown
  const formattedResidents = React.useMemo(() => {
    if (!residentsData) return [];
    return residentsData.map((resident: any) => {
      // The API returns a formatted 'name' field (e.g., "Dela Cruz, Juan Miguel")
      const fullName = resident.name || `${resident.lname}, ${resident.fname}${
        resident.mname ? ` ${resident.mname}` : ""
      }`;
      return {
        label: `${resident.rp_id} - ${fullName}`,
        value: `${resident.rp_id} ${fullName}`,
        data: resident,
      };
    });
  }, [residentsData]);

  // Format addresses for dropdown
  const formattedAddresses = React.useMemo(() => {
    if (!addressesData) return [];
    return addressesData.map((address: any, idx: number) => {
      // Format: "ADDRESS 1 - SITIO {sitio_name}, {street}"
      // This matches the web implementation format
      // Note: Backend returns sitio as a string, not an object
      const sitioName = address.sitio || "Unknown";
      const street = address.add_street || "Unknown Street";
      const formattedLabel = `ADDRESS ${idx + 1} - SITIO ${sitioName}, ${street}`;

      // The value stores: add_id-sitio-street (matches web format)
      const formattedValue = `${address.add_id}-${sitioName}-${street}`;

      return {
        label: formattedLabel,
        value: formattedValue,
        data: address,
        add_id: address.add_id,
      };
    });
  }, [addressesData]);

  // Handle resident selection
  const handleResidentSelect = (value: string) => {
    form.setValue("householdHead", value);
    const resident = formattedResidents.find((r: any) => r.value === value);
    setSelectedResident(resident?.data);
    form.resetField("address");
  };

  // Handle form submission
  const handleSubmit = async (data: HouseholdFormData) => {
    try {
      setIsSubmitting(true);

      // Extract resident ID from householdHead value
      const residentId = data.householdHead.split(" ")[0];
      
      // Extract address ID - should be the numeric ID
      const addressId = data.add_id || data.address.split("-")[0];

      const payload = {
        rp: residentId,
        hh_nhts: data.nhts,  // Already uppercase from the form
        add: parseInt(addressId),
        staff: user?.staff?.staff_id,
      };

      console.log("=== Household Submission Debug ===");
      console.log("Form data:", data);
      console.log("Resident ID:", residentId);
      console.log("Address ID (raw):", addressId);
      console.log("Address ID (parsed):", parseInt(addressId));
      console.log("Staff ID:", user?.staff?.staff_id);
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("=================================");

      const response = await api2.post("profiling/household/create/", payload);

      console.log("Success response:", response.data);
      toast.success("Household registered successfully!");

      form.reset();
      router.back();
    } catch (error: any) {
      console.error("=== Household Submission Error ===");
      console.error("Error object:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error message:", error.message);
      console.error("=================================");

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        "Failed to register household. Please try again.";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-gray-900 text-[13px]">Household Registration</Text>
      }
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="mt-6 mb-6">
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-3">
              <Home size={32} className="text-blue-600" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Register New Household
            </Text>
            <Text className="text-sm text-gray-600 text-center px-4">
              Register a household by selecting a household head and address
            </Text>
          </View>
        </View>

        {/* Form Card */}
        <Card className="p-5 mb-6">
          {/* Household Head */}
          <View className="mb-5">
            <Label className="text-black/70 mb-2">Household Head *</Label>
            <Controller
              control={form.control}
              name="householdHead"
              render={({ field: { value }, fieldState: { error } }) => (
                <>
                  <CustomDropdown
                    data={formattedResidents}
                    value={value}
                    onSelect={handleResidentSelect}
                    placeholder="Select household head"
                    searchPlaceholder="Search resident..."
                    onSearchChange={setSearchQuery}
                    loading={loadingResidents}
                    emptyMessage={
                      <View className="items-center py-4">
                        <Text className="text-gray-500 text-sm mb-2">
                          No resident without household found
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            router.push("/(health)/admin/health-profiling/resident-registration")
                          }
                        >
                          <Text className="text-blue-600 text-sm">
                            Register New Resident
                          </Text>
                        </TouchableOpacity>
                      </View>
                    }
                  />
                  {error && (
                    <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          {/* NHTS Status */}
          <View className="mb-5">
            <Label className="text-black/70 mb-2">NHTS Household *</Label>
            <Controller
              control={form.control}
              name="nhts"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => onChange("NO")}
                      className={`flex-1 border-2 rounded-lg p-3 ${
                        value === "NO"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <Text
                        className={`text-center font-medium ${
                          value === "NO" ? "text-blue-600" : "text-gray-700"
                        }`}
                      >
                        NO
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onChange("YES")}
                      className={`flex-1 border-2 rounded-lg p-3 ${
                        value === "YES"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <Text
                        className={`text-center font-medium ${
                          value === "YES" ? "text-blue-600" : "text-gray-700"
                        }`}
                      >
                        YES
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {error && (
                    <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
                  )}
                </>
              )}
            />
            <Text className="text-xs text-gray-500 mt-2">
              NHTS (National Household Targeting System)
            </Text>
          </View>

          {/* Address Selection */}
          {selectedResident && (
            <View className="mb-5">
              <Label className="text-black/70 mb-2">Address *</Label>
              <Controller
                control={form.control}
                name="address"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <>
                    {loadingAddresses ? (
                      <View className="border border-gray-200 rounded-lg p-4 items-center">
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text className="text-gray-500 text-sm mt-2">
                          Loading addresses...
                        </Text>
                      </View>
                    ) : formattedAddresses.length === 0 ? (
                      <View className="border border-gray-200 rounded-lg p-4">
                        <Text className="text-gray-500 text-sm text-center">
                          No addresses found for this resident
                        </Text>
                      </View>
                    ) : (
                      <CustomDropdown
                        data={formattedAddresses}
                        value={value}
                        onSelect={(val: string) => {
                          onChange(val);
                          const addr = formattedAddresses.find((a: any) => a.value === val);
                          // Set the add_id field with the actual address ID
                          form.setValue("add_id", addr?.add_id?.toString() || "");
                        }}
                        placeholder="Select address"
                        searchPlaceholder="Search address..."
                      />
                    )}
                    {error && (
                      <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
                    )}
                    <Text className="text-xs text-gray-500 mt-2">
                      This reflects the addresses from the resident's personal information
                    </Text>
                  </>
                )}
              />
            </View>
          )}
        </Card>

        {/* Submit Button */}
        <Button
          onPress={form.handleSubmit(handleSubmit)}
          disabled={isSubmitting}
          className="bg-blue-600"
        >
          {isSubmitting ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-medium">Registering...</Text>
            </View>
          ) : (
            <Text className="text-white font-medium">Register Household</Text>
          )}
        </Button>

        {/* Help Text */}
        <View className="mt-6 p-4 bg-blue-50 rounded-lg">
          <Text className="text-xs text-blue-800 text-center">
            Only residents without an existing household can be selected as household head.
          </Text>
        </View>
      </ScrollView>
    </PageLayout>
  );
}
