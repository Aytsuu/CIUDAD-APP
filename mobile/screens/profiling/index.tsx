import { Text, View, TouchableOpacity, ScrollView } from "react-native"
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
      title: 'Residents',
      description: 'Individual records',
      icon: UserRound,
      route: '/(profiling)/resident/records'
    },
    {
      id: 'family',
      title: 'Families',
      description: 'Family compositions',
      icon: UsersRound,
      route: '/(profiling)/family/records'
    },
    {
      id: 'household',
      title: 'Households',
      description: 'Housing information',
      icon: Building,
      route: '/(profiling)/household/records'
    },
    {
      id: 'business',
      title: 'Businesses',
      description: 'Local enterprises',
      icon: Store,
      route: '/(profiling)/business/records'
    }
  ]

  const MenuCard = ({ item, index }: { item: any, index: number }) => {
    const IconComponent = item.icon
    const count = !isLoading && cardAnalytics ? cardAnalytics[index] : '...'

    return (
      <TouchableOpacity
        onPress={() => router.push(item.route)}
        className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          {/* Icon Container */}
          <View className={`w-14 h-14 bg-primaryBlue rounded-lg items-center justify-center`}>
            <IconComponent size={24} className="text-white" />
          </View>

          {/* Content */}
          <View className="flex-1 ml-4">
            <Text className="text-md font-semibold text-gray-900">
              {item.title}
            </Text>
            <Text className="text-sm text-gray-500 mb-2">
              {item.description}
            </Text>
          </View>

          {/* Arrow */}
          <View className="ml-2">
            <ChevronRight size={20} className="text-gray-400" />
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
          <Text className="text-gray-900 text-[13px]">
            Barangay Profiling
          </Text>
        </View>
      }
      customRightAction={<View className="w-10 h-10"/>}
    >
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-sm text-center text-gray-600 leading-6">
          Monitor barangay demographic records. Select a category below to view records.
        </Text> 
        <View className="mt-6 pb-6">
          {menuItems.map((item, index) => (
            <MenuCard 
              key={item.id}
              item={item}
              index={index}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenLayout>
  )
}