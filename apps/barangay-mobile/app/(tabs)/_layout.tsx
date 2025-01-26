import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Announcement_Icon from '@/assets/svg/Announcement_Icon';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {
            backgroundColor: '#07143F',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            height: 70,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 10,

            
          }, 
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          marginTop: 5,
        },
      }}>

      <Tabs.Screen 
        name="Gad_home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={30} name="home.feather" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-request"
        options={{
          title: 'My Request',
          tabBarIcon: ({ color }) => <IconSymbol size={30} name="grid.feather" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-announcement"
        options={{
          title: 'Announcement',
          tabBarIcon: ({ color }) => <Announcement_Icon color={color}/>,
        }}
      />
      <Tabs.Screen
        name="my-profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={30} name="circle-user.FontAwesome6" color={color} />,
        }}
      />
      
    </Tabs>
  );
}