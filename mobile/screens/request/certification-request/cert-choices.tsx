import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import PageLayout from '@/screens/_PageLayout';
import { LinearGradient } from 'expo-linear-gradient';

const CertChoices = () => {
  const router = useRouter();

  const menuItem = [
    {
      title: "Personal",
      route: "/(request)/certification-request/cert-personal",
      icon: "person-outline",
      gradient: ['#3b82f6', '#2563eb'],
    },
    {
      title: "Business Permit and Business Clearance",
      route: "/(request)/certification-request/cert-business-request",
      icon: "document-text-outline",
      gradient: ['#2563eb', '#1e40af'],
    },
  ];

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-[13px]">Certification Requests</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 px-6 py-4">
        <View className="flex-row flex-wrap gap-3">
          {menuItem.map((item: any, index: number) => (
            <TouchableOpacity
              key={index}
              className="rounded-2xl overflow-hidden"
              style={{ 
                width: '48%', 
                aspectRatio: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
              activeOpacity={0.8}
              onPress={() => router.push(item.route)}
            >
              <LinearGradient
                colors={item.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 p-5"
              >
                <View className="flex-1 justify-between">
                  <View className="items-start">
                    <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                      <Ionicons name={item.icon} size={24} color="white" />
                    </View>
                  </View>
                  
                  <View>
                    <Text className="text-white font-bold text-base leading-tight">
                      {item.title}
                    </Text>
                    
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </PageLayout>
  );
};

export default CertChoices;