import "@/global.css";

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Input } from "@/components/ui/input";
import { Eye } from "@/lib/icons/Eye";
import { EyeOff } from "@/lib/icons/EyeOff";
import axios from "axios";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Send a GET request to the backend with email and password as query parameters
      const response = await axios.get("http://192.168.1.55:8000/api/login/", {
        params: {
          email: email,
          password: password,
        },
      });
  
      if (response.data.success) {
        await AsyncStorage.setItem("isLoggedIn", "true");
        await AsyncStorage.setItem("userEmail", email);
  
        Alert.alert("Success", "Login successful!");
      } else {
        Alert.alert("Error", response.data.message || "No Account Matched!");
      }
    } catch (error) {
      // Suppress the error logging and only show an alert
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          // Invalid password
          Alert.alert("Error", "Invalid password.");
        } else if (error.response?.status === 404) {
          // User not found
          Alert.alert("Error", "No account found with this email.");
        } else {
          // Other errors
          Alert.alert("Error", "Something went wrong. Please try again.");
        }
      } else {
        // Non-Axios errors
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/verification");
  };

  return (
    <SafeAreaView className="flex-1 justify-between bg-lightBlue-1 p-[24px]">
      <View className="flex-1 flex-col">
        <View className="items-center justify-center mt-10">
          <Image
            source={require("@/assets/images/Logo.png")}
            className="w-30 h-30"
          />
        </View>
        <View className="flex-row justify-center mt-7">
          <Text className="text-[24px] font-PoppinsMedium">Login Account</Text>
        </View>
        <View className="flex-grow gap-5 mt-7">
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="Username/Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View className="relative">
            <Input
              className="h-[57px] font-PoppinsRegular"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            {password.length > 0 && (
              <TouchableWithoutFeedback
                onPress={() => setShowPassword(!showPassword)}
              >
                <View className="absolute right-5 top-1/2 transform -translate-y-1/2">
                  {showPassword ? (
                    <Eye className="text-gray-700" />
                  ) : (
                    <EyeOff className="text-gray-700" />
                  )}
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>
          <TouchableWithoutFeedback>
            <View className="flex-row justify-end">
              <Text className="text-black font-PoppinsRegular text-[16px]">
                Forgot Password?
              </Text>
            </View>
          </TouchableWithoutFeedback>

          <Button
            className="bg-primaryBlue native:h-[57px]"
            size={"lg"}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-white font-PoppinsSemiBold text-[16px]">
              {isLoading ? "Logging in..." : "Log in"}
            </Text>
          </Button>
        </View>
      </View>

      <View className="flex-row justify-center gap-2">
        <Text className="text-black font-PoppinsRegular text-[16px] ">
          Not registered yet?
        </Text>
        <TouchableWithoutFeedback onPress={handleSignUp}>
          <Text className="text-black font-PoppinsMedium underline text-[16px]">
            Register
          </Text>
        </TouchableWithoutFeedback>
      </View>
    </SafeAreaView>
  );
}