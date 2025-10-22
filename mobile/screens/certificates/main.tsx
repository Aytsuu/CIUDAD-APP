import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

const CertificatesMain = () => {
  const handleNavigation = (route: string) => {
    // Navigate to the appropriate route based on selection
    switch (route) {
      case 'personal':
        router.push('/(certificates)/cert-list')
        break
      case 'permit':
        router.push('/(certificates)/business-list')
        break
      case 'certificates':
        router.push('/(certificates)/issued-cert-list')
        break
      default:
        break
    }
  }

  const menuItems = [
    {
      id: 'personal',
      title: 'Personal & Others',
      description: 'Manage personal information and other requests',
      icon: 'person-outline',
      color: 'bg-blue-500',
      iconColor: 'text-blue-600'
    },
    {
      id: 'permit',
      title: 'Permit',
      description: 'Apply for and manage permits',
      icon: 'document-text-outline',
      color: 'bg-green-500',
      iconColor: 'text-green-600'
    },
    {
      id: 'certificates',
      title: 'Issued Certificates',
      description: 'View and download issued certificates',
      icon: 'ribbon-outline',
      color: 'bg-purple-500',
      iconColor: 'text-purple-600'
    }
  ]

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-1 px-6 pt-20">
        {/* Header */}
        <View className="mb-16 items-center">
          <Text className="text-3xl font-bold text-gray-900 mb-3 text-center">
            Certificates & Permits
          </Text>
          <Text className="text-gray-600 text-base text-center px-4">
            Choose a service to get started
          </Text>
        </View>

        {/* Menu Cards - Perfectly Centered */}
        <View className="flex-1">
          <View className="space-y-5 max-w-sm mx-auto w-full">
            {menuItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleNavigation(item.id)}
                className="active:opacity-80"
              >
                <Card className="border-0 shadow-xl bg-white rounded-2xl">
                  <CardContent className="p-5">
                    <View className="flex-row items-center">
                      {/* Icon Container */}
                      <View className={`w-12 h-12 rounded-xl ${item.color} items-center justify-center shadow-lg mr-4`}>
                        <Ionicons 
                          name={item.icon as any} 
                          size={24} 
                          color="white" 
                        />
                      </View>
                      
                      {/* Content */}
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900 mb-1">
                          {item.title}
                        </Text>
                        <Text className="text-gray-600 text-sm leading-5">
                          {item.description}
                        </Text>
                      </View>
                      
                      {/* Arrow Icon */}
                      <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color="#9CA3AF" 
                      />
                    </View>
                  </CardContent>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}

export default CertificatesMain