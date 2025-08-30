import "@/global.css";
import React, { useState, useEffect, memo, useMemo } from "react";
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
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { RootState, AppDispatch } from "@/redux";
import { login, clearError, sendOtp } from "@/redux/authSlice";
import { ChevronLeft } from "lucide-react-native";

type SignInForm = z.infer<typeof signInSchema>;

export default function LoginScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth, shallowEqual);
  const { user, isAuthenticated, isLoading, error } = authState;

  const { toast } = useToastContext();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [phone, setPhone] = useState("");

  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const isAnyLoading = useMemo(
    () => emailLoading || phoneLoading || googleLoading || isLoading,
    [emailLoading, phoneLoading, googleLoading, isLoading]
  );

  // Redirect to main app if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success("Welcome!");
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, user, toast, router]);

  const handleEmailLogin = useMemo(
    () => async () => {
      try {
        setEmailLoading(true);
        const isValid = await trigger();

        if (!isValid) {
          if (errors.email)
            toast.error(errors.email.message ?? "Invalid email");
          if (errors.password)
            toast.error(errors.password.message ?? "Invalid password");
          return;
        }

        const { email, password } = getValues();
        const resultAction = await dispatch(login({ email, password }));

        if (login.fulfilled.match(resultAction)) {
          console.log("Login successful");
        } else {
          console.error("Login failed:", resultAction.payload);
        }
      } catch (err) {
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setEmailLoading(false);
      }
    },
    [trigger, errors, getValues, dispatch, toast]
  );

  const handlePhoneContinue = useMemo(
    () => async () => {
      const phoneRegex = /^9\d{9}$/;
      if (!phoneRegex.test(phone.trim())) {
        toast.error(
          "Please enter a valid mobile number starting with 9 and 10 digits long"
        );
        return;
      }

      try {
        setPhoneLoading(true);
        const fullPhoneNumber = `63${phone}`;
        const resultAction = await dispatch(sendOtp(fullPhoneNumber));

        if (sendOtp.fulfilled.match(resultAction)) {
          toast.success(`OTP sent to +${fullPhoneNumber}`);
          router.push({
            pathname: "/(auth)/PhoneOTP",
            params: { phoneNumber: fullPhoneNumber },
          });
        } else {
          console.error("Send OTP failed:", resultAction.payload);
        }
      } catch (err) {
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setPhoneLoading(false);
      }
    },
    [phone, dispatch, toast, router]
  );

  const handleGoogleLogin = useMemo(
    () => async () => {
      setGoogleLoading(true);
      try {
        toast.info("Google login coming soon!");
      } catch (err) {
        console.error("Google login failed:", err);
        toast.error("Google login failed");
      } finally {
        setGoogleLoading(false);
      }
    },
    [toast]
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

  // Show loading screen during authentication
  if (isLoading && !emailLoading && !phoneLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 font-PoppinsRegular mt-4 text-[16px]">
            Signing you in...
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
                    disabled={isAnyLoading}
                    className="flex-row items-center"
                    activeOpacity={0.7}
                  >
                    <ChevronLeft 
                      size={20} 
                      className={isAnyLoading ? "text-gray-400" : "text-slate-500"} 
                    />
                    <Text className={`text-[16px] font-PoppinsMedium ml-1 ${
                      isAnyLoading ? "text-gray-400" : "text-slate-500"
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
                      editable={!isAnyLoading}
                    />
                    
                    <View className="relative mb-6">
                      <FormInput
                        control={control}
                        name="password"
                        label="Password"
                        secureTextEntry={!showPassword}
                        editable={!isAnyLoading}
                      />
                      {passwordValue ? (
                        <TouchableOpacity
                          onPress={toggleShowPassword}
                          disabled={isAnyLoading}
                          className="absolute right-4 top-1/2 -translate-y-2"
                        >
                          {showPassword ? (
                            <Eye
                              size={20}
                              className={
                                isAnyLoading ? "text-gray-400" : "text-gray-600"
                              }
                            />
                          ) : (
                            <EyeOff
                              size={20}
                              className={
                                isAnyLoading ? "text-gray-400" : "text-gray-600"
                              }
                            />
                          )}
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    <Button
                      className={`h-20 rounded-xl flex items-center justify-center ${
                        emailLoading || isLoading
                          ? "bg-gray-400"
                          : "bg-blue-600"
                      }`}
                      onPress={handleEmailLogin}
                      disabled={isAnyLoading}
                    >
                      <View className="flex-row items-center justify-center h-20">
                        {(emailLoading || isLoading) && (
                          <ActivityIndicator
                            size="small"
                            color="white"
                            style={{ marginRight: 8 }}
                          />
                        )}
                        <Text className="text-white font-PoppinsSemiBold text-[14px]">
                          {emailLoading || isLoading ? "Signing in..." : "Sign In"}
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
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="9XX XXX XXXX"
                        keyboardType="phone-pad"
                        returnKeyType="done"
                        className="flex-1 font-PoppinsRegular text-[16px] text-gray-800 bg-gray-50 border border-gray-300 rounded-r-xl px-4 py-4"
                        placeholderTextColor="#9CA3AF"
                        blurOnSubmit={true}
                        maxLength={10}
                        editable={!isAnyLoading}
                      />
                    </View>

                    <Button
                      className={`h-14 rounded-xl flex items-center justify-center ${
                        phoneLoading || isLoading
                          ? "bg-gray-400"
                          : "bg-blue-600"
                      }`}
                      onPress={handlePhoneContinue}
                      disabled={isAnyLoading}
                    >
                      <View className="flex-row items-center justify-center h-full">
                        {(phoneLoading || isLoading) && (
                          <ActivityIndicator
                            size="small"
                            color="white"
                            style={{ marginRight: 8 }}
                          />
                        )}
                        <Text className="text-white font-PoppinsSemiBold text-[16px]">
                          {phoneLoading || isLoading ? "Sending..." : "Continue"}
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
                  disabled={isAnyLoading}
                  className="mb-6"
                >
                  <Text
                    className={`font-PoppinsMedium text-[14px] text-center ${
                      isAnyLoading ? "text-gray-400" : "text-blue-600"
                    }`}
                  >
                    {showPhoneLogin
                      ? "← Use Email instead"
                      : "Use Phone Number instead"}
                  </Text>
                </TouchableOpacity>

                {/* Google Login */}
                <TouchableOpacity
                  onPress={handleGoogleLogin}
                  disabled={isAnyLoading}
                  className={`flex-row items-center justify-center border border-gray-300 rounded-xl py-4 mb-8 ${
                    isAnyLoading ? "bg-gray-50" : "bg-white"
                  }`}
                  activeOpacity={0.7}
                >
                  <GoogleIcon
                    width={24}
                    height={24}
                    style={{ marginRight: 12, opacity: isAnyLoading ? 0.5 : 1 }}
                  />
                  {googleLoading && (
                    <ActivityIndicator
                      size="small"
                      color="#4285F4"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text
                    className={`font-normal text-[16px] ${
                      isAnyLoading ? "text-gray-400" : "text-gray-800"
                    }`}
                  >
                    {googleLoading
                      ? "Signing in..."
                      : "Continue with Google"}
                  </Text>
                </TouchableOpacity>

                {/* Signup Option - Moved below Google login */}
                <View className="flex-row justify-center items-center">
                  <Text className="text-gray-600 font-PoppinsRegular text-[14px]">
                    Don't have an account? 
                  </Text>
                  <TouchableOpacity
                    onPress={handleGoToSignup}
                    disabled={isAnyLoading}
                    activeOpacity={0.6}
                    className="ml-1"
                  >
                    <Text
                      className={`font-PoppinsSemiBold text-[14px] ${
                        isAnyLoading ? "text-gray-400" : "text-blue-600"
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