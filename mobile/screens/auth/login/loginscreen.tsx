import "@/global.css";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import PageLayout from "@/screens/_PageLayout";
import { router, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { TouchableOpacity, View, Text, ScrollView, Alert } from "react-native";
import PhoneOTP from "../signup/account/PhoneOTP";
import EmailOTP from "../signup/account/EmailOTP";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { FormInput } from "@/components/ui/form/form-input";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/components/ui/toast";

export default function Login() {
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [loginMethod, setLoginMethod] = React.useState<"phone" | "email">("phone");
  const {control, getValues} = useRegistrationFormContext();
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const {toast} = useToastContext();

  const handleOTPVerified = () => {
    setCurrentStep(2);
  };

  // useEffect(() => {
  //   if(isAuthenticated && user){
  //     toast.success("Welcome!");
  //     router.replace("/(tabs)");
  //   } 
  // }, [user, isAuthenticated, router, toast]);

  const handleLogin = async () => {
    try {
      const values = getValues();
      const {accountFormSchema} = values;
      
      const result = await login({
        ...(loginMethod == "phone" ? { 
          phone: accountFormSchema.phone
        } : {
          email: accountFormSchema.email
        }),
        password: accountFormSchema.password,
      });
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert("Error", "Incorrect password or login failed");
    }
  };

  return (
    <PageLayout
      leftAction={
        currentStep == 2 ?
        <TouchableOpacity
          onPress={() => {
            if (currentStep > 1) {
              setCurrentStep((prev) => prev - 1);
            } else {
              router.back();
            }
          }}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          accessibilityLabel="Go back"
        > 
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
        : 
        <View className="w-10 h-10" />
      }
      headerTitle={
        <View>
        </View>
      }
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        className="flex-1"
      >

        {currentStep === 1 && (
          <View className="flex-1">
            {loginMethod === "phone" ? (
              <PhoneOTP
                params={{
                  next: handleOTPVerified,
                  signin: true,
                  switch: () => setLoginMethod("email")
                }}
              />
            ) : (
              <EmailOTP
                params={{
                  next: handleOTPVerified,
                  signin: true,
                  switch: () => {
                    setLoginMethod("phone")
                  }
                }}
              />
            )}
          </View>
        )}

        {currentStep === 2 && (
          <View className="flex-1 px-5 pt-10">
            <Text className="text-gray-600 mb-8">
              Please enter your account password to complete login
            </Text>

            <View className="mb-6">
              <FormInput
                control={control}
                name="accountFormSchema.password"
                label="Password"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              className="bg-blue-600 py-4 rounded-xl mb-4"
              onPress={handleLogin}
            >
              <Text className="text-white font-semibold text-center text-lg">
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-3">
              <Text className="text-blue-600 text-center font-medium">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
}