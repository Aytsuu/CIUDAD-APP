import { useAuth } from "@/contexts/AuthContext"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import PageLayout from "@/screens/_PageLayout"
import { router } from "expo-router"
import { TouchableOpacity, View, Text, ScrollView } from "react-native"
import { useGetResidentFamily } from "./queries/accountGetQueries"
import { LoadingState } from "@/components/ui/loading-state"
import { useGetFamilyMembers } from "../profiling/queries/profilingGetQueries"
import { Home, User } from "lucide-react-native"

export default () => {
  const { user } = useAuth();
  const {data: familyData, isLoading: isLoadingFam} = useGetResidentFamily(user?.rp as string)
  const {data: familyMembers, isLoading: isLoadingMembers} = useGetFamilyMembers(familyData?.fam_id)
  
  const members = familyMembers?.results || []
  
  console.log(familyData)
  console.log(members)
  

  if(isLoadingFam || isLoadingMembers) return <LoadingState />

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
      headerTitle={<Text className="text-black text-[13px]">Family Information</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Family Overview Card */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Home size={18} color="#3b82f6" />
            <Text className="text-base font-semibold text-gray-900 ml-2">
              Family Details
            </Text>
          </View>
          
          <View className="space-y-2">
            <View className="flex-row">
              <Text className="text-sm text-gray-500 w-32">Family ID:</Text>
              <Text className="text-sm text-gray-900 flex-1">{familyData?.fam_id}</Text>
            </View>
            
            <View className="flex-row">
              <Text className="text-sm text-gray-500 w-32">Household:</Text>
              <Text className="text-sm text-gray-900 flex-1">{familyData?.household_no}</Text>
            </View>
            
            <View className="flex-row">
              <Text className="text-sm text-gray-500 w-32">Location:</Text>
              <Text className="text-sm text-gray-900 flex-1">
                {familyData?.street}, {familyData?.sitio}
              </Text>
            </View>
            
            <View className="flex-row">
              <Text className="text-sm text-gray-500 w-32">Building Status:</Text>
              <Text className="text-sm text-gray-900 flex-1">{familyData?.fam_building}</Text>
            </View>
            
            <View className="flex-row">
              <Text className="text-sm text-gray-500 w-32">Members:</Text>
              <Text className="text-sm text-gray-900 flex-1">{familyData?.members}</Text>
            </View>
            
            <View className="flex-row">
              <Text className="text-sm text-gray-500 w-32">Indigenous:</Text>
              <Text className="text-sm text-gray-900 flex-1">{familyData?.fam_indigenous}</Text>
            </View>
            
            <View className="flex-row">
              <Text className="text-sm text-gray-500 w-32">Registered:</Text>
              <Text className="text-sm text-gray-900 flex-1">
                {new Date(familyData?.fam_date_registered).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Family Members Section */}
        <Text className="text-base font-semibold text-gray-900 mb-3">Family Members</Text>
        
        {members.map((member: any) => (
          <View 
            key={member.rp_id}
            className="bg-white rounded-lg p-3 mb-2 border border-gray-200"
          >
            <View className="flex-row items-center mb-2">
              <User size={16} color="#6b7280" />
              <Text className="text-sm font-semibold text-gray-900 ml-2 flex-1">
                {member.name}
              </Text>
              <View className="bg-blue-50 px-2 py-1 rounded">
                <Text className="text-xs font-medium text-blue-700">
                  {member.fc_role}
                </Text>
              </View>
            </View>
            
            <View className="flex-row flex-wrap">
              <View className="flex-row mr-4 mb-1">
                <Text className="text-xs text-gray-500">ID: </Text>
                <Text className="text-xs text-gray-900">{member.rp_id}</Text>
              </View>
              
              <View className="flex-row mr-4 mb-1">
                <Text className="text-xs text-gray-500">Sex: </Text>
                <Text className="text-xs text-gray-900">{member.sex}</Text>
              </View>
              
              <View className="flex-row mr-4 mb-1">
                <Text className="text-xs text-gray-500">DOB: </Text>
                <Text className="text-xs text-gray-900">
                  {new Date(member.dob).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
              </View>
              
              <View className="flex-row mb-1">
                <Text className="text-xs text-gray-500">Status: </Text>
                <Text className="text-xs text-gray-900">{member.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </PageLayout>
  )
}