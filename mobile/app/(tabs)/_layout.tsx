import React from "react";
import { Tabs } from "expo-router";
import { NavigationBar } from "@/components/tab/NavigationBar";

export default () => {
  return (
    <Tabs tabBar={(props) => <NavigationBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="my-request"
        options={{
          title: "My Request",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          headerShown: false,
        }}
      />
    </Tabs>
  )
}