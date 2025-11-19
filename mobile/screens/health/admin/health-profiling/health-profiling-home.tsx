import { Text, View, TouchableOpacity } from "react-native"
import PageLayout from "@/screens/_PageLayout"
import { useRouter } from "expo-router"
import { 
  UserRoundPlus, 
  UsersRound, 
  Building, 
  ChevronLeft, 
  ChevronRight,
  Plus
} from "lucide-react-native"
import React from "react"
import { ResponsiveFormContainer } from "../../../../components/healthcomponents/ResponsiveFormContainer"

function HealthProfilingHome() {
  const router = useRouter();

  const quickActions = [
    {
      id: 'register',
      title: 'Register New Resident',
      description: 'Complete resident profiling',
      icon: UserRoundPlus,
      route: '/(health)/admin/health-profiling/resident-registration',
    },
    {
      id: 'household-register',
      title: 'Register New Household',
      description: 'Register household information',
      icon: Building,
      route: '/(health)/admin/health-profiling/household-registration',
    },
    {
      id: 'family-profiling',
      title: 'Register New Family',
      description: 'Complete family health profiling',
      icon: UsersRound,
      route: '/(health)/admin/health-profiling/family-profiling',
    },
  ]

  const browseRecords = [
    {
      id: 'resident',
      title: 'Residents',
      description: 'View individual records',
      icon: UserRoundPlus,
      route: '/(health)/admin/health-profiling/resident/records',
    },
    {
      id: 'family',
      title: 'Families',
      description: 'View family compositions',
      icon: UsersRound,
      route: '/(health)/admin/health-profiling/family-records',
    },
    {
      id: 'household',
      title: 'Households',
      description: 'View housing information',
      icon: Building,
      route: '/(health)/admin/health-profiling/household/records',
    },
  ]

  const ActionCard = ({ item }: { item: any }) => {
    const IconComponent = item.icon

    return (
      <TouchableOpacity
        onPress={() => router.push(item.route as any)}
        className="bg-white rounded-xl p-4 mb-3 border border-slate-200 active:opacity-75"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          {/* Icon Container */}
          <View className="w-12 h-12 rounded-lg bg-slate-50 items-center justify-center">
            <IconComponent 
              size={24} 
              color="#0F172A"
            />
          </View>

          {/* Content */}
          <View className="flex-1 ml-3">
            <Text className="text-base font-semibold text-slate-900">
              {item.title}
            </Text>
            <Text className="text-xs mt-1 text-slate-500">
              {item.description}
            </Text>
          </View>

          {/* Arrow Icon */}
          <View className="ml-2">
            <Plus size={20} color="#64748B" />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const NavigationCard = ({ item }: { item: any }) => {
    const IconComponent = item.icon

    return (
      <TouchableOpacity
        onPress={() => router.push(item.route as any)}
        className="bg-white rounded-xl p-4 mb-3 border border-slate-200 active:opacity-75"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          {/* Icon Container */}
          <View className="w-12 h-12 rounded-lg bg-slate-50 items-center justify-center">
            <IconComponent 
              size={24} 
              color="#0F172A"
            />
          </View>

          {/* Content */}
          <View className="flex-1 ml-3">
            <Text className="text-base font-semibold text-slate-900">
              {item.title}
            </Text>
            <Text className="text-xs mt-1 text-slate-500">
              {item.description}
            </Text>
          </View>

          {/* Chevron Icon */}
          <View className="ml-2">
            <ChevronRight size={20} color="#94A3B8" />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const SectionHeader = ({ title }: { title: string }) => (
    <View className="mt-6 mb-3">
      <Text className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
        {title}
      </Text>
      <View className="h-px bg-slate-200 mt-2" />
    </View>
  )

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
        >
          <ChevronLeft size={24} className="text-slate-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <View className="items-center">
          <Text className="text-slate-900 text-base font-semibold">
            Health Profiling
          </Text>
        </View>
      }
      rightAction={<View className="w-10 h-10"/>}
    >
      <ResponsiveFormContainer
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header Section */}
        <View className="mb-2">
          <Text className="text-2xl font-bold text-slate-900 mb-2">
            Health Profiling Management
          </Text>
          <Text className="text-sm text-slate-600 leading-5">
            Register households, residents, and families. Manage health profiling records and view comprehensive health information.
          </Text> 
        </View>

        {/* Quick Actions Section */}
        <SectionHeader title="Quick Actions" />
        <View>
          {quickActions.map((item) => (
            <ActionCard 
              key={item.id}
              item={item}
            />
          ))}
        </View>

        {/* Browse Records Section */}
        <SectionHeader title="Browse Records" />
        <View>
          {browseRecords.map((item) => (
            <NavigationCard 
              key={item.id}
              item={item}
            />
          ))}
        </View>
      </ResponsiveFormContainer>
    </PageLayout>
  )
}

export default HealthProfilingHome;
