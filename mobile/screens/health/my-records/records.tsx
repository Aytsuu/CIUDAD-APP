import * as React from "react";
import { View, TouchableOpacity, ScrollView, StatusBar, SafeAreaView, Image, ActivityIndicator } from "react-native";
import { ChevronLeft, ChevronRight, Baby, Dog, Heart, Cross, Activity, BriefcaseMedical, Syringe } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router, useLocalSearchParams } from "expo-router";
import PageLayout from "@/screens/_PageLayout";
import { useGetChildren } from "./queries.tsx/fetch";
import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
interface Service {
  id: number;
  name: string;
  description: string;
  route: string;
  icon: any;
  image?: any;
  color: string;
}

// Helper function to calculate age
const calculateAge = (dob: string) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export default function Records() {
  const { pat_id } = useAuth();
  const params = useLocalSearchParams();
  const mode = params.mode || "parents";
  const [patId, setPatientId] = useState("");

  // Parse the parameters from strings to objects with proper error handling
  const passed_pat_id = useMemo(() => {
    try {
      const parsedId = typeof params.pat_id === "string" ? params.pat_id : "";
      return parsedId;
    } catch (error) {
      console.error("Error parsing record:", error);
      return null;
    }
  }, [params.patId]);

  useEffect(() => {
    if (mode == "admin") {
      setPatientId(passed_pat_id || "");
    } else if (pat_id) {
      setPatientId(pat_id);
    }
  }, [pat_id]);

  const { data: childrenData, isLoading: childrenLoading } = useGetChildren(patId || "");

  // Format children data using useMemo for optimization
  const formattedChildren = useMemo(() => {
    if (!childrenData?.children) return [];

    return childrenData.children.map((child: any) => {
      const personalInfo = child.personal_info || {};
      const addressInfo = child.address || {};
      const childHealthInfo = child.child_health_info || {};

      // Calculate age from DOB
      const dob = personalInfo.per_dob || "";
      const age = dob ? calculateAge(dob).toString() : "";

      return {
        chrec_id: child.chrec_id || 0,
        pat_id: child.pat_id || "",
        fname: personalInfo.per_fname || "",
        lname: personalInfo.per_lname || "",
        mname: personalInfo.per_mname || "",
        sex: personalInfo.per_sex || "",
        age: age,
        dob: dob,
        householdno: child.households?.[0]?.hh_id || "",
        street: addressInfo.add_street || "",
        sitio: addressInfo.add_sitio || "",
        barangay: addressInfo.add_barangay || "",
        city: addressInfo.add_city || "",
        province: addressInfo.add_province || "",
        landmarks: addressInfo.add_landmarks || "",
        pat_type: "CHILD",
        address: addressInfo.full_address || "",
        mother_fname: child.parent_info?.mother?.fname || "",
        mother_lname: child.parent_info?.mother?.lname || "",
        mother_mname: child.parent_info?.mother?.mname || "",
        mother_contact: child.parent_info?.mother?.contact || "",
        mother_occupation: childHealthInfo.mother_occupation || "",
        father_fname: child.parent_info?.father?.fname || "",
        father_lname: child.parent_info?.father?.lname || "",
        father_contact: child.parent_info?.father?.contact || "",
        father_occupation: childHealthInfo.father_occupation || "",
        family_no: childHealthInfo.family_no || "",
        birth_weight: childHealthInfo.birth_weight || 0,
        birth_height: childHealthInfo.birth_height || 0,
        type_of_feeding: childHealthInfo.type_of_feeding || "Unknown",
        delivery_type: childHealthInfo.place_of_delivery_type || "",
        place_of_delivery_type: childHealthInfo.place_of_delivery_type || "",
        pod_location: childHealthInfo.pod_location || "",
        birth_order: childHealthInfo.birth_order || 0,
        tt_status: childHealthInfo.tt_status || ""
      };
    });
  }, [childrenData]);

  console.log("Children Data:", childrenData);
  console.log("Formatted Children:", formattedChildren);
 const services: Service[] = [
   {
         id: 1,
      name: 'Animal Bites',
      description: 'View animal bite referral records',
      route: '/animalbite/my-records',
      icon: Dog,
      image: require('@/assets/images/Health/Home/animalbites.jpg'),
      color: '#059669'
    },
    {
      id: 2,
      name: 'Child Health',
      description: 'View child health records',
      route: '/childhealth/my-records',
      icon: Baby,
      image: require('@/assets/images/Health/Home/child-health.jpg'),
      color: '#059669'
    },
    {
      id: 3,
      name: 'Family Planning',
      description: 'View family planning records',
      route: '/(health)/family-planning/fp-dashboard',
      icon: Heart,
      image: require('@/assets/images/Health/Home/Famplanning.jpg'),
      color: '#059669'
    },
    {
      id: 4,
      name: 'First Aid',
      description: 'View first aid treatment records',
      route: '/first-aid/my-records',
      icon: Cross,
      image: require('@/assets/images/Health/Home/first-aid.jpg'),
      color: '#059669'
    },
    {
      id: 5,
      name: 'Maternal',
      description: 'Access your maternal health records',
      route: '/maternal/my-records',
      icon: Baby,
      image: require('@/assets/images/Health/Home/Maternal1.jpg'),
      color: '#059669'
    },
    {
      id: 6,
      name: 'Medical Consultation',
      description: 'View medical consultation records',
      route: '/medconsultation/my-records',
      icon: Activity,
      image: require('@/assets/images/Health/Home/medicalconsultation.jpg'),
      color: '#059669'
    },
    {
      id: 7,
      name: 'Medicine Records',
      description: 'View medicine records',
      route: '/medicine-records/my-records',
      icon: BriefcaseMedical,
      image: require('@/assets/images/Health/Home/child-health.jpg'),
      color: '#059669'
    },
    {
      id: 8,
      name: 'Vaccination',
      description: 'View vaccination records',
      route: '/vaccination/my-records',
      icon: Syringe,
      image: require('@/assets/images/Health/Home/vaccination.jpg'),
      color: '#059669'
    },
  ];
  

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Health Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View className="px-6 mt-1">
          <Text className="text-2xl font-semibold text-gray-900 mb-2">{patId ? "Health Records" : "My Health Records"}</Text>
          <Text className="text-gray-500 text-sm">Access your medical records across different services</Text>
        </View>

        {/* Services Grid - NOW DISPLAYS ALL SERVICES */}
        <View className="px-6 pt-6">
          <View className="gap-4">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => {
                    console.log("[DEBUG] Navigating to:", service.route, "with pat_id:", patId);
                    router.push({
                      pathname: service.route as any,
                      params: { pat_id: patId, mode: mode }
                    });
                  }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <View className="flex-row">
                    {service.image && <Image source={service.image} className="w-24 h-24" resizeMode="cover" />}

                    <View className="flex-1 p-4">
                      <View className="flex-row items-center mb-2">
                        {/* Icon added here */}
                        <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: service.color + "20" }}>
                          <IconComponent size={16} color={service.color} />
                        </View>
                        <Text className="text-lg font-semibold text-gray-900 flex-1">{service.name}</Text>
                        <ChevronRight size={16} color="#9CA3AF" />
                      </View>

                      <Text className="text-sm text-gray-500 mb-2">{service.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Children Section - Mobile Optimized */}
          {(childrenLoading || formattedChildren.length > 0) && (
            <View className="mt-6">
              <View className="bg-white rounded-xl border border-indigo-100 p-4 shadow-sm">
                {/* Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center space-x-3">
                    <View className="bg-indigo-100 p-2 rounded-xl">
                      <Baby size={20} color="#4f46e5" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900">My Children</Text>
                  </View>
                  {!childrenLoading && formattedChildren.length > 0 && (
                    <Text className="text-sm text-gray-500">
                      {formattedChildren.length} child{formattedChildren.length !== 1 ? "ren" : ""}
                    </Text>
                  )}
                </View>

                {/* Loading State */}
                {childrenLoading && (
                  <View className="py-6 items-center">
                    <ActivityIndicator size="small" color="#4f46e5" />
                    <Text className="text-gray-500 mt-2 text-sm">Loading children...</Text>
                  </View>
                )}

                {/* Children List */}
                {!childrenLoading && formattedChildren.length > 0 && (
                  <View className="space-y-3">
                    {formattedChildren.map((child: any) => (
                      <TouchableOpacity
                        key={child.pat_id}
                        onPress={() => {
                          router.push({
                            pathname: "/childhealth/my-records",
                            params: {
                              pat_id: child.pat_id,
                              mode: "admin"
                            }
                          });
                        }}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200 active:bg-gray-100"
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center space-x-3 flex-1">
                            <View className="flex-1">
                              <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                                {child.fname} {child.mname} {child.pat_id}
                              </Text>
                              <View className="flex-row flex-wrap mt-1 gap-1">
                                <View className="bg-gray-200 px-2 py-1 rounded">
                                  <Text className="text-xs text-gray-700">
                                    {child.age} {child.age === "1" ? "yr" : "yrs"}
                                  </Text>
                                </View>
                                <View className="bg-gray-200 px-2 py-1 rounded">
                                  <Text className="text-xs text-gray-700">{child.sex}</Text>
                                </View>
                                <View className="bg-gray-200 px-2 py-1 rounded">
                                  <Text className="text-xs text-gray-700">#{child.birth_order}</Text>
                                </View>
                              </View>
                            </View>
                          </View>
                          <View className="bg-white border border-indigo-300 rounded-lg px-3 py-1.5 ml-2">
                            <Text className="text-indigo-700 font-medium text-xs">View</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Empty State */}
                {!childrenLoading && formattedChildren.length === 0 && (
                  <View className="py-8 items-center">
                    <Baby size={32} color="#9ca3af" />
                    <Text className="text-gray-500 mt-2 text-center">No children records found</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Additional Info */}
        <View className="px-6 pt-6">
          <View className="bg-blue-50 rounded-lg p-4">
            <Text className="text-blue-800 text-sm">💡 Medical records are securely stored and only accessible to authorized healthcare providers.</Text>
          </View>
        </View>
      </ScrollView>
    </PageLayout>
  );
}
