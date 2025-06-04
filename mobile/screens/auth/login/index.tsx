
import "@/global.css";
import { api } from "@/api/api";
import React, { useState } from "react";
import { View, Text, TouchableWithoutFeedback, Image, Alert, Keyboard, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye } from "@/lib/icons/Eye";
import { EyeOff } from "@/lib/icons/EyeOff";
import axios from "axios";

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isInitializing } = useAuth();
  const router = useRouter();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      const response = await api.post("/user/login/", {
        email_or_username: data.usernameOrEmail,
        password: data.password,
      });

      const responseData = response.data;

      if (responseData?.access) {
        await login({
          id: responseData.id,
          username: responseData.username,
          email: responseData.email,
          profile_image: responseData.profile_image || undefined,
          token: responseData.access,
          refresh_token: responseData.refresh,
          rp: responseData.rp || null,
          staff: responseData.staff || false,
        });
        
        router.replace("/");
      } else {
        Alert.alert("Login Failed", "No access token received from server.");
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred";
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 400 || status === 401) {
          errorMessage = "Invalid credentials. Please try again.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Login Error", errorMessage);
    }
  };

  const handleSignUp = () => router.push("/verification");

  if (isInitializing) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-lightBlue-1">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 justify-between bg-lightBlue-1 p-6">
        <View className="flex-1">
          <View className="items-center mt-10">
            <Image
              source={require("@/assets/images/Logo.png")}
              className="w-30 h-30"
              resizeMode="contain"
            />
          </View>

          <Text className="text-[24px] font-PoppinsMedium text-center mt-7">Login Account</Text>

          <View className="mt-7 space-y-5">
            <Controller
              control={control}
              name="usernameOrEmail"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Input
                    className="h-[57px] font-PoppinsRegular"
                    placeholder="Username or Email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                  />
                  {errors.usernameOrEmail && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.usernameOrEmail.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="relative">
                  <Input
                    className="h-[57px] font-PoppinsRegular pr-12"
                    placeholder="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  {value.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <Eye /> : <EyeOff />}
                    </TouchableOpacity>
                  )}
                  {errors.password && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.password.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <TouchableOpacity onPress={() => router.push("/verifyemail")} className="items-end">
              <Text className="text-black font-PoppinsRegular text-[16px]">Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              className="bg-primaryBlue native:h-[57px]"
              size="lg"
              onPress={handleSubmit(handleLogin)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-PoppinsSemiBold text-[16px]">Log in</Text>
              )}
            </Button>
          </View>
        </View>

        <View className="flex-row justify-center gap-2 mt-4">
          <Text className="text-black font-PoppinsRegular text-[16px]">Not registered yet?</Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text className="text-black font-PoppinsMedium underline text-[16px]">Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
