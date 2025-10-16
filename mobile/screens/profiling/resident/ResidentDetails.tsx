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
import { useLocalSearchParams, router } from "expo-router";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PageLayout from "../../_PageLayout";
import {
  useGetFamilyMembers,
  useGetPersonalInfo,
} from "../queries/profilingGetQueries";
import { capitalize } from "@/helpers/capitalize";
import { LoadingState } from "@/components/ui/loading-state";
import { formatDate } from "@/helpers/dateHelpers";

export default function ResidentDetails() {
  // ================ STATE INITIALIZATION ================
  const params = useLocalSearchParams();

  const resident = React.useMemo(() => {
    try {
      return JSON.parse(params.resident as string);
    } catch (error) {
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

  // ================ RENDER HELPERS ================
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

  const formatRegisteredBy = (info: string) => {
    const infoArray = info?.split("-")
    const staff_name = infoArray[1]
    const staff_type = infoArray[2]
    return (
      <View className="py-3 border-t border-gray-100">
        <Text className="text-gray-500 text-xs mb-1">Registered By</Text>
        <View className="flex-row justify-between">
          <Text className="text-gray-700 text-sm leading-5 font-medium">
            {staff_name}
          </Text>
          <View className="px-4 bg-green-500 flex-row items-center rounded-full">
            <Text className="text-white text-xs">
              {staff_type}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  const formatAddress = (address: any) => {
    const parts = [
      address.add_street,
      address.sitio ? address.sitio : "",
      address.add_external_sitio ? address.add_external_sitio : "",
      address.add_barangay,
      address.add_city,
      address.add_province,
    ].filter((part) => part && part.trim() !== "");

    return parts.join(", ");
  };

  const AddressCard = ({ address, index }: { address: any; index: number }) => (
    <View className="py-3">
      <Text className="text-gray-500 text-xs mb-1">Address {index + 1}</Text>
      <Text className="text-gray-900 text-sm leading-5">
        {formatAddress(address)}
      </Text>
    </View>
  );

  const Details = React.memo(({ item }: { item: Record<string, any> }) => (
    <View className="flex-1 px-6">
      {/* Profile Header */}
      <View className="pt-6 pb-6 border-b border-gray-200">
        <Text className="text-gray-900 font-semibold text-md mb-2">
          {fullName}
        </Text>
        <View className="flex-row">
          <View className="flex-row items-center px-4 bg-primaryBlue rounded-full">
            <Text className="text-white font-medium text-sm">{resident.rp_id}</Text>
          </View>
        </View>
      </View>

      <View className="py-5 border-b border-gray-200">
        <Text className="text-gray-900 font-medium text-sm mb-4">
          Basic Information
        </Text>
        <InfoRow label="Age" value={`${item?.per_age || "N/A"} years old`} />
        <InfoRow label="Gender" value={item?.per_sex || "N/A"} />
        {item?.per_status && (
          <InfoRow label="Civil Status" value={item.per_status} />
        )}
        {item?.per_dob && (
          <View className="py-3">
            <Text className="text-gray-500 text-xs mb-1">Birth Date</Text>
            <Text className="text-gray-900 text-sm">{formatDate(item.per_dob, "long")}</Text>
          </View>
        )}
      </View>

      {/* Contact Information */}
      {(item?.per_contact ||
        (item?.per_addresses && item.per_addresses.length > 0)) && (
        <View className="py-5 border-b border-gray-200">
          <Text className="text-gray-900 font-medium text-sm mb-4">
            Contact Information
          </Text>
          {item.per_contact && (
            <InfoRow label="Phone Number" value={item.per_contact} />
          )}
          {item?.per_addresses && item.per_addresses.length > 0 && (
            <View className={item.per_contact ? "pt-3" : ""}>
              {item.per_addresses.map((address: any, index: number) => (
                <AddressCard
                  key={address.add_id || index}
                  address={address}
                  index={index}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Additional Information */}
      <View className="py-5 border-b border-gray-200">
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
              {formatDate(resident.rp_date_registered, "long")}
            </Text>
          </View>
        )}
        {item.registered_by && (
          formatRegisteredBy(item.registered_by)
        )}
      </View>
        
      {/* Family Members with Accordion */}
      {item.members.length > 0 && (
        <View className="py-5">
          <Accordion type="single" className="border-0">
            <AccordionItem value="family-members" className="border-0">
              <AccordionTrigger className="py-3">
                <View className="flex-row justify-between items-center flex-1 mr-2">
                  <Text className="text-gray-900 font-medium text-sm">
                    Family Members
                  </Text>
                  <Text className="text-gray-500 text-xs">{item.members.length}</Text>
                </View>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <ScrollView
                  className="max-h-96"
                  showsVerticalScrollIndicator={false}
                  overScrollMode="never"
                  nestedScrollEnabled={true}
                >
                  {item.members.map((member: any, index: number) => (
                    <FamilyMemberCard
                      key={member.rp_id || index}
                      member={member}
                    />
                  ))}
                </ScrollView>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </View>
      )}

      <View className="h-8" />
    </View>
  ));

  const renderItem = React.useCallback(
    ({ item }: { item: Record<string, any> }) => <Details item={item} />,
    []
  );

  if (loadingFam || loadingPersonalInfo) {
    return <LoadingState />;
  }

  // ================ MAIN RENDER ================
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
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        windowSize={1}
        removeClippedSubviews
        data={[{ ...personalInfo, members: members }]}
        renderItem={renderItem}
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
      />
    </PageLayout>
  );
}
