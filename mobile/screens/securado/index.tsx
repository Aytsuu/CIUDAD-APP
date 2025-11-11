import { ScrollView, TouchableOpacity, Text } from "react-native"
import PageLayout from "../_PageLayout"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { Search } from "@/lib/icons/Search"
import { router } from "expo-router"
import React from "react"

export default () => {
  const [showSearch, setShowSearch] = React.useState<boolean>(false);

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
          Securado
        </Text>
      }
      rightAction={
        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <ScrollView>
        
      </ScrollView>
    </PageLayout>
  )
}