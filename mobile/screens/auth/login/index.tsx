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
import { SignupOptions } from "./SignupOptions";
import GoogleIcon from "@/assets/images/google.svg";
import { signInSchema } from "@/form-schema/signin-schema";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { RootState, AppDispatch } from "@/redux";
import { login, clearError, sendOtp } from "@/redux/authSlice";
import CiudadLogo from "@/assets/images/CIUDADLogo.svg";

type SignInForm = z.infer<typeof signInSchema>;

const SignupOptionsMemo = memo(SignupOptions);

const contentContainerStyle = {
  flexGrow: 1,
  paddingTop: 60,
  paddingBottom: 40,
};

const keyboardAvoidingViewStyle = { flex: 1 };

export default function SignInScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth, shallowEqual);
  const { user, isAuthenticated, isLoading, error } = authState;

  const { toast } = useToastContext();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showSignupOptions, setShowSignupOptions] = useState(false);
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

  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success("Welcome!");
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, user]);

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
          setShowSignupOptions(false); // Hide signup options after successful login
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
  const handleShowSignupOptions = useMemo(
    () => () => setShowSignupOptions(true),
    []
  );
  const handleCloseSignupOptions = useMemo(
    () => () => setShowSignupOptions(false),
    []
  );

  if (isLoading && !emailLoading && !phoneLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="text-gray-600 font-PoppinsRegular mt-4">
          Signing you in...
        </Text>
      </View>
    );
  }

  const passwordValue = getValues("password");

  return (
    <KeyboardAvoidingView
      style={keyboardAvoidingViewStyle}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1 bg-white"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={contentContainerStyle}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View className="flex-1 px-5">
            {/* Logo */}
            <View className="items-center mt-7">
              <CiudadLogo width={208} height={208} />
            </View>

            <View className="items-center">
              <Text className="text-[24px] font-PoppinsSemiBold text-gray-800">
                Welcome!
              </Text>
              <Text className="text-[12px] font-PoppinsSemiBold text-gray-500">
                Login to continue
              </Text>
            </View>

            {/* Form */}
            {!showPhoneLogin ? (
              <View className="mt-4">
                <FormInput
                  control={control}
                  name="email"
                  label="Email"
                  keyboardType="email-address"
                  editable={!isAnyLoading}
                />
                <View className="relative">
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
                      className="absolute right-5 top-1/2 -translate-y-1/4"
                    >
                      {showPassword ? (
                        <Eye
                          className={
                            isAnyLoading ? "text-gray-400" : "text-gray-700"
                          }
                        />
                      ) : (
                        <EyeOff
                          className={
                            isAnyLoading ? "text-gray-400" : "text-gray-700"
                          }
                        />
                      )}
                    </TouchableOpacity>
                  ) : null}
                </View>

                <Button
                  className={
                    emailLoading || isLoading
                      ? "bg-gray-400 mt-4"
                      : "bg-primaryBlue mt-4"
                  }
                  size="lg"
                  onPress={handleEmailLogin}
                  disabled={isAnyLoading}
                >
                  <View className="flex-row items-center justify-center">
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
              <View className="mt-4">
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
                  className={
                    phoneLoading || isLoading
                      ? "bg-gray-400 mt-4"
                      : "bg-primaryBlue mt-4"
                  }
                  size="lg"
                  onPress={handlePhoneContinue}
                  disabled={isAnyLoading}
                >
                  <View className="flex-row items-center justify-center">
                    {(phoneLoading || isLoading) && (
                      <ActivityIndicator
                        size="small"
                        color="white"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Text className="text-white font-PoppinsSemiBold text-[15px]">
                      {phoneLoading || isLoading ? "Sending..." : "Continue"}
                    </Text>
                  </View>
                </Button>
              </View>
            )}

            {/* Divider */}
            <View className="flex-row items-center my-8 mt-12">
              <View className="flex-1 h-[1px] bg-gray-300" />
              <Text className="mx-3 text-gray-500 font-PoppinsRegular text-[12px]">
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
                className={`font-PoppinsMedium text-[13px] text-center ${
                  isAnyLoading ? "text-gray-400" : "text-primaryBlue"
                }`}
              >
                {showPhoneLogin
                  ? "Login with Email instead"
                  : "Login via Phone Number"}
              </Text>
            </TouchableOpacity>

            {/* Google Login */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={isAnyLoading}
              className={`flex-row items-center justify-center border border-gray-300 rounded-lg py-3 mt-6 ${
                isAnyLoading ? "bg-gray-100" : "bg-white"
              }`}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <GoogleIcon
                  width={20}
                  height={20}
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
                  className={`font-PoppinsSemiBold text-[14px] ${
                    isAnyLoading ? "text-gray-400" : "text-gray-800"
                  }`}
                >
                  {googleLoading
                    ? "Signing in with Google..."
                    : "Login with Google"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Signup Option */}
            {!isLoading && !isAuthenticated && (
              <View className="flex-row justify-center items-center gap-2 mt-6">
                <Text className="text-gray-400 font-PoppinsRegular text-[12px]">
                  Don't have an account?
                </Text>
                <TouchableOpacity
                  onPress={handleShowSignupOptions}
                  disabled={isAnyLoading}
                  activeOpacity={0.6}
                >
                  <Text
                    className={`font-PoppinsMedium text-[12px] ${
                      isAnyLoading ? "text-gray-400" : "text-primaryBlue"
                    }`}
                  >
                    Sign up
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <SignupOptionsMemo
              visible={showSignupOptions}
              onClose={handleCloseSignupOptions}
            />
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}