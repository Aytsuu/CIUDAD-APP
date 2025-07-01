import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

const _layout = () => {
  return (
    <Tabs>
        <Tabs.Screen
            name="index"
            options={{
                headerShown: false,
            }}

        />
        <Tabs.Screen
            name="home"
            options = {{
              title: "Home",
              headerShown: false,
            }}
            
        />
        <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              headerShown: false,
            }}
        />
        <Tabs.Screen
            name="announcement"
            options={{
              title: "Announcements",
              headerShown: false,
            }}
        />
    </Tabs>
  )
}

export default _layout