import "@/global.css";
import { api } from "@/api/api";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await api.post("user/login/", {
        username: username,
        password: password,
      });

      if (response.data.token) { 
        await AsyncStorage.multiSet([
          ["authToken", response.data.token],
          ["userId", response.data.user_id.toString()],
          ["username", response.data.username],
          ["email", response.data.email],
          ["isLoggedIn", "true"]
        ]);

        Alert.alert("Success", "Login successful!");
        router.replace("/"); // Navigate to home screen after login
      } else {
        Alert.alert("Error", "Login failed - no token received");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          Alert.alert("Error", "Invalid username or password");
        } else if (error.response?.status === 400) {
          Alert.alert("Error", "Invalid request format");
        } else {
          Alert.alert("Error", "Server error. Please try again later.");
        }
      } else {
        Alert.alert("Error", "Network error. Please check your connection.");
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
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
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
          <TouchableWithoutFeedback onPress={() => router.push("/verifyemail")}>
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