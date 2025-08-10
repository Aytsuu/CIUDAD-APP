import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import PageLayout from "../_PageLayout";
import { useBusinessInfo, useModificationRequests } from "./queries/businessGetQueries";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { MapPin } from "@/lib/icons/MapPin";
import { CheckCircle } from "@/lib/icons/CheckCircle";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import LottieView from 'lottie-react-native';

export default function BusinessDetails() {
  const params = useLocalSearchParams();
  const business = React.useMemo(() => JSON.parse(params?.business as string), [params])
  const { data: modificationRequests, isLoading: isLoadingRequests } = useModificationRequests();
  const { data: businessInfo, isLoading: isLoadingBusinessInfo } = useBusinessInfo(business.bus_id)

  const modReq = React.useMemo(() => 
    modificationRequests.find((req: any) => 
      req.current_details.bus_id == business.bus_id
    )
  , [modificationRequests])

  if(isLoadingBusinessInfo || isLoadingRequests) {
    return (
      <View className="flex-1 items-center justify-center">
        <LottieView 
          source={require('@/assets/animated/loading.json')}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
      </View>
    )
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
      headerTitle={<Text className="text-gray-900 text-[13px]">{business.bus_name}</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header Card */}
        <View className="bg-primaryBlue p-5">
          <View className="flex-row items-center mb-4">
            <View className="flex-1">
              <Text className="text-gray-50 text-xs font-medium">
                Business ID: {businessInfo?.bus_id}
              </Text>
              <Text className="text-white text-2xl font-bold mt-1">
                {businessInfo?.bus_name}
              </Text>
            </View>
          </View>
        </View>
  
        {/* Business Information */}
        <View className="bg-white p-6 shadow-sm">
          <Text className="text-gray-900 text-lg font-semibold mb-4">
            Business Information
          </Text>
  
          {/* Gross Sales */}
          <View className="mb-4">
            <Text className="text-gray-500 text-sm font-medium mb-2">Gross Sales</Text>
            <Text className="text-gray-900 text-2xl font-bold">
              ₱ {businessInfo?.bus_gross_sales?.toLocaleString() || '0'}
            </Text>
          </View>
  
          {/* Location */}
          <View className="flex-row items-center gap-2 mb-2">
            <MapPin size={18} className="fill-red-500" />
            <Text className="text-gray-700 text-sm">
              {businessInfo?.bus_street}, Sitio {businessInfo?.sitio}
            </Text>
          </View>
  
          {/* Date Verified */}
          {/* Verification Status */}
          <View className="flex-row items-center gap-2">
            <CheckCircle size={18} className="fill-green-600 stroke-white"/>
            <Text className="text-green-600 text-sm">
              Verified on {new Date(businessInfo?.bus_date_verified).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        </View>
  
        {/* Action Buttons */}
        <View className="mx-4 mt-4">
          {modReq ? <></> :
            <Button className="bg-gray-100 p-4 rounded-xl mb-3"
              onPress={() => router.push({
                pathname: '/(business)/edit-business',
                params: {
                  business: JSON.stringify(businessInfo)
                }
              })}
            >
              <Text className="text-gray-700 font-semibold text-center">
                Update Business Information
              </Text>
            </Button>
          }
          
          <Button className="bg-gray-100 p-4 rounded-xl">
            <Text className="text-gray-700 font-semibold text-center">
              Request Document
            </Text>
          </Button>
        </View>
      </ScrollView>
    </PageLayout>
  )
}