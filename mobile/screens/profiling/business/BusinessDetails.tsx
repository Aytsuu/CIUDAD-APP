import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { FileText } from "@/lib/icons/FileText";
import { Download } from "@/lib/icons/Download";
import { Eye } from "@/lib/icons/Eye";
import PageLayout from "@/screens/_PageLayout";
import { formatDate } from "@/helpers/dateHelpers";
import { formatCurrency } from "@/helpers/currencyFormat";
import { useBusinessInfo } from "@/screens/business/queries/businessGetQueries";

// Loading Section Component
const LoadingSection = ({ title }: { title: string }) => (
  <View className="px-5 py-5 border-b border-gray-200">
    <Text className="text-gray-900 font-medium text-sm mb-4">{title}</Text>
    <View className="items-center py-6">
      <ActivityIndicator size="small" color="#3B82F6" />
      <Text className="text-gray-500 text-xs mt-2">Loading...</Text>
    </View>
  </View>
);

export default function BusinessDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const business = React.useMemo(() => {
    try {
      return JSON.parse(params.business as string);
    } catch (error) {
      console.error("Error parsing business data:", error);
      return null;
    }
  }, [params.business]);

  const {
    data: businessInfo,
    isLoading: loadingBusInfo,
    error,
  } = useBusinessInfo(business?.bus_id);

  const InfoRow = ({
    label,
    value,
    valueColor = "text-gray-900",
  }: {
    label: string;
    value: string | number;
    valueColor?: string;
  }) => (
    <View className="py-3 border-b border-gray-100">
      <Text className="text-gray-500 text-xs mb-1">{label}</Text>
      <Text className={`text-sm ${valueColor}`}>{value}</Text>
    </View>
  );

  // Show error state
  if (error) {
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
            Business Details
          </Text>
        }
        rightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-red-600 text-base font-semibold mb-2">
            Error Loading Business
          </Text>
          <Text className="text-gray-600 text-sm text-center mb-6">
            Unable to load business information. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white text-sm font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  // Prepare data when available
  const fullName = businessInfo
    ? `${
        businessInfo?.rp
          ? businessInfo.rp.per_lname
          : businessInfo?.br?.br_lname
      }, ` +
      `${
        businessInfo?.rp
          ? businessInfo.rp.per_fname
          : businessInfo?.br?.br_fname
      } ` +
      `${
        businessInfo?.rp
          ? businessInfo.rp.per_mname
          : businessInfo?.br?.br_mname || ""
      }`
    : "";

  const contact = businessInfo?.rp
    ? businessInfo.rp.per_contact
    : businessInfo?.br?.br_contact;
  const respondentId = businessInfo?.rp ? business.rp : businessInfo?.br?.br_id;
  const businessName = business?.bus_name || "Unnamed Business";
  const businessAddress = businessInfo ? businessInfo?.bus_location : "";
  const registeredDate = businessInfo
    ? formatDate(businessInfo?.bus_date_registered, "long")
    : "";
  const registeredBy = businessInfo?.bus_registered_by || "N/A";
  const businessFiles = businessInfo?.files || [];

  const renderDocumentCard = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    return (
      <View className="py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text
              className="text-gray-900 font-medium text-sm mb-1"
              numberOfLines={1}
            >
              {item.name || `Document ${index + 1}`}
            </Text>
            <Text className="text-gray-500 text-xs">
              {item.type || "Unknown type"} • {item.size || "Unknown size"}
            </Text>
          </View>
          <View className="flex-row items-center ml-3">
            <TouchableOpacity className="p-2">
              <Eye size={18} className="text-gray-600" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2">
              <Download size={18} className="text-gray-600" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
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
        <Text className="text-gray-900 text-[13px]">Business</Text>
      }
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView
        className="flex-1"
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Business Header */}
        <View className="px-5 pt-6 pb-6 border-b border-gray-200">
          <Text className="text-gray-900 font-semibold text-lg mb-2">
            {businessName}
          </Text>
          <Text className="text-gray-600 text-sm">ID: {business?.bus_id}</Text>
        </View>

        {/* Respondent Information */}
        {loadingBusInfo ? (
          <LoadingSection title="Respondent Information" />
        ) : (
          <View className="px-5 py-5 border-b border-gray-200">
            <Text className="text-gray-900 font-medium text-sm mb-4">
              Respondent Information
            </Text>
            <InfoRow label="Full Name" value={fullName || "N/A"} />
            <InfoRow label="Record ID" value={respondentId || "N/A"} />
            <View className="py-3">
              <Text className="text-gray-500 text-xs mb-1">Contact Number</Text>
              <Text className="text-gray-900 text-sm">{contact || "N/A"}</Text>
            </View>
          </View>
        )}

        {/* Business Overview */}
        {loadingBusInfo ? (
          <LoadingSection title="Business Overview" />
        ) : (
          <View className="px-5 py-5 border-b border-gray-200">
            <Text className="text-gray-900 font-medium text-sm mb-4">
              Business Overview
            </Text>
            <InfoRow
              label="Address"
              value={businessAddress || "Not specified"}
            />
            <InfoRow
              label="Date Registered"
              value={(registeredDate as string) || "N/A"}
            />
            <View className="py-3">
              <Text className="text-gray-500 text-xs mb-1">Registered By</Text>
              <Text className="text-gray-900 text-sm">{registeredBy}</Text>
            </View>
          </View>
        )}

        {/* Financial Information */}
        {loadingBusInfo ? (
          <LoadingSection title="Financial Information" />
        ) : (
          <View className="px-5 py-5 border-b border-gray-200">
            <Text className="text-gray-900 font-medium text-sm mb-4">
              Financial Information
            </Text>
            <View className="py-3">
              <Text className="text-gray-500 text-xs mb-1">Gross Sales</Text>
              <Text className="text-green-600 text-sm font-medium">
                {formatCurrency(business?.bus_gross_sales)}
              </Text>
            </View>
          </View>
        )}

        {/* Documents */}
        {loadingBusInfo ? (
          <LoadingSection title="Documents" />
        ) : (
          businessFiles.length > 0 && (
            <View className="px-5 py-5">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-900 font-medium text-sm">
                  Documents
                </Text>
                <Text className="text-gray-500 text-xs">
                  {businessFiles.length}
                </Text>
              </View>

              <FlatList
                overScrollMode="never"
                maxToRenderPerBatch={1}
                data={businessFiles}
                renderItem={renderDocumentCard}
                keyExtractor={(item, index) => `doc-${index}`}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )
        )}

        <View className="h-8" />
      </ScrollView>
    </PageLayout>
  );
}
