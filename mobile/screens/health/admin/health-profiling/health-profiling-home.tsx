import { Text, View, TouchableOpacity, ScrollView } from "react-native"
import PageLayout from "@/screens/_PageLayout"
import { useRouter } from "expo-router"
import { 
  UserRoundPlus, 
  UsersRound, 
  Building, 
  Store, 
  Plus, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react-native"
import React from "react"

function HealthProfilingHome() {
  const router = useRouter();

  const menuItems = [
    {
      id: 'register',
      title: 'Register New Resident',
      description: 'Complete resident profiling',
      icon: UserRoundPlus,
      route: '/(health)/admin/health-profiling/resident-registration',
      color: '#3B82F6'
    },
    {
      id: 'household-register',
      title: 'Register New Household',
      description: 'Register household information',
      icon: Building,
      route: '/(health)/admin/health-profiling/household-registration',
      color: '#10B981'
    },
    {
      id: 'family-profiling',
      title: 'Health Family Profiling',
      description: 'Complete family health profiling',
      icon: UsersRound,
      route: '/(health)/admin/health-profiling/family-profiling',
      color: '#8B5CF6'
    },
    // {
    //   id: 'family-records',
    //   title: 'Family Health Records',
    //   description: 'View family health profiles',
    //   icon: UsersRound,
    //   route: '/(health)/admin/health-profiling/family-records',
    //   color: '#8B5CF6'
    // },
    {
      id: 'resident',
      title: 'Residents',
      description: 'View individual records',
      icon: UserRoundPlus,
      route: '/(health)/admin/health-profiling/resident/records',
      color: '#10B981'
    },
    {
      id: 'family',
      title: 'Families',
      description: 'View family compositions',
      icon: UsersRound,
      route: '/(profiling)/family/records',
      color: '#8B5CF6'
    },
    {
      id: 'household',
      title: 'Households',
      description: 'View housing information',
      icon: Building,
      route: '/(health)/admin/health-profiling/household/records',
      color: '#F59E0B'
    },
   
  ]

  const MenuCard = ({ item }: { item: any }) => {
    const IconComponent = item.icon
    const isRegister = item.id === 'register'
    const isHouseholdRegister = item.id === 'household-register'
    const isFamilyProfiling = item.id === 'family-profiling'

    return (
      <TouchableOpacity
        onPress={() => router.push(item.route as any)}
        className={`rounded-2xl p-5 mb-4 shadow-sm ${
          isRegister ? 'bg-blue-600' : isHouseholdRegister ? 'bg-green-600' : isFamilyProfiling ? 'bg-purple-600' : 'bg-white border border-gray-200'
        }`}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          {/* Icon Container */}
          <View className={`w-16 h-16 rounded-2xl items-center justify-center ${
            isRegister || isHouseholdRegister || isFamilyProfiling ? 'bg-white/20' : 'bg-gray-100'
          }`} style={!isRegister && !isHouseholdRegister && !isFamilyProfiling ? { backgroundColor: `${item.color}15` } : {}}>
            <IconComponent 
              size={28} 
              className={isRegister || isHouseholdRegister || isFamilyProfiling ? 'text-white' : ''} 
              color={isRegister || isHouseholdRegister || isFamilyProfiling ? 'white' : item.color}
            />
          </View>

          {/* Content */}
          <View className="flex-1 ml-4">
            <Text className={`text-lg font-semibold ${
              isRegister || isHouseholdRegister || isFamilyProfiling ? 'text-white' : 'text-gray-900'
            }`}>
              {item.title}
            </Text>
            <Text className={`text-sm mt-1 ${
              isRegister || isHouseholdRegister || isFamilyProfiling ? 'text-white/90' : 'text-gray-500'
            }`}>
              {item.description}
            </Text>
          </View>

          {/* Arrow or Plus Icon */}
          <View className="ml-2">
            {isRegister || isHouseholdRegister || isFamilyProfiling ? (
              <Plus size={24} className="text-white" color="white" />
            ) : (
              <ChevronRight size={24} className="text-gray-400" color="#9CA3AF" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <View className="items-center">
          <Text className="text-gray-900 text-base font-semibold">
            Health Profiling
          </Text>
        </View>
      }
      rightAction={<View className="w-10 h-10"/>}
    >
      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header Section */}
        <View className="mt-2 mb-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Health Profiling Management
          </Text>
          <Text className="text-sm text-gray-600 leading-5">
            Register households, residents, and families. Manage health profiling records and view comprehensive health information.
          </Text> 
        </View>

        {/* Menu Items */}
        <View>
          {menuItems.map((item) => (
            <MenuCard 
              key={item.id}
              item={item}
            />
          ))}
        </View>
      </ScrollView>
    </PageLayout>
  )
}

export default HealthProfilingHome;
