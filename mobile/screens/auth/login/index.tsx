import "@/global.css";

import React, { useState } from "react";
import { View, Text, TouchableWithoutFeedback, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage"; // keep the users logged in after they close and reonpen the app 
import { Input } from "@/components/ui/input";
import { Eye } from "@/lib/icons/Eye";
import { EyeOff } from "@/lib/icons/EyeOff";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8000/account/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login Successful:", data);
        // Store the access token for future requests (AsyncStorage)
        await AsyncStorage.setItem("accessToken", data.access_token);
        await AsyncStorage.setItem("refreshToken", data.refresh_token);
        // router.push("/home"); // Navigate to Home or Dashboard
      } else {
        alert(data.error || "Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
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
            value={username}
            onChangeText={setUsername}
          />
          <View className="relative">
            <Input
              className="h-[57px] font-PoppinsRegular"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />

            {password.length >= 8 && (
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
          >
            <Text className="text-white font-PoppinsSemiBold text-[16px]">
              Log in
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
