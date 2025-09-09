import "@/global.css";
import React, { useState, useEffect, memo, useMemo } from "react";
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Image, TextInput, Keyboard, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form/form-input";
import { Eye } from "@/lib/icons/Eye";
import { EyeOff } from "@/lib/icons/EyeOff";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { useToastContext } from "@/components/ui/toast";
import GoogleIcon from "@/assets/images/google.svg";
import { signInSchema } from "@/form-schema/signin-schema";
import { ChevronLeft } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext"; 

type SignInForm = z.infer<typeof signInSchema>;     

export default function LoginScreen() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    hasCheckedAuth,
    phone,
    login,
    sendOTP,
    loginLoading,
    otpLoading
  } = useAuth(); 

  const { toast } = useToastContext();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);

  const defaultValues = useMemo(() => generateDefaultValues(signInSchema), []);
  const {
    control,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues,
  }); 

  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success("Welcome!");
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, user, toast, router]);

  const handleEmailLogin = useMemo(
    () => async () => {
      try {
        const isValid = await trigger();

        if (!isValid) {
          if (errors.email)
            toast.error(errors.email.message ?? "Invalid email");
          if (errors.password)
            toast.error(errors.password.message ?? "Invalid password");
          return;
        }

        const { email, password } = getValues();
        
        const user = await login({ email, password });
        
        if (user) {
          console.log('✅ Login successful for user:', user.email);
        }
      } catch (err) {
        console.error("Login error:", err);
      }
    },
    [trigger, errors, getValues, toast, login]
  );

  const handlePhoneContinue = useMemo(() => async () => {
      try {
        const fullPhoneNumber = `63${phone}`;
        
        const success = await sendOTP(fullPhoneNumber);

        if (success) {
          toast.success(`OTP sent to +${fullPhoneNumber}`);
          router.push({
            pathname: "/(auth)/PhoneOTP",
            params: { phoneNumber: fullPhoneNumber },
          });
        } else {
          toast.error("Failed to send OTP. Please try again.");
        }
      } catch (err) {
        console.error("Phone OTP error:", err);
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
    [phone, toast, router, sendOTP]
  );

  const dismissKeyboard = useMemo(() => () => Keyboard.dismiss(), []);
  
  const toggleShowPassword = useMemo(
    () => () => setShowPassword(!showPassword),
    [showPassword]
  );
  
  const togglePhoneLogin = useMemo(
    () => () => setShowPhoneLogin(!showPhoneLogin),
    [showPhoneLogin]
  );

  const handleBackToWelcome = useMemo(
    () => () => router.back(),
    [router]
  );

  const handleGoToSignup = useMemo(
    () => () => router.push("/(auth)"),
    [router]
  );

  // Show loading screen during initial authentication check
  if (!hasCheckedAuth) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 font-PoppinsRegular mt-4 text-[16px]">
            Checking authentication...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const passwordValue = getValues("password");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View className="flex-1 px-6">
              {/* Header with Back Button */}
             <View className=" pt-4 pb-8">
                <View className="flex-row items-center justify-between">
                  <TouchableOpacity
                    onPress={handleBackToWelcome}
                    disabled={loginLoading}
                    className="flex-row items-center"
                    activeOpacity={0.7}
                  >
                    <ChevronLeft 
                      size={20} 
                      className={isLoading ? "text-gray-400" : "text-slate-500"} 
                    />
                    <Text className={`text-[16px] font-PoppinsMedium ml-1 ${
                      isLoading ? "text-gray-400" : "text-slate-500"
                    }`}>
                    </Text>
                  </TouchableOpacity>
                  <View />
                </View>
              </View>

              {/* Main Header */}
              <View className="items-center mb-12">
                <Text className="text-[32px] font-PoppinsBold text-gray-900 mb-2">
                  Welcome Back
                </Text>
                <Text className="text-[16px] font-PoppinsRegular text-gray-600">
                  Sign in to your account
                </Text>
              </View>

              {/* Login Forms */}
              <View className="flex-1">
                {!showPhoneLogin ? (
                  // Email Login Form
                  <View className="mb-6">
                    <FormInput
                      control={control}
                      name="email"
                      label="Email Address"
                      keyboardType="email-address"
                      editable={!loginLoading}
                    />
                    
                    <View className="relative mb-6">
                      <FormInput
                        control={control}
                        name="password"
                        label="Password"
                        secureTextEntry={!showPassword}
                        editable={!loginLoading}
                      />
                      {passwordValue ? (
                        <TouchableOpacity
                          onPress={toggleShowPassword}
                          disabled={loginLoading}
                          className="absolute right-4 top-1/2 -translate-y-2"
                        >
                          {showPassword ? (
                            <Eye
                              size={20}
                              className={
                                isLoading ? "text-gray-400" : "text-gray-600"
                              }
                            />
                          ) : (
                            <EyeOff
                              size={20}
                              className={
                                isLoading ? "text-gray-400" : "text-gray-600"
                              }
                            />
                          )}
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    <Button
                      className={`h-20 rounded-xl flex items-center justify-center ${
                        loginLoading
                          ? "bg-gray-400"
                          : "bg-blue-600"
                      }`}
                      onPress={handleEmailLogin}
                      disabled={loginLoading}
                    >
                      <View className="flex-row items-center justify-center h-20">
                        {loginLoading && (
                          <ActivityIndicator
                            size="small"
                            color="white"
                            style={{ marginRight: 8 }}
                          />
                        )}
                        <Text className="text-white font-PoppinsSemiBold text-[14px]">
                          {loginLoading ? "Signing in..." : "Sign In"}
                        </Text>
                      </View>
                    </Button>
                  </View>
                ) : (
                  // Phone Login Form
                  <View className="mb-6">
                    <Text className="font-normal text-black/80 mb-3 text-[13px]">
                      Mobile Number
                    </Text>
                    <View className="flex-row mb-6">
                      <View className="bg-gray-50 border border-gray-300 rounded-l-xl px-4 py-4 border-r-0 justify-center">
                        <Text className="text-gray-800 font-PoppinsMedium text-[16px]">
                          +63
                        </Text>
                      </View>
                      <TextInput
                        // value={phone}
                        // onChangeText={setPhone}
                        placeholder="9XX XXX XXXX"
                        keyboardType="phone-pad"
                        returnKeyType="done"
                        className="flex-1 font-PoppinsRegular text-[16px] text-gray-800 bg-gray-50 border border-gray-300 rounded-r-xl px-4 py-4"
                        placeholderTextColor="#9CA3AF"
                        blurOnSubmit={true}
                        maxLength={10}
                        editable={!isLoading}
                      />
                    </View>

                    <Button
                      className={`h-14 rounded-xl flex items-center justify-center ${
                        otpLoading
                          ? "bg-gray-400"
                          : "bg-blue-600"
                      }`}
                      onPress={handlePhoneContinue}
                      disabled={loginLoading}
                    >
                      <View className="flex-row items-center justify-center h-full">
                        {otpLoading && (
                          <ActivityIndicator
                            size="small"
                            color="white"
                            style={{ marginRight: 8 }}
                          />
                        )}
                        <Text className="text-white font-PoppinsSemiBold text-[16px]">
                          {otpLoading ? "Sending..." : "Continue"}
                        </Text>
                      </View>
                    </Button>
                  </View>
                )}

                {/* Divider */}
                <View className="flex-row items-center my-8">
                  <View className="flex-1 h-[1px] bg-gray-300" />
                  <Text className="mx-4 text-gray-500 font-PoppinsRegular text-[14px]">
                    or
                  </Text>
                  <View className="flex-1 h-[1px] bg-gray-300" />
                </View>

                {/* Toggle between Email & Phone login */}
                <TouchableOpacity
                  onPress={togglePhoneLogin}
                  disabled={loginLoading}
                  className="mb-6"
                >
                  <Text
                    className={`font-PoppinsMedium text-[14px] text-center ${
                      loginLoading ? "text-gray-400" : "text-blue-600"
                    }`}
                  >
                    {showPhoneLogin
                      ? "← Use Email instead"
                      : "Use Phone Number instead"}
                  </Text>
                </TouchableOpacity>

                {/* Signup Option - Moved below Google login */}
                <View className="flex-row justify-center items-center">
                  <Text className="text-gray-600 font-PoppinsRegular text-[14px]">
                    Don't have an account? 
                  </Text>
                  <TouchableOpacity
                    onPress={handleGoToSignup}
                    disabled={loginLoading}
                    activeOpacity={0.6}
                    className="ml-1"
                  >
                    <Text
                      className={`font-PoppinsSemiBold text-[14px] ${
                        loginLoading ? "text-gray-400" : "text-blue-600"
                      }`}
                    >
                      Sign up
                    </Text>
                  </TouchableOpacity>
                  </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}