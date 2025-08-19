import "@/global.css";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  TextInput,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form/form-input";
import { Eye} from "@/lib/icons/Eye";
import { EyeOff } from "@/lib/icons/EyeOff";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { useToastContext } from "@/components/ui/toast";
import { SignupOptions } from "./SignupOptions";
import { useAuth } from "@/contexts/AuthContext";
import GoogleIcon from "@/assets/images/google.svg";
import { signInSchema } from "@/form-schema/signin-schema";

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const { toast } = useToastContext();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupOptions, setShowSignupOptions] = useState(false);
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [phone, setPhone] = useState("");

  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    login,
    sendOtp,
    isLoading: authIsLoading,
    error,
    clearError,
  } = useAuth();

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

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, toast, clearError]);

  const handleEmailLogin = async () => {
    try {
      setEmailLoading(true);
      const isValid = await trigger();
      
      if (!isValid) {
        if (errors.email) toast.error(errors.email.message ?? "Invalid email");
        if (errors.password) toast.error(errors.password.message ?? "Invalid password");
        return;
      }

      const { email, password } = getValues();
      const response = await login(email, password);
      console.log("Response Value: ", response)
      toast.success("Welcome back");
      router.replace('/(tabs)')
    } catch (err) {
      console.error("Login failed:", err);
      toast.error("Login failed. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePhoneContinue = async () => {
    const phoneRegex = /^9\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.error("Please enter a valid mobile number starting with 9 and 10 digits long");
      return;
    }

    try {
      setPhoneLoading(true);
      await sendOtp(phone);
      toast.success(`OTP sent to 63${phone}`);
      router.push("/(auth)/otp");
    } catch (err) {
      console.error("Failed to send OTP:", err);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // await loginWithGoogle();
    } catch (err) {
      console.error("Google login failed:", err);
      toast.error("Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const dismissKeyboard = () => Keyboard.dismiss();
  const isAnyLoading = emailLoading || phoneLoading || googleLoading || authIsLoading;

  if (authIsLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-gray-600 font-PoppinsRegular mt-4">
          Signing you in...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1 bg-white"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingTop: 60, paddingBottom: 40 }}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View className="flex-1 px-5">
            {/* Logo */}
            <View className="items-center mt-7">
              <Image
                source={require("@/assets/images/Logo.png")}
                className="w-52 h-52"
              />
            </View>

            <View className="mt-6 items-center">
              <Text className="text-[24px] font-PoppinsSemiBold">Welcome!</Text>
            </View>

            {/* Form */}
            {!showPhoneLogin ? (
              <View className="mt-12">
                <FormInput
                  control={control}
                  name="email"
                  label="Email"
                  keyboardType="email-address"
                />
                <View className="relative">
                  <FormInput
                    control={control}
                    name="password"
                    label="Password"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isAnyLoading}
                    className="absolute right-5 top-1/2 -translate-y-1/4"
                  >
                    {showPassword ? (
                      <Eye className={isAnyLoading ? "text-gray-400" : "text-gray-700"} />
                    ) : (
                      <EyeOff className={isAnyLoading ? "text-gray-400" : "text-gray-700"} />
                    )}
                  </TouchableOpacity>
                </View>

                <Button
                  className={emailLoading || authIsLoading ? "bg-gray-400" : "bg-primaryBlue mt-4"}
                  size="lg"
                  onPress={handleEmailLogin}
                  disabled={isAnyLoading}
                >
                  <Text className="text-white font-PoppinsSemiBold text-[14px]">
                    {emailLoading || authIsLoading ? "Signing in..." : "Sign In"}
                  </Text>
                </Button>
              </View>
            ) : (
              <View className="mt-12">
                <Text className="font-PoppinsRegular text-gray-800 mb-2 text-[12px]">
                  Mobile Number
                </Text>
                <View className="flex-row items-center">
                  <View className="bg-gray-50 border border-gray-300 rounded-l-xl px-4 py-3 border-r-0">
                    <Text className="text-gray-800 font-PoppinsMedium text-[12px]">
                      +63
                    </Text>
                  </View>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    returnKeyType="done"
                    className="flex-1 font-PoppinsRegular text-[12px] text-gray-800 bg-gray-50 border border-gray-300 rounded-r-xl px-4 py-3"
                    placeholderTextColor="#999"
                    blurOnSubmit={true}
                    maxLength={10}
                    editable={!isAnyLoading}
                  />
                </View>

                <Button
                  className={phoneLoading || authIsLoading ? "bg-gray-400" : "bg-primaryBlue mt-4"}
                  size="lg"
                  onPress={handlePhoneContinue}
                  disabled={isAnyLoading}
                >
                  <Text className="text-white font-PoppinsSemiBold text-[15px]">
                    {phoneLoading || authIsLoading ? "Sending..." : "Continue"}
                  </Text>
                </Button>
              </View>
            )}

            {/* Toggle between Email & Phone login */}
            <TouchableOpacity
              onPress={() => setShowPhoneLogin(!showPhoneLogin)}
              disabled={isAnyLoading}
              className="mb-6 mt-6"
            >
              <Text className={`font-PoppinsMedium text-[13px] text-center ${isAnyLoading ? "text-gray-400" : "text-primaryBlue"}`}>
                {showPhoneLogin ? "Login with Email instead" : "Login via Phone Number"}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-[1px] bg-gray-300" />
              <Text className="mx-3 text-gray-500 font-PoppinsRegular">or</Text>
              <View className="flex-1 h-[1px] bg-gray-300" />
            </View>

            {/* Google Login */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={isAnyLoading}
              className={`flex-row items-center justify-center border border-gray-300 rounded-lg py-3 ${isAnyLoading ? "bg-gray-100" : "bg-white"}`}
              activeOpacity={0.7}
            >
              <GoogleIcon
                width={30}
                height={30}
                style={{ marginRight: 20, opacity: isAnyLoading ? 0.5 : 1 }}
              />
              <Text className={`font-PoppinsSemiBold text-[14px] ${isAnyLoading ? "text-gray-400" : "text-gray-800"}`}>
                {googleLoading ? "Signing in with Google..." : "Login with Google"}
              </Text>
            </TouchableOpacity>

            {/* Signup Option */}
            <View className="flex-row justify-center gap-2 mt-6">
              <Text className="text-gray-400 font-PoppinsRegular text-[12px]">
                Don't have an account?
              </Text>
              <TouchableOpacity
                onPress={() => setShowSignupOptions(true)}
                disabled={isAnyLoading}
                activeOpacity={0.6}
              >
                <Text className={`font-PoppinsMedium text-[12px] ${isAnyLoading ? "text-gray-400" : "text-primaryBlue"}`}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>

            <SignupOptions
              visible={showSignupOptions}
              onClose={() => setShowSignupOptions(false)}
            />
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}