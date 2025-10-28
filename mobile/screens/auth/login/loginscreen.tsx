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
import LoginOTP from "./loginOTP";

const SignupOptionsMemo = React.memo(SignupOptions);

export default function Login() {
  const [loginMethod, setLoginMethod] = React.useState<"phone" | "email">("phone");
  const [showSignupOptions, setShowSignupOptions] = React.useState<boolean>(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToastContext();

  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success("Welcome!");
      router.replace("/(tabs)");
    }
  }, [user, isAuthenticated, toast]);

  const handleCloseSignupOptions = () => setShowSignupOptions(false);
  const handleSwitchMethod = () => {
    setLoginMethod(loginMethod === "phone" ? "email" : "phone");
  };

  return (
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
        <View className="h-10 pr-2">
          <TouchableOpacity onPress={() => setShowSignupOptions(true)}>
            <Text className="text-[13px]">Sign up</Text>
          </TouchableOpacity>
        </View>
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

      {/* Signup Options Modal */}
      <SignupOptionsMemo
        visible={showSignupOptions}
        onClose={handleCloseSignupOptions}
      />
    </PageLayout>
  );
}