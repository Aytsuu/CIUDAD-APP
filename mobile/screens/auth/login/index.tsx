import "@/global.css";
import { api } from "@/api/api";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Input } from "@/components/ui/input";
import { Eye } from "@/lib/icons/Eye";
import { EyeOff } from "@/lib/icons/EyeOff";
import { z } from "zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import ScreenLayout from "@/screens/_ScreenLayout";
import { useToastContext } from "@/components/ui/toast";
import { SignupOptions } from "./SignupOptions";
import { useAuth } from "@/contexts/AuthContext";
import { signInSchema } from "@/form-schema/signin-schema";

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const { toast } = useToastContext();
  const router = useRouter();
import { z } from "zod";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupOptions, setShowSignupOptions] = useState(false);

  const defaultValues: Partial<SignInForm> = generateDefaultValues(signInSchema);
  const {
    control,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues,
  });

  const { login, isLoading, isAuthenticated, user, error, clearError } = useAuth();

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success("Welcome back!");
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, user, router, toast]);

  // Handle auth errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, toast, clearError]);

  const handleLogin = async () => {
    // Clear any previous errors
    clearError();
    
    const isValid = await trigger();
    if (!isValid) {
      if (errors.email) {
        toast.error(errors.email.message ?? "Invalid email");
      } else if (errors.password) {
        toast.error(errors.password.message ?? "Invalid password");
      }
      return;
    }

    const { email, password } = getValues();

    try {
      await login(email, password);
      // Success handling is now done in useEffect above
    } catch (error: any) {
      // Error handling is now done in useEffect above
      console.error("Login failed:", error);
    }
  };

  return (
    <ScreenLayout 
      showExitButton={false}
      showBackButton={false}
    >
      <View className="flex-1">
        <View className="items-center mt-7">
          <Image source={require("@/assets/images/Logo.png")} className="w-24 h-24" />
        </View>

        <View className="mt-6 items-center">
          <Text className="text-[24px] font-PoppinsMedium">Welcome back</Text>
        </View>

        <View className="flex-grow mt-6">
          <FormInput
            control={control}
            name="email"
            label="Email"
            keyboardType="email-address"
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
            <TouchableWithoutFeedback 
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <View className="absolute right-5 top-1/2 transform -translate-y-1/2">
                {showPassword ? 
                  <Eye className={`${isLoading ? 'text-gray-400' : 'text-gray-700'}`} /> : 
                  <EyeOff className={`${isLoading ? 'text-gray-400' : 'text-gray-700'}`} />
                }
              </View>
            </TouchableWithoutFeedback>
          </View>

          <TouchableWithoutFeedback 
            onPress={() => router.push("/forgot-password")}
            disabled={isLoading}
          >
            <View className="flex-row justify-end mt-3 mb-4">
              <Text className={`font-PoppinsMedium text-[13px] ${
                isLoading ? 'text-gray-400' : 'text-primaryBlue'
              }`}>
                Forgot Password?
              </Text>
            </View>
          </TouchableWithoutFeedback>

          <Button
            className={`${isLoading ? 'bg-gray-400' : 'bg-primaryBlue'}`}
            size="lg"
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-white font-PoppinsSemiBold text-[14px]">
              {isLoading ? "Signing in..." : "Sign In"}
            </Text>
          </Button>
        </View>

        <View className="flex-row justify-center gap-2 mt-8 mb-6">
          <Text className="text-gray-600 font-PoppinsRegular text-[13px]">
            Don't have an account?
          </Text>
          <TouchableWithoutFeedback 
            onPress={() => setShowSignupOptions(true)}
            disabled={isLoading}
          >
            <Text className={`font-PoppinsMedium text-[13px] ${
              isLoading ? 'text-gray-400' : 'text-primaryBlue'
            }`}>
              Sign up
            </Text>
          </TouchableWithoutFeedback>
        </View>

        <SignupOptions
          visible={showSignupOptions}
          onClose={() => setShowSignupOptions(false)}
        />
      </View>
    </ScreenLayout>
  );
}