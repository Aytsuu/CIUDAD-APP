import React from "react";
import { View, Text } from "react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, HeartPulse, Baby, User, Home,Milk,MapPin as Location, UserRound } from "lucide-react-native";
// import { getOrdinalSuffix } from "@/helpers/getOrdinalSuffix";

interface ChildHealthRecord {
  pat_id: string;
  fname: string;
  lname: string;
  mname: string;
  sex: string;
  age: string;
  dob: string;
  mother_fname: string;
  mother_lname: string;
  mother_mname: string;
  mother_occupation: string;
  mother_age: string;
  father_fname: string;
  father_lname: string;
  father_mname: string;
  father_age: string;
  father_occupation: string;
  address: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  landmarks: string;
  type_of_feeding: string;
  delivery_type: string;
  pod_location: string;
  tt_status: string;
  birth_order: string;
}

interface ChildHealthRecordCardProps {
  child: ChildHealthRecord | null;
}

const formatFullName = (child: ChildHealthRecord | null) => {
  if (!child) return "Not provided";
  return `${child.fname} ${child.mname ? child.mname + ' ' : ''}${child.lname}`.trim() || "Not provided";
};

const formatDateOfBirth = (dob?: string) => {
  if (!dob) return "Not provided";
  try {
    return new Date(dob).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
};

const getSexColor = (sex: string) => {
  return sex.toLowerCase() === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700';
};

const EmptyChildState = () => (
  <Card className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
    <CardContent className="py-8 items-center">
      <Baby size={40} className="text-gray-300 mb-3" />
      <Text className="text-base font-semibold text-gray-600 mb-1">No Child Selected</Text>
      <Text className="text-sm text-gray-500 text-center">Select a child to view their information</Text>
    </CardContent>
  </Card>
);

export const ChildHealthRecordCard: React.FC<ChildHealthRecordCardProps> = ({ child }) => {
  if (!child) return <EmptyChildState />;

  const fullName = formatFullName(child);
  const dob = formatDateOfBirth(child.dob);
  const motherName = `${child.mother_fname} ${child.mother_mname ? child.mother_mname + ' ' : ''}${child.mother_lname}`.trim();
  const fatherName = `${child.father_fname} ${child.father_mname ? child.father_mname + ' ' : ''}${child.father_lname}`.trim();

  return (
    <Card className="bg-white rounded-xl shadow-sm border-0 overflow-hidden">
      {/* Header Section */}
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Baby size={20} color="blue" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                {fullName}
              </Text>
              <View className="flex-row items-center mt-1">
                <Badge className={`mr-2 ${getSexColor(child.sex)}`}>
                  <Text className="text-xs font-medium">{child.sex}</Text>
                </Badge>
                <Text className="text-sm text-gray-600">{child.age}</Text>
                {child.birth_order && (
                  <Badge className="ml-2 bg-purple-100 text-purple-700">
                    <Text className="text-xs font-medium">
                      {/* {getOrdinalSuffix(parseInt(child.birth_order, 10))} Born */}
                    </Text>
                  </Badge>
                )}
              </View>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-xs text-gray-500">ID: {child.pat_id}</Text>
          </View>
        </View>
      </CardHeader>

      {/* Main Content */}
      <CardContent className="p-4 space-y-4">
        {/* Basic Info Row */}
        <View className="flex-row justify-between items-center bg-blue-50 rounded-lg p-3">
          <View className="flex-row items-center flex-1">
            <Calendar size={16} className="text-blue-600 mr-2" />
            <View>
              <Text className="text-xs text-blue-600">Date of Birth</Text>
              <Text className="text-sm font-semibold text-blue-800">{dob}</Text>
            </View>
          </View>
          {child.type_of_feeding && (
            <View className="flex-row items-center flex-1 border-l border-blue-200 pl-3">
              <Milk size={16} className="text-blue-600 mr-2" />
              <View>
                <Text className="text-xs text-blue-600">Feeding</Text>
                <Text className="text-sm font-semibold text-blue-800" numberOfLines={1}>
                  {child.type_of_feeding}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Location Info */}
        <View className="bg-blue-50 rounded-lg p-3">
          <View className="flex-row items-start">
            <Home size={16} className="text-blue-600 mr-2 mt-0.5" />
            <View className="flex-1">
              <Text className="text-xs text-blue-600 mb-1">Address</Text>
              <Text className="text-sm text-blue-800 font-semibold" numberOfLines={2}>
                {child.address || "No address provided"}
              </Text>
              {child.landmarks && (
                <View className="flex-row items-center mt-1">
                  <Location size={12} className="text-orange-500 mr-1" />
                  <Text className="text-xs text-gray-600" numberOfLines={1}>
                    {child.landmarks}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Parents Info */}
        <View className="bg-green-50 rounded-lg p-3">
          <View className="flex-row items-center mb-2">
            <UserRound size={16} className="text-green-600 mr-2 mt-0.5" />
            <Text className="text-xs font-semibold text-green-700">Parents Information</Text>
          </View>
          
          <View className="space-y-2">
            {/* Mother */}
            <View className="flex-row items-center">
              <User size={12} className="text-pink-500 mr-2" />
              <View className="flex-1"> 
                <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>
                  Mother: {motherName || "Mother not provided"}
                </Text>
                {child.mother_occupation && (
                  <Text className="text-xs text-gray-500">{child.mother_occupation}</Text>
                )}
              </View>
              {child.mother_age && (
                <Text className="text-xs text-gray-500">Age: {child.mother_age}</Text>
              )}
            </View>

            {/* Father */}
            <View className="flex-row items-center">
              <User size={12} className="text-blue-500 mr-2" />
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>
                  Father: {fatherName || "Father not provided"}
                </Text>
                {child.father_occupation && (
                  <Text className="text-xs text-gray-500">{child.father_occupation}</Text>
                )}
              </View>
              {child.father_age && (
                <Text className="text-xs text-gray-500">Age: {child.father_age}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Additional Medical Info */}
        {(child.delivery_type || child.pod_location || child.tt_status) && (
          <View className="bg-green-50 rounded-lg p-3">
            <View className="flex-row items-center mb-2">
              <HeartPulse size={16} className="text-green-600 mr-2" />
              <Text className="text-xs font-semibold text-green-700">Medical Details</Text>
            </View>
            
            <View className="space-y-1">
              {child.delivery_type && (
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-600">Delivery Type:</Text>
                  <Text className="text-xs font-medium text-gray-800">{child.delivery_type}</Text>
                </View>
              )}
              {child.pod_location && (
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-600">Birth Location:</Text>
                  <Text className="text-xs font-medium text-gray-800" numberOfLines={1}>
                    {child.pod_location}
                  </Text>
                </View>
              )}
              {child.tt_status && (
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-600">TT Status:</Text>
                  <Text className="text-xs font-medium text-gray-800">{child.tt_status}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </CardContent>
    </Card>
  );
};