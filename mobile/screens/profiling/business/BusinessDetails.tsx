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
import { Card } from "@/components/ui/card";
import { Calendar } from "@/lib/icons/Calendar";
import { MapPin } from "@/lib/icons/MapPin";
import { UserRound } from "@/lib/icons/UserRound";
import { Phone } from "@/lib/icons/Phone";
import { FileText } from "@/lib/icons/FileText";
import { Download } from "@/lib/icons/Download";
import { Eye } from "@/lib/icons/Eye";
import PageLayout from "@/screens/_PageLayout";
import { formatDate } from "@/helpers/dateHelpers";
import { formatCurrency } from "@/helpers/currencyFormat";
import { CreditCard } from "lucide-react-native";
import { useBusinessInfo } from "@/screens/business/queries/businessGetQueries";

// Loading Card Component
const LoadingCard = ({ title, message }: { title: string, message: string }) => (
  <Card className="mt-4 p-4">
    <Text className="text-gray-900 font-semibold text-lg mb-4">
      {title}
    </Text>
    <View className="flex-1 justify-center items-center py-8">
      <ActivityIndicator size="small" color="#3B82F6" />
      <Text className="text-gray-500 mt-2 text-sm">{message}</Text>
    </View>
  </Card>
);

export default function BusinessDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the business data from params
  const business = React.useMemo(() => {
    try {
      return JSON.parse(params.business as string);
    } catch (error) {
      console.error('Error parsing business data:', error);
      return null;
    }
  }, [params.business]);

  const { data: businessInfo, isLoading: loadingBusInfo, error } = useBusinessInfo(business?.bus_id);

  const InfoRow = ({ icon: Icon, label, value, valueColor = "text-gray-900", onPress }: {
    icon?: any,
    label: string,
    value: string | number,
    valueColor?: string,
    onPress?: () => void
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center py-3 border-t border-gray-100"
    >
      {Icon && <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
        <Icon size={18} className="text-gray-600" />
      </View>}
      <View className="flex-1">
        <Text className="text-gray-500 text-sm">{label}</Text>
        <Text className={`text-base font-medium ${valueColor} ${onPress ? 'text-blue-600' : ''}`}>
          {value}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Show error state
  if (error) {
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
          <Text className="text-gray-900 text-[13px]">
            Business Details
          </Text>
        }
        rightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-red-600 text-lg font-semibold mb-2">Error Loading Business</Text>
          <Text className="text-gray-600 text-center mb-4">
            Unable to load business information. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  // Prepare data when available
  const fullName = businessInfo ? 
    `${businessInfo?.rp ? businessInfo.rp.per_lname : businessInfo?.br?.br_lname}, ` +
    `${businessInfo?.rp ? businessInfo.rp.per_fname : businessInfo?.br?.br_fname} ` +
    `${businessInfo?.rp ? businessInfo.rp.per_mname : businessInfo?.br?.br_mname || ''}` : '';
  
  const contact = businessInfo?.rp ? businessInfo.rp.per_contact : businessInfo?.br?.br_contact;
  const respondentId = businessInfo?.rp ? business.rp : businessInfo?.br?.br_id;
  const businessName = business?.bus_name || 'Unnamed Business';
  const businessAddress = businessInfo ? `${businessInfo?.bus_street || ''}, Sitio ${businessInfo?.sitio || ''}` : '';
  const registeredDate = businessInfo ? formatDate(businessInfo?.bus_date_registered, 'long') : '';
  const registeredBy = businessInfo?.bus_registered_by || 'N/A';
  const businessFiles = businessInfo?.files || [];

  const renderDocumentCard = ({ item, index }: { item: any; index: number }) => {
    return (
      <TouchableOpacity
        className="mb-3"
        activeOpacity={0.7}
      >
        <Card className="p-3 bg-gray-50 border border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <FileText size={18} className="text-blue-600" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-medium text-sm" numberOfLines={1}>
                  {item.name || `Document ${index + 1}`}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {item.type || 'Unknown type'} • {item.size || 'Unknown size'}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity className="p-2">
                <Eye size={16} className="text-gray-600" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2 ml-1">
                <Download size={16} className="text-gray-600" />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
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
        <Text className="text-gray-900 text-[13px]">
          Business Details
        </Text>
      }
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView 
        className="flex-1 px-5"
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Business Header */}
        <View className="pb-6">
          <View className="items-center">
            <Text className="text-gray-900 font-bold text-xl text-center mb-2">
              {businessName}
            </Text>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-600 font-medium text-sm">
                ID: {business?.bus_id}
              </Text>
            </View>
          </View>
        </View>

        {/* Respondent Information */}
        {loadingBusInfo ? (
          <LoadingCard title="Respondent Information" message="Loading respondent information..." />
        ) : (
          <Card className="mt-4 p-4">
            <Text className="text-gray-900 font-semibold text-lg mb-4">
              Respondent Information
            </Text>
            <InfoRow icon={UserRound} label="Full Name" value={fullName || 'N/A'} />
            <InfoRow icon={CreditCard} label="Record ID" value={respondentId || 'N/A'} />
            <InfoRow icon={Phone} label="Contact Number" value={contact || 'N/A'} />
          </Card>
        )}

        {/* Business Overview */}
        {loadingBusInfo ? (
          <LoadingCard title="Business Overview" message="Loading business information..." />
        ) : (
          <Card className="mt-4 p-4">
            <Text className="text-gray-900 font-semibold text-lg mb-4">
              Business Overview
            </Text>
            <InfoRow icon={MapPin} label="Address" value={businessAddress || 'Not specified'} />
            <InfoRow icon={Calendar} label="Date Registered" value={registeredDate as string || 'N/A'} />
            <InfoRow icon={UserRound} label="Registered By" value={registeredBy} />
          </Card>
        )}

        {/* Financial Information */}
        {loadingBusInfo ? (
          <LoadingCard title="Financial Information" message="Loading business information..."/>
        ) : (
          <Card className="mt-4 p-4">
            <Text className="text-gray-900 font-semibold text-lg mb-4">
              Financial Information
            </Text>
            <InfoRow 
              label="Gross Sales" 
              value={formatCurrency(business?.bus_gross_sales)} 
              valueColor="text-green-600" 
            />
          </Card>
        )}

        {/* Documents */}
        {loadingBusInfo ? (
          <LoadingCard title="Documents" message="Loading business documents..."/>
        ) : (
          businessFiles.length > 0 && (
            <Card className="mt-4 p-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-900 font-semibold text-lg">
                  Documents
                </Text>
                <View className="bg-blue-100 px-2 py-1 rounded-full">
                  <Text className="text-blue-600 text-xs font-medium">
                    {businessFiles.length} {businessFiles.length === 1 ? 'Document' : 'Documents'}
                  </Text>
                </View>
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
            </Card>
          )
        )}
      </ScrollView>
    </PageLayout>
  );
}