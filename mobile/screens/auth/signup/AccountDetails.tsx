import "@/global.css";
import React, { useState } from "react";
import { View, Text, TouchableWithoutFeedback, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import _ScreenLayout from "@/screens/_ScreenLayout";
import { Eye } from "@/lib/icons/Eye";
import { EyeOff } from "@/lib/icons/EyeOff";
import { z } from "zod";
import { RegistrationFormSchema } from "@/form-schema/registration-schema";
import axios from "axios";

export default function AccountDetails() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [rePass, setRePass] = useState("");
  const [errors, setErrors] = useState<z.ZodError | null>(null);

  const handleProceed = async () => {
    // Validate user input
    // const validationResult = RegistrationFormSchema.userAccount.safeParse(RegistrationFormSchema);
  
    if (!RegistrationFormSchema.userAccount.password || !rePass) {
      setErrors(null);
      alert("Please complete all required fields.");
      return;
    }
  
    if (RegistrationFormSchema.accountDetails.password !== rePass) {
      alert("Passwords do not match.");
      return;
    }
  
    if (validationResult.success) {
      setErrors(null);
  
      try {
        // Send data to the backend
        const response = await axios.post("http://localhost:8000/api/signup/", {
          username: RegistrationFormSchema.accountDetails.userName,
          email: RegistrationFormSchema.accountDetails.email,
          password: RegistrationFormSchema.accountDetails.password,
          password2: RegistrationFormSchema.accountDetails.password 
        });
  
        if (response.status === 201) {
          Alert.alert("Success", "Account created successfully!");
          router.push("/personal-information");
        } else {
          Alert.alert("Error", "Failed to create account.");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.message || "Something went wrong.";
          Alert.alert("Error", errorMessage);
        } else {
          console.error("Error:", error);
          Alert.alert("Error", "Something went wrong. Please try again.");
        }
      }
    } else {
      setErrors(validationResult.error);
      alert("Please complete all required fields correctly.");
    }
  };

  return (
    <_ScreenLayout header={"Account Details"} description={"Please fill out all required fields."}>
      <View className="flex-1">
        <View className="flex-1 flex-col gap-3">
          {/* Username Input */}
          <View>
            <Text className="text-[15px] font-PoppinsRegular">Username</Text>
            <Input
              className="h-[57px] font-PoppinsRegular"
              placeholder="Username"
              value={RegistrationFormSchema.accountDetails.userName}
              onChangeText={()=>{}}
            />
          </View>

          {/* Email Input */}
          <View>
            <Text className="text-[15px] font-PoppinsRegular">Email</Text>
            <Input
              className="h-[57px] font-PoppinsRegular"
              placeholder="Email"
              value={RegistrationFormSchema.accountDetails.email}
              onChangeText={()=>{}}
            />
          </View>

          {/* Password Input */}
          <View>
            <Text className="text-[15px] font-PoppinsRegular">Password</Text>
            <View className="relative">
              <Input
                className="h-[57px] font-PoppinsRegular"
                placeholder="Password"
                value={RegistrationFormSchema.accountDetails.password}
                onChangeText={() => {}}
                secureTextEntry={!showPassword}
              />

              {RegistrationFormSchema.accountDetails.password.length >= 8 && (
                <TouchableWithoutFeedback onPress={() => setShowPassword(!showPassword)}>
                  <View className="absolute right-5 top-1/2 transform -translate-y-1/2">
                    {showPassword ? <Eye className="text-gray-700" /> : <EyeOff className="text-gray-700" />}
                  </View>
                </TouchableWithoutFeedback>
              )}
            </View>
          </View>

          {/* Re-enter Password Input */}
          <View>
            <Text className="text-[15px] font-PoppinsRegular">Re-enter Password</Text>
            <View className="relative">
              <Input
                className="h-[57px] font-PoppinsRegular"
                placeholder="Re-enter Password"
                value={rePass}
                onChangeText={setRePass}
                secureTextEntry={!showRePassword}
              />

              {rePass.length > 0 && (
                <TouchableWithoutFeedback onPress={() => setShowRePassword(!showRePassword)}>
                  <View className="absolute right-5 top-1/2 transform -translate-y-1/2">
                    {showRePassword ? <Eye className="text-gray-700" /> : <EyeOff className="text-gray-700" />}
                  </View>
                </TouchableWithoutFeedback>
              )}
            </View>
          </View>

          {/* Display Errors */}
          {errors && (
            <View>
              {errors.errors.map((error, index) => (
                <Text key={index} className="text-red-500">
                  {error.message}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Next Button */}
        <View>
          <Button onPress={handleProceed} className="bg-primaryBlue native:h-[57px]">
            <Text className="text-white font-bold text-[16px]">Next</Text>
          </Button>
        </View>
      </View>
    </_ScreenLayout>
  );
}
