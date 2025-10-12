import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import PageLayout from "@/screens/_PageLayout"
import { router } from "expo-router"
import { TouchableOpacity, View, Text, ScrollView } from "react-native"
import { useGetOwnedHouses } from "./queries/accountGetQueries"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingState } from "@/components/ui/loading-state"
import { formatDate } from "@/helpers/dateHelpers"

export default () => {
  const { user } = useAuth();
  const {data: ownedHouses, isLoading} = useGetOwnedHouses(user?.rp as string);
  
  if(isLoading) {
    return <LoadingState />
  }
  
  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-black text-[13px]">Houses Owned</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1 px-4 pt-3">
        {ownedHouses?.map((house: any) => (
          <View 
            key={house.hh_id}
            className="bg-white rounded-lg px-3 py-2.5 mb-2 border border-gray-200"
          >
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-sm font-semibold text-gray-900">
                {house.hh_id}
              </Text>
              <Text className="text-xs text-gray-600">
                {house.total_families} {house.total_families === 1 ? 'family' : 'families'}
              </Text>
            </View>
            
            <Text className="text-xs text-gray-700 mb-0.5">
              {house.street}, {house.sitio}
            </Text>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-500">
                NHTS: {house.nhts}
              </Text>
              <Text className="text-xs text-gray-500">
                {formatDate(house.date_registered, "short")}
              </Text>
            </View>
          </View>
        ))}
        
        {ownedHouses?.length === 0 && (
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500 text-sm">No houses owned yet</Text>
          </View>
        )}
      </ScrollView>
    </PageLayout>
  )
} 