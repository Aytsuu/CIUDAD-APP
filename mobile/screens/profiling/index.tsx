import { Text, View, TouchableOpacity } from "react-native"
import ScreenLayout from "../_ScreenLayout"
import { ChevronRight } from "@/lib/icons/ChevronRight"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { useRouter } from "expo-router"
import { useGetCardAnalytics } from "./queries/profilingGetQueries"
import { UsersRound } from "@/lib/icons/UsersRound"
import { UserRound } from "@/lib/icons/UserRound"
import { Home } from "@/lib/icons/Home"
import { Building } from "@/lib/icons/Building"
import { Store } from "@/lib/icons/Store"

export default () => {
  const router = useRouter();
  const { data: cardAnalytics, isLoading } = useGetCardAnalytics();

  const menuItems = [
    {
      id: 'resident',
      title: 'Resident Records',
      description: 'Individual resident information and demographics',
      icon: UserRound,
      onPress: () => {
        router.push('/(profiling)/resident-records');
      }
    },
    {
      id: 'family',
      title: 'Family Records',
      description: 'Family compositions and relationships',
      icon: UsersRound,
      onPress: () => {
        router.push('/(profiling)/family-records');
      }
    },
    {
      id: 'household',
      title: 'Household Records',
      description: 'Housing information and living conditions',
      icon: Building,
      onPress: () => {
        router.push('/(profiling)/household-records');
      }
    },
    {
      id: 'business',
      title: 'Business Records',
      description: 'Local businesses and economic activities',
      icon: Store,
      onPress: () => {
        router.push('/(profiling)/business-records');
      }
    }
  ]

  const MenuItem = ({ item, index } : {item: any, index: number}) => {
    const IconComponent = item.icon
    
    return (
      <TouchableOpacity
        onPress={item.onPress}
        className={`bg-white px-4 py-4 border-l-4 border-blue-500`}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 gap-4">
            <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-4">
              <IconComponent color="gray" />
            </View>
            
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {item.title}
                </Text>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-sm font-medium text-blue-800">
                    {!isLoading && cardAnalytics[index]}
                  </Text>
                </View>
              </View>
              
              <Text className="text-sm text-gray-600 mb-2 leading-5">
                {item.description}
              </Text>
            </View>
          </View>
          
          <View className="ml-3">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <ScreenLayout
      customLeftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerBetweenAction={
        <View className="items-center">
          <Text className="text-[13px] text-gray-900">
            Barangay Profiling
          </Text>
        </View>
      }
      customRightAction={<View className="w-10 h-10"/>}
    >
      <View className="flex-1 bg-gray-50">
        {/* Summary Header */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm border border-gray-200">
          <Text className="text-base font-medium text-gray-900 mb-2">
            Profile Overview
          </Text>
          <Text className="text-sm text-gray-600 leading-5">
            Monitor barangay demographic records. Select a category below to view records.
          </Text>
        </View>

        {/* Menu Items */}
        <View className="mx-4 mt-4 rounded-lg shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <MenuItem 
              key={item.id} 
              item={item} 
              index={index}
            />
          ))}
        </View>
      </View>
    </ScreenLayout>
  )
}