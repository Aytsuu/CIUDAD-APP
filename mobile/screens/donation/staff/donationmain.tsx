"use client"

import { useState, useMemo } from "react"
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, ScrollView, RefreshControl  } from "react-native"
import { Search, Plus, Eye, ArrowLeft, ChevronLeft } from "lucide-react-native"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetDonations, type Donation } from "./queries"
import { useRouter } from "expo-router"
import ScreenLayout from "../../_ScreenLayout"

const DonationTracker = () => {
  const router = useRouter()
  const { data: donations = [], isLoading, refetch } = useGetDonations()
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  // Use useMemo to prevent re-rendering issues with search
  const filteredData = useMemo(() => {
    return donations.filter((donation: Donation) => {
      const searchableText = [
        donation.don_num?.toString(),
        donation.don_donor,
        donation.don_item_name,
        donation.don_category,
        donation.don_qty,
        donation.don_date,
      ]
        .join(" ")
        .toLowerCase()
      return searchableText.includes(searchTerm.toLowerCase())
    })
  }, [donations, searchTerm])

  const handleAddDonation = () => {
    console.log("Navigating to add donation...")
    try {
      router.push("/donation/staffDonationAdd")
    } catch (error) {
      console.error("Navigation error:", error)
    }
  }

  const handleViewDonation = (donationNum: number) => {
    console.log("Navigating to view donation:", donationNum)
    try {
      router.push({
        pathname: "/donation/staffDonationView",
        params: { don_num: donationNum.toString() },
      })
    } catch (error) {
      console.error("Navigation error:", error)
    }
  }

  
    

  return (
    <ScreenLayout
      customLeftAction={
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={30} color="black" className="text-black" />
          </TouchableOpacity>
        }
        headerBetweenAction={<Text className="text-[13px]">Donation Records</Text>}
        showExitButton={false}
        headerAlign="left"
        scrollable={false}
        keyboardAvoiding={true}
        contentPadding="medium"
      loading={isLoading}
      loadingMessage="Loading donations..."
    >
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="mb-4" onStartShouldSetResponder={() => true}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 shadow-sm flex-1 mr-2">
              <TextInput
                placeholder="Search donations..."
                className="flex-1 text-sm text-gray-800"
                placeholderTextColor="#666"
                value={searchTerm}
                onChangeText={setSearchTerm}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
                blurOnSubmit={false}
              />
              <Search size={18} color="#666" />
            </View>
            <TouchableOpacity className="bg-blue-500 rounded-full p-3" onPress={handleAddDonation}>
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

          {filteredData.map((donation: Donation, index: number) => (
            <TouchableOpacity
              key={donation.don_num}
              onPress={() => handleViewDonation(donation.don_num)}
              accessibilityLabel={`View details for ${donation.don_item_name}`}
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <Card className={`bg-[#07143F] border-gray-200 ${index === filteredData.length - 1 ? "mb-0" : "mb-4"}`}>
                <CardHeader className="pb-3">
                  <View className="flex-row items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-white flex-1 pr-2">
                      {donation.don_item_name}
                    </CardTitle>
                    <TouchableOpacity
                      className="p-2 -m-2"
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => handleViewDonation(donation.don_num)}
                    >
                    </TouchableOpacity>
                  </View>
                </CardHeader>

                <CardContent className="pt-0">
                  <Text className="text-sm text-white leading-5 mb-4">Donor: {donation.don_donor}</Text>
                  <View className="border-t border-gray-200 pt-3">
                    <Text className="text-sm font-medium text-white">Category: {donation.don_category}</Text>
                    <Text className="text-sm font-medium text-white">Quantity: {donation.don_qty}</Text>
                    <Text className="text-sm font-medium text-white">Date: {donation.don_date}</Text>
                    <Text className="text-sm font-medium text-white">Reference No: {donation.don_num}</Text>
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          ))}

          {/* Empty state */}
          {filteredData.length === 0 && (
            <View className="flex-1 justify-center items-center py-12">
              <Text className="text-gray-500 text-center">No donation records found</Text>
            </View>
          )}
          </ScrollView>
    </ScreenLayout>
  )
}

export default DonationTracker
