import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { Pen } from "@/lib/icons/Pen";
import PageLayout from "@/screens/_PageLayout";
import { router } from "expo-router";
import { TouchableOpacity, View, Text } from "react-native";

export default () => {
  // =================== STATE INITIALIZATION ===================
  const { user } = useAuth();
  const personalData = user?.personal
  
  // =================== RENDER HELPER ===================
  const InfoRow = ({ label, value } : {label: string, value: string}) => (
    <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
      <Text className="text-gray-600 text-sm flex-1">{label}</Text>
      <Text className={`${value ? "text-gray-800" : "text-gray-400"} text-sm font-medium flex-1 text-right`}>
        {value || "Not specified"}
      </Text>
    </View>
  );

  // =================== MAIN RENDER ===================
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
      headerTitle={<Text className="text-black text-[13px]">Personal Information</Text>}
      rightAction={
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-primaryBlue items-center justify-center"
          onPress={() => router.push({
            pathname: "/(account)/settings/personal/update",
            params: {
              data: JSON.stringify(personalData)
            }
          })}
          activeOpacity={0.90}
        >
          <Pen className="text-white" size={16}/>
        </TouchableOpacity>
      }
    >
      <View className="flex-1 px-6">
        {user?.rp ? (
          <View className="flex-1">
            <InfoRow label="First Name" value={personalData?.per_fname} />
            <InfoRow label="Last Name" value={personalData?.per_lname} />
            <InfoRow label="Middle Name" value={personalData?.per_mname} />
            <InfoRow label="Suffix" value={personalData?.per_suffix} />
            <InfoRow label="Date of Birth" value={personalData?.per_dob} />
            <InfoRow label="Sex" value={personalData?.per_sex} />
            <InfoRow label="Civil Status" value={personalData?.per_status} />
            <InfoRow label="Educational Attainment" value={personalData?.per_edAttainment} />
            <InfoRow label="Religion" value={personalData?.per_religion} />
            <InfoRow label="Contact Number" value={personalData?.per_contact} />
            <InfoRow label="Disability" value={personalData?.per_disability} />
          </View>
        ) : (
          <View>
            <InfoRow label="First Name" value={personalData?.br_fname} />
            <InfoRow label="Last Name" value={personalData?.br_lname} />
            <InfoRow label="Middle Name" value={personalData?.br_mname} />
            <InfoRow label="Date of Birth" value={personalData?.br_dob} />
            <InfoRow label="Sex" value={personalData?.br_sex} />
            <InfoRow label="Contact Number" value={personalData?.br_contact} />
          </View>
        )}
      </View>
    </PageLayout>
  )
}