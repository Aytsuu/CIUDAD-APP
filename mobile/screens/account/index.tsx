import {
  ScrollView,
  Text,
  View,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useState } from "react";
import ScreenLayout from "../_ScreenLayout";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux";
import { logout, clearAuthState } from "@/redux/authSlice";
import { useToastContext } from "@/components/ui/toast";

export default () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { toast } = useToastContext();

  type AccountSectionProps = {
    title: string;
    children: React.ReactNode;
  };

  const AccountSection = ({ title, children }: AccountSectionProps) => (
    <View className="mb-6">
      <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3 px-4">
        {title}
      </Text>
      <View className="bg-white rounded-xl mx-4 shadow-sm">{children}</View>
    </View>
  );

  type AccountItemProps = {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    showBorder?: boolean;
  };

  const AccountItem = ({
    icon,
    title,
    subtitle,
    rightElement,
    onPress,
    showBorder = true,
  }: AccountItemProps) => (
    <TouchableOpacity
      className={`flex-row items-center px-4 py-4 ${
        showBorder ? "border-b border-gray-100" : ""
      }`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mr-3">
        <Text className="text-blue-600 text-lg">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 text-base font-medium">{title}</Text>
        {subtitle && (
          <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
        )}
      </View>
      {rightElement || <Text className="text-gray-400 text-lg">›</Text>}
    </TouchableOpacity>
  );

  interface SwitchItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }

  const SwitchItem = ({
    icon,
    title,
    subtitle,
    value,
    onValueChange,
  }: SwitchItemProps) => (
    <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
      <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mr-3">
        <Text className="text-blue-600 text-lg">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 text-base font-medium">{title}</Text>
        {subtitle && (
          <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
        thumbColor={value ? "#ffffff" : "#ffffff"}
      />
    </View>
  );

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("Starting logout process...");
            dispatch(clearAuthState());
            router.replace("/(auth)");
            dispatch(logout()).finally(() => {
              console.log("Logout API call completed");
            });
            toast.success("Signed out successfully");
          } catch (error) {
            console.error("Logout error:", error);
            toast.success("Signed out successfully");
          }
        },
      },
    ]);
  };

  return (
    <ScreenLayout
      showBackButton={false}
      showExitButton={false}
      headerBetweenAction={<Text className="text-[13px]">Account</Text>}
    >
      <ScrollView className="flex-1 bg-gray-50">
        {/* Profile Header */}
        <View className="bg-white px-4 py-6 mb-6">
          <View className="flex-row items-center">
            <View className="relative">
              <Image
                source={
                  user?.profile_image
                    ? { uri: user.profile_image }
                    : require("@/assets/images/Logo.png")
                }
                className="w-20 h-20 rounded-full"
                style={{ backgroundColor: '#f3f4f6' }}
              />
              <TouchableOpacity className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full items-center justify-center">
                <Text className="text-white text-sm">✎</Text>
              </TouchableOpacity>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-900">
                {user?.resident?.per?.per_fname || user?.username || "User"}{" "}
                {user?.resident?.per?.per_lname || ""}
              </Text>
              <Text className="text-gray-500 text-sm mt-1">{user?.email}</Text>
              <Text className="text-gray-400 text-xs mt-1">
                {user?.staff?.staff_type || "Resident"}
              </Text>
            </View>
          </View>

          <TouchableOpacity className="mt-4 bg-gray-100 rounded-lg px-4 py-3">
            <Text className="text-center text-gray-700 font-medium">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <AccountSection title="Account">
          <AccountItem
            icon="👤"
            title="Personal Information"
            subtitle="Update your details and preferences"
            onPress={() => console.log("Personal Info")}
          />
          <AccountItem
            icon="🔒"
            title="Privacy & Security"
            subtitle="Password, 2FA, and security settings"
            onPress={() => console.log("Privacy")}
          />
        </AccountSection>

        {/* Preferences */}
        <AccountSection title="Preferences">
          <SwitchItem
            icon="🔔"
            title="Push Notifications"
            subtitle="Get alerts about updates and messages"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <SwitchItem
            icon="🌙"
            title="Dark Mode"
            subtitle="Switch to dark theme"
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
        </AccountSection>

        {/* Support */}
        <AccountSection title="Support">
          <AccountItem
            icon="❓"
            title="Help Center"
            subtitle="FAQs and troubleshooting"
            onPress={() => console.log("Help")}
          />
          <AccountItem
            icon="💬"
            title="Contact Support"
            subtitle="Get help from our team"
            onPress={() => console.log("Contact")}
          />
          <AccountItem
            icon="⭐"
            title="Rate App"
            subtitle="Share your feedback"
            onPress={() => console.log("Rate")}
            showBorder={false}
          />
        </AccountSection>

        {/* About */}
        <AccountSection title="About">
          <AccountItem
            icon="📄"
            title="Terms of Service"
            onPress={() => console.log("Terms")}
          />
          <AccountItem
            icon="🔐"
            title="Privacy Policy"
            onPress={() => console.log("Privacy Policy")}
          />
          <AccountItem
            icon="ℹ️"
            title="App Version"
            subtitle="1.2.3"
            rightElement={null}
            showBorder={false}
          />
        </AccountSection>

        {/* Sign Out */}
        <View className="mx-4 mb-20">
          <TouchableOpacity
            className={`rounded-xl px-4 py-4 ${
              isLoading ? "bg-gray-200" : "bg-red-50"
            }`}
            onPress={handleSignOut}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text 
              className={`text-center text-base font-medium ${
                isLoading ? "text-gray-500" : "text-red-600"
              }`}
            >
              {isLoading ? "Signing Out..." : "Sign Out"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View className="h-4" />
      </ScrollView>
    </ScreenLayout>
  );
};