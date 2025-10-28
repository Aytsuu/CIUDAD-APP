import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { Download } from "@/lib/icons/Download";
import { Eye } from "@/lib/icons/Eye";
import PageLayout from "@/screens/_PageLayout";
import { formatDate } from "@/helpers/dateHelpers";
import { formatCurrency } from "@/helpers/currencyFormat";
import { useBusinessInfo } from "@/screens/business/queries/businessGetQueries";


import { LoadingState } from "@/components/ui/loading-state";
import ImageCarousel from "@/components/ui/imageCarousel";

export default function BusinessDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const business = React.useMemo(() => {
    try {
      return JSON.parse(params.business as string);
    } catch (error) {
      return null;
    }
  }, [params.business]);

  const {
    data: businessInfo,
    isLoading: loadingBusInfo,
    error,
    refetch: refetchBusiness,
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

  const DocumentCard = ({ item, index }: { item: any; index: number }) => (
    <View className="py-3 border-b border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text
            className="text-gray-900 font-medium text-sm mb-1"
            numberOfLines={1}
          >
            {item.name || `Document ${index + 1}`}
          </Text>
          <Text className="text-gray-500 text-xs">
            {item.type || "Unknown type"}
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

  const formatRegisteredBy = (info: string) => {
    const infoArray = info?.split("-");
    const staff_name = infoArray[1];
    const staff_type = infoArray[2];
    return (
      <View className="py-3 border-b border-gray-100">
        <Text className="text-gray-500 text-xs mb-1">Registered By</Text>
        <View className="flex-row justify-between">
          <Text className="text-gray-700 text-sm leading-5">{staff_name}</Text>
          <View className="px-4 bg-green-500 flex-row items-center rounded-full">
            <Text className="text-white text-xs">{staff_type}</Text>
          </View>
        </View>
      </View>
    );
  };

  const Details = React.memo(({ item }: { item: Record<string, any> }) => {
    const fullName = item
      ? `${item?.rp ? item.rp.per_lname : item?.br?.br_lname}, ` +
        `${item?.rp ? item.rp.per_fname : item?.br?.br_fname} ` +
        `${item?.rp ? item.rp.per_mname : item?.br?.br_mname || ""}`
      : "";

    const contact = item?.rp ? item.rp.per_contact : item?.br?.br_contact;
    const respondentId = item?.rp ? business.rp : item?.br?.br_id;
    const businessName = business?.bus_name || "Unnamed Business";
    const businessAddress = item ? item?.bus_location : "";
    const registeredDate = item
      ? formatDate(item?.bus_date_registered, "long")
      : "";
    const registeredBy = item?.bus_registered_by || "N/A";
    const businessFiles = item?.files || [];

    return (
      <View className="px-6">
        {/* Business Header */}
        <View className="pt-4 pb-6 border-b border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-2">
            {businessName}
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="bg-primaryBlue px-3 py-1 rounded-full">
              <Text className="text-white text-xs">{business?.bus_id}</Text>
            </View>
          </View>
        </View>

        {/* Respondent Information */}
        <View className="py-4">
          <Text className="text-gray-900 font-medium text-sm mb-3">
            Respondent Information
          </Text>
          <InfoRow label="Full Name" value={fullName || "N/A"} />
          <InfoRow label="Record ID" value={respondentId || "N/A"} />
          <View className="py-3">
            <Text className="text-gray-500 text-xs mb-1">Contact Number</Text>
            <Text className="text-gray-900 text-sm">{contact || "N/A"}</Text>
          </View>
        </View>

        {/* Business Overview */}
        <View className="py-4">
          <Text className="text-gray-900 font-medium text-sm mb-3">
            Business Overview
          </Text>
          <InfoRow label="Address" value={businessAddress || "Not specified"} />
          {registeredDate && (
            <View className="py-3 border-b border-gray-100">
              <Text className="text-gray-500 text-xs mb-1">
                Date Registered
              </Text>
              <Text className="text-gray-900 text-sm">{registeredDate}</Text>
            </View>
          )}
          {registeredBy && formatRegisteredBy(registeredBy)}
        </View>

        {/* Financial Information */}
        <View className="py-4">
          <Text className="text-gray-900 font-medium text-sm mb-3">
            Financial Information
          </Text>
          <View className="py-3 border-b border-gray-100">
            <Text className="text-gray-500 text-xs mb-1">Gross Sales</Text>
            <Text className="text-green-600 text-sm font-medium">
              {formatCurrency(business?.bus_gross_sales)}
            </Text>
          </View>
        </View>

        {/* Documents */}
        {businessFiles.length > 0 && (
          <View>
            <View className="flex-row gap-2 items-center mb-4">
              <Text className="text-gray-900 font-medium text-sm">
                Documents
              </Text>
              {businessFiles.length > 0 && (
                <Text className="text-gray-500 text-xs">
                  ({businessFiles.length})
                </Text>
              )}
            </View>
            <ImageCarousel images={businessFiles} />
            {/* <Accordion type="single" className="border-0">
              <AccordionItem value="business-documents" className="border-0">
                <AccordionTrigger className="py-3">
                  <View className="flex-row justify-between items-center flex-1 mr-2">
                    <Text className="text-gray-900 font-medium text-sm">
                      Documents
                    </Text>
                    {businessFiles.length > 0 && (
                      <Text className="text-gray-500 text-xs">
                        {businessFiles.length}
                      </Text>
                    )}
                  </View>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {businessFiles.length > 0 ? (
                    <ScrollView
                      className="max-h-96"
                      showsVerticalScrollIndicator={false}
                      overScrollMode="never"
                      nestedScrollEnabled={true}
                    >
                      {businessFiles.map((file: any, index: number) => (
                        <DocumentCard
                          key={`doc-${index}`}
                          item={file}
                          index={index}
                        />
                      ))}
                    </ScrollView>
                  ) : (
                    <View className="items-center py-8">
                      <Text className="text-gray-400 text-xs">
                        No documents found
                      </Text>
                    </View>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion> */}
          </View>
        )}
      </View>
    );
  });

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
          <Text className="text-gray-900 text-[13px]">Business</Text>
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

  if (loadingBusInfo) {
    return <LoadingState />;
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
      headerTitle={<Text className="text-gray-900 text-[13px]">Business</Text>}
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
        data={[businessInfo]}
        renderItem={({ item }) => <Details item={item} />}
        keyExtractor={(item, index) => `business-${index}`}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              refetchBusiness();
            }}
            colors={["#0084f0"]}
          />
        }
      />
    </PageLayout>
  );
}
