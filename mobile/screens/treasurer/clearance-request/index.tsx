import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import { FileText, Building2, Award, ChevronLeft } from 'lucide-react-native'
import PageLayout from '../../_PageLayout'
import { LinearGradient } from 'expo-linear-gradient'

const ClearanceRequestMain = () => {
  const handleNavigation = (route: string) => {
    switch (route) {
      case 'certificate':
        router.push('/(treasurer)/clearance-request/certificate-list')
        break
      case 'business':
        router.push('/(treasurer)/clearance-request/business-list')
        break
      case 'service_charge':
        router.push('/(treasurer)/clearance-request/service-charge-list')
        break
      default:
        break
    }
  }

  const menuItems = [
    {
      id: 'certificate',
      title: 'Personal & Others',
      description: 'View certificate requests',
      icon: FileText,
      gradient: ['#3b82f6', '#1e40af'],
    },
    {
      id: 'business',
      title: 'Business Permits',
      description: 'View business permit requests',
      icon: Building2,
      gradient: ['#059669', '#047857'],
    },
    {
      id: 'service_charge',
      title: 'Service Charge',
      description: 'View service charge requests',
      icon: Award,
      gradient: ['#dc2626', '#991b1b'],
    }
  ]

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Payment Requests</Text>}
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <View className="flex-1 px-5">
        <View className="flex-row flex-wrap gap-3">
          {menuItems.map((item: any, index: number) => (
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
              onPress={() => item.id && handleNavigation(item.id)}
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
                      <item.icon size={24} color="white" />
                    </View>
                  </View>
                  
                  <View>
                    <Text className="text-white font-bold text-base leading-tight">
                      {item.title}
                    </Text>
                    <Text className="text-white/80 text-xs mt-1 leading-tight">
                      {item.description}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </PageLayout>
  )
}

export default ClearanceRequestMain
