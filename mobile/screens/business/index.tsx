import React from "react"
import { ScrollView, TouchableOpacity, View, Text } from "react-native"
import PageLayout from "../_PageLayout"
import { router } from "expo-router"
import { Building } from "@/lib/icons/Building"
import { Plus } from "@/lib/icons/Plus"
import { ChevronRight } from "@/lib/icons/ChevronRight"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { Button } from "@/components/ui/button"
import { FileText } from "@/lib/icons/FileText"


export default () => {
  // Replace with your actual state management
  const [businesses, setBusinesses] = React.useState([])
  const hasBusinesses = businesses.length > 0

  const handleAddBusiness = () => {

  }

  const handleBusinessPress = (businessId: number) => {

  }

  const EmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-6">
        <Building size={32} className="text-primaryBlue" />
      </View>
      
      <Text className="text-gray-900 text-xl font-semibold mb-2 text-center">
        No businesses yet
      </Text>
      
      <Text className="text-gray-500 text-base text-center mb-8 leading-6">
        Start by adding your first business or request for a document if you don't have your business permit yet.
      </Text>
      
      <View className="flex gap-4">
        <Button
          onPress={() => router.push('/(business)/add-business')}
          className="bg-primaryBlue px-8 py-4 rounded-xl flex-row items-center"
        >
          <Plus size={20} className="text-white mr-2" />
          <Text className="text-white font-semibold text-sm">
            Add Your First Business
          </Text>
        </Button>
        <Button
          className="bg-primaryBlue px-8 py-4 rounded-xl flex-row items-center"
        >
          <FileText size={20} className="text-white mr-2" />
          <Text className="text-white font-semibold text-sm">
            Request for a Document
          </Text>
        </Button>
      </View>
    </View>
  )

  const BusinessCard = ({ business } : { business: Record<string, any>}) => (
    <TouchableOpacity
      onPress={() => handleBusinessPress(business.id)}
      className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 rounded-lg bg-blue-50 items-center justify-center mr-3">
              <Building size={20} className="text-blue-500" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base">
                {business.name}
              </Text>
              <Text className="text-gray-500 text-sm">
                {business.type}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <Text className="text-gray-600 text-sm">
                {business.status}
              </Text>
            </View>
            <Text className="text-gray-900 font-medium text-sm">
              {business.revenue}
            </Text>
          </View>
        </View>
        
        <ChevronRight size={20} className="text-gray-400 ml-3" />
      </View>
    </TouchableOpacity>
  )

  const BusinessList = () => (
    <View className="flex-1">
      <View className="px-5">
        <Text className="text-gray-900 font-semibold text-lg mb-1">
          Your Businesses
        </Text>
        <Text className="text-gray-500 text-sm">
          Manage and track your business records
        </Text>
      </View>
      
      <View className="px-5">
        {businesses.map((business, index) => (
          <BusinessCard key={index} business={business} />
        ))}
      </View>
    </View>
  )

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
      headerTitle={<Text className="text-gray-900 text-[13px]">My Business</Text>}
      rightAction={
        hasBusinesses ? (
          <TouchableOpacity
            onPress={() => router.push('/(business)/add-business')}
            className="w-10 h-10 rounded-full bg-primaryBlue items-center justify-center"
          >
            <Plus size={24} className="text-white" />
          </TouchableOpacity>
        ) : (
          <View className="w-10 h-10" />
        )
      }
    >
      <ScrollView className="flex-1">
        {hasBusinesses ? <BusinessList /> : <EmptyState />}
      </ScrollView>
    </PageLayout>
  )
}