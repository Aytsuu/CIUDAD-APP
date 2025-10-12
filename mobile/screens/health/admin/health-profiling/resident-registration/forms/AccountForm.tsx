import React from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { Eye, EyeOff, Mail, Phone, Lock } from "lucide-react-native";
import { Button } from "@/components/ui/button";

interface AccountFormProps {
  form: UseFormReturn<any>;
  onNext: (stepId: number, isComplete: boolean) => void;
}

export default function AccountForm({ form, onNext }: AccountFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const { 
    register, 
    setValue, 
    watch, 
    formState: { errors } 
  } = form;

  const accountValues = watch("accountSchema");

  const validateAndNext = () => {
    const { email, phone, password, confirmPassword } = accountValues || {};
    
    // Check if all required fields are filled
    const isComplete = !!(
      email && 
      phone && 
      password && 
      confirmPassword &&
      password === confirmPassword
    );

    onNext(1, isComplete);
  };

  const validateSkip = () => {
    // Clear account schema data
    setValue("accountSchema", {
      email: "",
      phone: "",
      password: "",
      confirmPassword: ""
    });
    
    onNext(1, false);
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50" 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View className="px-5 py-6">
        {/* Info Card */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <Text className="text-blue-900 font-semibold mb-1">Account Setup</Text>
          <Text className="text-blue-700 text-sm">
            Create login credentials for this resident. This step is optional but recommended for online access.
          </Text>
        </View>

        {/* Email Field */}
        <View className="mb-5">
          <Text className="text-gray-700 font-semibold mb-2">Email Address</Text>
          <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4 py-3">
            <Mail size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              placeholder="juan.delacruz@example.com"
              value={accountValues?.email || ""}
              onChangeText={(text) => setValue("accountSchema.email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {(errors?.accountSchema as any)?.email && (
            <Text className="text-red-500 text-xs mt-1">
              {(errors.accountSchema as any).email.message as string}
            </Text>
          )}
        </View>

        {/* Phone Field */}
        <View className="mb-5">
          <Text className="text-gray-700 font-semibold mb-2">Phone Number</Text>
          <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4 py-3">
            <Phone size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              placeholder="09171234567"
              value={accountValues?.phone || ""}
              onChangeText={(text) => setValue("accountSchema.phone", text)}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>
          {(errors?.accountSchema as any)?.phone && (
            <Text className="text-red-500 text-xs mt-1">
              {(errors.accountSchema as any).phone.message as string}
            </Text>
          )}
        </View>

        {/* Password Field */}
        <View className="mb-5">
          <Text className="text-gray-700 font-semibold mb-2">Password</Text>
          <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4 py-3">
            <Lock size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              placeholder="Enter password"
              value={accountValues?.password || ""}
              onChangeText={(text) => setValue("accountSchema.password", text)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
          {(errors?.accountSchema as any)?.password && (
            <Text className="text-red-500 text-xs mt-1">
              {(errors.accountSchema as any).password.message as string}
            </Text>
          )}
        </View>

        {/* Confirm Password Field */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Confirm Password</Text>
          <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4 py-3">
            <Lock size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              placeholder="Re-enter password"
              value={accountValues?.confirmPassword || ""}
              onChangeText={(text) => setValue("accountSchema.confirmPassword", text)}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
          {(errors?.accountSchema as any)?.confirmPassword && (
            <Text className="text-red-500 text-xs mt-1">
              {(errors.accountSchema as any).confirmPassword.message as string}
            </Text>
          )}
        </View>

        {/* Password Requirements */}
        <View className="bg-gray-100 rounded-xl p-4 mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Password Requirements:</Text>
          <Text className="text-gray-600 text-sm">• At least 6 characters</Text>
          <Text className="text-gray-600 text-sm">• One uppercase letter</Text>
          <Text className="text-gray-600 text-sm">• One lowercase letter</Text>
          <Text className="text-gray-600 text-sm">• One number</Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={validateSkip}
            className="flex-1 bg-gray-200 rounded-xl py-4 items-center"
          >
            <Text className="text-gray-700 font-semibold">Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={validateAndNext}
            className="flex-1 bg-blue-600 rounded-xl py-4 items-center"
          >
            <Text className="text-white font-semibold">Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
