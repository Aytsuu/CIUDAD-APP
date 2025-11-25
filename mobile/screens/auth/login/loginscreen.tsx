import "@/global.css";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import PageLayout from "@/screens/_PageLayout";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  ScrollView,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/ui/toast";
import { SignupOptions } from "./SignupOptions";
import { DrawerTrigger, DrawerView } from "@/components/ui/drawer";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import LoginOTP from "./loginOTP";

export default function Login() {
  const [loginMethod, setLoginMethod] = React.useState<"phone" | "email">("phone");
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToastContext();
  const bottomSheetRef = React.useRef<BottomSheet>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success("Welcome!");
      router.replace("/(tabs)");
    }
  }, [user, isAuthenticated, toast]);

  const handleSwitchMethod = () => {
    setLoginMethod(loginMethod === "phone" ? "email" : "phone");
  };

  return (
    <>
      <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<View></View>}
      rightAction={
        <DrawerTrigger bottomSheetRef={bottomSheetRef}>
          <Text className="text-[13px] mr-2">Sign up</Text>
        </DrawerTrigger>
      }
    >
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <LoginOTP
          method={loginMethod}
          onSwitchMethod={handleSwitchMethod}
        />
      </ScrollView>
    </PageLayout>
      <DrawerView
        bottomSheetRef={bottomSheetRef}
        snapPoints={["80%"]}
        title={"Reports"}
        description={"View all reports"}
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingBottom: 10,
            gap: 10,
          }}
          showsVerticalScrollIndicator={false}
        >
          <SignupOptions />
        </BottomSheetScrollView>
      </DrawerView>
    </>
  );
}