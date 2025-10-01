import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UsersRound } from "@/lib/icons/UsersRound";
import PageLayout from "../../_PageLayout";
import {
  useGetFamilyMembers,
  useGetPersonalInfo,
} from "../queries/profilingGetQueries";
import { capitalize } from "@/helpers/capitalize";

export default function ResidentDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const resident = React.useMemo(() => {
    try {
      return JSON.parse(params.resident as string);
    } catch (error) {
      console.error("Error parsing resident data:", error);
      return null;
    }
  }, [params.resident]);

  const {
    data: personalInfo,
    isLoading: loadingPersonalInfo,
    refetch: refetchPersonalinfo,
  } = useGetPersonalInfo(resident?.rp_id, resident?.per_id);
  const {
    data: familyMembers,
    isLoading: loadingFam,
    refetch: refetchFamily,
  } = useGetFamilyMembers(resident?.family_no);

  const members = familyMembers?.results || [];
  const totalCount = familyMembers?.count || 0;

  React.useEffect(() => {
    if (!resident) {
      Alert.alert("Error", "Resident data not found", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [resident]);

  const fullName = `${resident?.fname} ${
    resident?.mname ? resident.mname + " " : ""
  }${resident?.lname}`;

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <View className="py-3 border-b border-gray-100">
      <Text className="text-gray-500 text-xs mb-1">{label}</Text>
      <Text className="text-gray-900 text-sm">{value}</Text>
    </View>
  );

  const FamilyMemberCard = ({ member }: { member: any }) => (
    <View className="py-4 border-b border-gray-100">
      <View className="flex-row justify-between items-start mb-2.5">
        <View className="flex-1">
          <Text className="text-gray-900 font-medium text-sm">
            {member.name}
          </Text>
          <Text className="text-blue-600 text-xs mt-1">{member.fc_role}</Text>
        </View>
        <Text className="text-gray-400 text-xs">{member.rp_id}</Text>
      </View>
      <View className="flex-row gap-4">
        <Text className="text-gray-600 text-xs">{member.sex}</Text>
        <Text className="text-gray-600 text-xs">{member.status}</Text>
        {member.dob && (
          <Text className="text-gray-600 text-xs">{member.dob}</Text>
        )}
      </View>
    </View>
  );

  const formatAddress = (address: any) => {
    const parts = [
      address.add_street,
      address.sitio ? "Sitio " + capitalize(address.sitio) : "",
      "Sitio " + address.add_external_sitio,
      address.add_barangay,
      address.add_city,
      address.add_province,
    ].filter((part) => part && part.trim() !== "");

    return parts.join(", ");
  };

  const AddressCard = ({ address, index }: { address: any; index: number }) => (
    <View className="py-3 border-b border-gray-100">
      <Text className="text-gray-500 text-xs mb-1">Address {index + 1}</Text>
      <Text className="text-gray-900 text-sm leading-5">
        {formatAddress(address)}
      </Text>
    </View>
  );

  const RenderDetails = React.memo(() => (
    <View className="flex-1">
      {/* Profile Header */}
      <View className="px-5 pt-6 pb-6 border-b border-gray-200">
        <Text className="text-gray-900 font-semibold text-lg mb-2">
          {fullName}
        </Text>
        <Text className="text-gray-600 text-sm">ID: {resident.rp_id}</Text>
      </View>

      {/* Basic Information */}
      {loadingPersonalInfo ? (
        <View className="px-5 py-5 border-b border-gray-200">
          <Text className="text-gray-900 font-medium text-sm mb-4">
            Basic Information
          </Text>
          <View className="items-center py-6">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="text-gray-500 text-xs mt-2">Loading...</Text>
          </View>
        </View>
      ) : (
        <View className="px-5 py-5 border-b border-gray-200">
          <Text className="text-gray-900 font-medium text-sm mb-4">
            Basic Information
          </Text>
          <InfoRow
            label="Age"
            value={`${personalInfo?.per_age || "N/A"} years old`}
          />
          <InfoRow label="Gender" value={personalInfo?.per_sex || "N/A"} />
          {personalInfo?.per_status && (
            <InfoRow label="Civil Status" value={personalInfo.per_status} />
          )}
          {personalInfo?.per_dob && (
            <View className="py-3">
              <Text className="text-gray-500 text-xs mb-1">Birth Date</Text>
              <Text className="text-gray-900 text-sm">
                {personalInfo.per_dob}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Contact Information */}
      {(personalInfo?.per_contact ||
        (personalInfo?.per_addresses &&
          personalInfo.per_addresses.length > 0)) && (
        <View className="px-5 py-5 border-b border-gray-200">
          <Text className="text-gray-900 font-medium text-sm mb-4">
            Contact Information
          </Text>
          {personalInfo.per_contact && (
            <InfoRow label="Phone Number" value={personalInfo.per_contact} />
          )}
          {personalInfo?.per_addresses &&
            personalInfo.per_addresses.length > 0 && (
              <View className={personalInfo.per_contact ? "pt-3" : ""}>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-500 text-xs">
                    {personalInfo.per_addresses.length === 1
                      ? "Address"
                      : "Addresses"}
                  </Text>
                  {personalInfo.per_addresses.length > 1 && (
                    <Text className="text-gray-400 text-xs">
                      {personalInfo.per_addresses.length}
                    </Text>
                  )}
                </View>
                {personalInfo.per_addresses.map(
                  (address: any, index: number) => (
                    <AddressCard
                      key={address.add_id || index}
                      address={address}
                      index={index}
                    />
                  )
                )}
              </View>
            )}
        </View>
      )}

      {/* Additional Information */}
      <View className="px-5 py-5 border-b border-gray-200">
        <Text className="text-gray-900 font-medium text-sm mb-4">
          Additional Information
        </Text>
        {resident.family_no && (
          <InfoRow label="Family ID" value={resident.family_no} />
        )}
        {resident.household_no && (
          <InfoRow label="Household ID" value={resident.household_no} />
        )}
        {resident.rp_date_registered && (
          <View className="py-3">
            <Text className="text-gray-500 text-xs mb-1">Date Registered</Text>
            <Text className="text-gray-900 text-sm">
              {resident.rp_date_registered}
            </Text>
          </View>
        )}
      </View>

      {/* Family Members with Accordion */}
      {members.length > 0 && (
        <View className="px-5 py-5">
          <Accordion type="single" className="border-0">
            <AccordionItem value="family-members" className="border-0">
              <AccordionTrigger className="py-3">
                <View className="flex-row justify-between items-center flex-1 mr-2">
                  <Text className="text-gray-900 font-medium text-sm">
                    Family Members
                  </Text>
                  {!loadingFam && totalCount > 0 && (
                    <Text className="text-gray-500 text-xs">{totalCount}</Text>
                  )}
                </View>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                {loadingFam ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text className="text-gray-500 text-xs mt-2">
                      Loading...
                    </Text>
                  </View>
                ) : members.length > 0 ? (
                  <ScrollView
                    className="max-h-96"
                    showsVerticalScrollIndicator={false}
                    overScrollMode="never"
                    nestedScrollEnabled={true}
                  >
                    {members.map((member: any, index: number) => (
                      <FamilyMemberCard
                        key={member.rp_id || index}
                        member={member}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <View className="items-center py-8">
                    <Text className="text-gray-400 text-xs">
                      No family members found
                    </Text>
                  </View>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </View>
      )}

      <View className="h-8" />
    </View>
  ));

  if (!resident) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={
          <Text className="text-gray-900 text-sm font-medium">
            Resident Details
          </Text>
        }
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-2">Loading...</Text>
        </View>
      </PageLayout>
    );
  }

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Resident</Text>}
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <FlatList
        maxToRenderPerBatch={1}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        data={[{}]}
        renderItem={({ index }) => <RenderDetails />}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              refetchPersonalinfo();
              refetchFamily();
            }}
            colors={["#0084f0"]}
          />
        }
        windowSize={5}
        removeClippedSubviews={true}
      />
    </PageLayout>
  );
}
