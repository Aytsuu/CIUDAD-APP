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
import PageLayout from "../../../../_PageLayout";
import {
  useGetFamilyMembers,
} from "../../../../profiling/queries/profilingGetQueries";
import { useGetResidentPersonalInfo } from "../queries/healthProfilingQueries";
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
  } = useGetResidentPersonalInfo(resident?.rp_id);
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
    <View className="flex-row items-center justify-between py-3.5">
      <Text className="text-gray-600 text-xs font-medium uppercase tracking-wide flex-1">
        {label}
      </Text>
      <Text className="text-gray-900 text-sm font-semibold flex-[2] text-right">
        {value}
      </Text>
    </View>
  );

  const FamilyMemberCard = ({ member }: { member: any }) => (
    <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base mb-1">
            {member.name}
          </Text>
          <View className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 self-start">
            <Text className="text-blue-700 text-xs font-medium">
              {member.fc_role}
            </Text>
          </View>
        </View>
        <View className="bg-gray-100 rounded-lg px-3 py-1.5">
          <Text className="text-gray-700 text-xs font-mono font-medium">
            {member.rp_id}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-3 pt-2 border-t border-gray-100">
        <View className="flex-1">
          <Text className="text-gray-500 text-xs mb-0.5">Gender</Text>
          <Text className="text-gray-900 text-sm font-medium">{member.sex}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-xs mb-0.5">Status</Text>
          <Text className="text-gray-900 text-sm font-medium">{member.status}</Text>
        </View>
        {member.dob && (
          <View className="flex-1">
            <Text className="text-gray-500 text-xs mb-0.5">DOB</Text>
            <Text className="text-gray-900 text-sm font-medium">{member.dob}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const formatAddress = (address: any) => {
    const parts = [
      address.add_street,
      address.sitio ? "SITIO " + capitalize(address.sitio) : "",
      address.add_external_sitio,
      address.add_barangay,
      address.add_city,
      address.add_province,
    ].filter((part) => part && part.trim() !== "");

    return parts.join(", ");
  };

  const AddressCard = ({ address, index }: { address: any; index: number }) => (
    <View className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 mb-3">
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
          <Text className="text-blue-600 text-xs font-bold">{index + 1}</Text>
        </View>
        <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wide">
          Address
        </Text>
      </View>
      <Text className="text-gray-900 text-sm leading-6 font-medium">
        {formatAddress(address)}
      </Text>
    </View>
  );

  const RenderDetails = React.memo(() => (
    <View className="flex-1 bg-gray-50">
      {/* Profile Header Card */}
      <View className="mx-4 mt-4 mb-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <Text className="text-gray-900 font-bold text-2xl mb-2">
          {fullName}
        </Text>
        <View className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 self-start">
          <Text className="text-blue-700 text-xs font-semibold">
            ID: {resident.rp_id}
          </Text>
        </View>
      </View>

      {/* Basic Information Card */}
      {loadingPersonalInfo ? (
        <View className="mx-4 mb-3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-1 h-6 bg-blue-500 rounded-full mr-3" />
            <Text className="text-gray-900 font-bold text-base">
              Basic Information
            </Text>
          </View>
          <View className="items-center py-8">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="text-gray-500 text-xs mt-3">Loading...</Text>
          </View>
        </View>
      ) : (
        <View className="mx-4 mb-3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-1 h-6 bg-blue-500 rounded-full mr-3" />
            <Text className="text-gray-900 font-bold text-base">
              Basic Information
            </Text>
          </View>
          <InfoRow
            label="Age"
            value={`${personalInfo?.per_age || "N/A"} years old`}
          />
          <View className="h-px bg-gray-100 my-1" />
          <InfoRow label="Gender" value={personalInfo?.per_sex || "N/A"} />
          {personalInfo?.per_status && (
            <>
              <View className="h-px bg-gray-100 my-1" />
              <InfoRow label="Civil Status" value={personalInfo.per_status} />
            </>
          )}
          {personalInfo?.per_dob && (
            <>
              <View className="h-px bg-gray-100 my-1" />
              <InfoRow label="Birth Date" value={personalInfo.per_dob} />
            </>
          )}
          {personalInfo?.per_add_bloodType && (
            <>
              <View className="h-px bg-gray-100 my-1" />
              <InfoRow label="Blood Type" value={personalInfo.per_add_bloodType} />
            </>
          )}
          {personalInfo?.per_add_philhealth_id && (
            <>
              <View className="h-px bg-gray-100 my-1" />
              <InfoRow label="PhilHealth ID" value={personalInfo.per_add_philhealth_id} />
            </>
          )}
          {personalInfo?.per_add_covid_vax_status && (
            <>
              <View className="h-px bg-gray-100 my-1" />
              <InfoRow label="COVID Vax Status" value={personalInfo.per_add_covid_vax_status} />
            </>
          )}
        </View>
      )}

      {/* Contact Information Card */}
      {(personalInfo?.per_contact ||
        (personalInfo?.per_addresses &&
          personalInfo.per_addresses.length > 0)) && (
        <View className="mx-4 mb-3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-1 h-6 bg-green-500 rounded-full mr-3" />
            <Text className="text-gray-900 font-bold text-base">
              Contact Information
            </Text>
          </View>
          {personalInfo.per_contact && (
            <>
              <InfoRow label="Phone Number" value={personalInfo.per_contact} />
              {personalInfo?.per_addresses && personalInfo.per_addresses.length > 0 && (
                <View className="h-px bg-gray-100 my-3" />
              )}
            </>
          )}
          {personalInfo?.per_addresses &&
            personalInfo.per_addresses.length > 0 && (
              <View>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wide">
                    {personalInfo.per_addresses.length === 1
                      ? "Address"
                      : "Addresses"}
                  </Text>
                  {personalInfo.per_addresses.length > 1 && (
                    <View className="bg-blue-100 rounded-full px-2.5 py-1">
                      <Text className="text-blue-700 text-xs font-bold">
                        {personalInfo.per_addresses.length}
                      </Text>
                    </View>
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

      {/* Additional Information Card */}
      <View className="mx-4 mb-3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <View className="flex-row items-center mb-4">
          <View className="w-1 h-6 bg-purple-500 rounded-full mr-3" />
          <Text className="text-gray-900 font-bold text-base">
            Additional Information
          </Text>
        </View>
        {resident.family_no && (
          <>
            <InfoRow label="Family ID" value={resident.family_no} />
            <View className="h-px bg-gray-100 my-1" />
          </>
        )}
        {resident.household_no && (
          <>
            <InfoRow label="Household ID" value={resident.household_no} />
            <View className="h-px bg-gray-100 my-1" />
          </>
        )}
        {resident.rp_date_registered && (
          <InfoRow label="Date Registered" value={resident.rp_date_registered} />
        )}
      </View>

      {/* Family Members Accordion Card */}
      {members.length > 0 && (
        <View className="mx-4 mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Accordion type="single" className="border-0">
            <AccordionItem value="family-members" className="border-0">
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 active:bg-gray-100">
                <View className="flex-row items-center justify-between flex-1 mr-2">
                  <View className="flex-row items-center flex-1">
                    <View className="w-1 h-6 bg-orange-500 rounded-full mr-3" />
                    <Text className="text-gray-900 font-bold text-base">
                      Family Members
                    </Text>
                  </View>
                  {!loadingFam && totalCount > 0 && (
                    <View className="bg-orange-100 rounded-full px-3 py-1.5 ml-2">
                      <Text className="text-orange-700 text-xs font-bold">
                        {totalCount}
                      </Text>
                    </View>
                  )}
                </View>
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-2 pb-6 bg-gray-50">
                {loadingFam ? (
                  <View className="items-center py-12">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text className="text-gray-500 text-xs mt-3">
                      Loading family members...
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
                  <View className="items-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-3">
                      <UsersRound size={24} className="text-gray-400" />
                    </View>
                    <Text className="text-gray-500 text-sm font-medium">
                      No family members found
                    </Text>
                  </View>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </View>
      )}

      <View className="h-6" />
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
