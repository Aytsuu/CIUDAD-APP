import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { Eye, EyeOff, Mail, Phone, Lock } from "lucide-react-native";
import { ResponsiveFormContainer, useResponsiveForm, FormContentWrapper } from "../../../../../../components/healthcomponents/ResponsiveFormContainer";

interface AccountFormProps {
  form: UseFormReturn<any>;
  onNext: (stepId: number, isComplete: boolean) => void;
}

export default function AccountForm({ form, onNext }: AccountFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  
  // Use responsive hook
  const {
    inputHeight,
    iconSize,
    fontSize,
    headingSize,
    smallTextSize,
    bodyTextSize,
    marginBottom,
    cardPadding,
    buttonPadding,
    minButtonHeight,
    buttonLayout,
  } = useResponsiveForm();

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
    <ResponsiveFormContainer>
      {/* Info Card */}
      <View 
        className="bg-blue-50 border border-blue-200 rounded-xl mb-6"
        style={{ padding: cardPadding }}
      >
        <Text 
          className="text-blue-900 font-semibold mb-1" 
          style={{ fontSize: headingSize }}
        >
          Account Setup
        </Text>
        <Text 
          className="text-blue-700" 
          style={{ fontSize: bodyTextSize }}
        >
          Create login credentials for this resident. This step is optional but recommended for online access.
        </Text>
      </View>

      {/* Form Container */}
      <FormContentWrapper>
        {/* Email Field */}
        <View style={{ marginBottom }}>
          <Text 
            className="text-gray-700 font-semibold mb-2" 
            style={{ fontSize: headingSize }}
          >
            Email Address
          </Text>
          <View 
            className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4"
            style={{ height: inputHeight }}
          >
            <Mail size={iconSize} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              placeholder="juan.delacruz@example.com"
              value={accountValues?.email || ""}
              onChangeText={(text) => setValue("accountSchema.email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ fontSize }}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          {(errors?.accountSchema as any)?.email && (
            <Text 
              className="text-red-500 mt-1" 
              style={{ fontSize: smallTextSize }}
            >
              {(errors.accountSchema as any).email.message as string}
            </Text>
          )}
        </View>

        {/* Phone Field */}
        <View style={{ marginBottom }}>
          <Text 
            className="text-gray-700 font-semibold mb-2" 
            style={{ fontSize: headingSize }}
          >
            Phone Number
          </Text>
          <View 
            className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4"
            style={{ height: inputHeight }}
          >
            <Phone size={iconSize} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              placeholder="09171234567"
              value={accountValues?.phone || ""}
              onChangeText={(text) => setValue("accountSchema.phone", text)}
              keyboardType="phone-pad"
              maxLength={11}
              style={{ fontSize }}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          {(errors?.accountSchema as any)?.phone && (
            <Text 
              className="text-red-500 mt-1" 
              style={{ fontSize: smallTextSize }}
            >
              {(errors.accountSchema as any).phone.message as string}
            </Text>
          )}
        </View>

        {/* Password Field */}
        <View style={{ marginBottom }}>
          <Text 
            className="text-gray-700 font-semibold mb-2" 
            style={{ fontSize: headingSize }}
          >
            Password
          </Text>
          <View 
            className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4"
            style={{ height: inputHeight }}
          >
            <Lock size={iconSize} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              placeholder="Enter password"
              value={accountValues?.password || ""}
              onChangeText={(text) => setValue("accountSchema.password", text)}
              secureTextEntry={!showPassword}
              style={{ fontSize }}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showPassword ? (
                <EyeOff size={iconSize} color="#6B7280" />
              ) : (
                <Eye size={iconSize} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
          {(errors?.accountSchema as any)?.password && (
            <Text 
              className="text-red-500 mt-1" 
              style={{ fontSize: smallTextSize }}
            >
              {(errors.accountSchema as any).password.message as string}
            </Text>
          )}
        </View>

        {/* Confirm Password Field */}
        <View style={{ marginBottom: marginBottom + 4 }}>
          <Text 
            className="text-gray-700 font-semibold mb-2" 
            style={{ fontSize: headingSize }}
          >
            Confirm Password
          </Text>
          <View 
            className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4"
            style={{ height: inputHeight }}
          >
            <Lock size={iconSize} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              placeholder="Re-enter password"
              value={accountValues?.confirmPassword || ""}
              onChangeText={(text) => setValue("accountSchema.confirmPassword", text)}
              secureTextEntry={!showConfirmPassword}
              style={{ fontSize }}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showConfirmPassword ? (
                <EyeOff size={iconSize} color="#6B7280" />
              ) : (
                <Eye size={iconSize} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
          {(errors?.accountSchema as any)?.confirmPassword && (
            <Text 
              className="text-red-500 mt-1" 
              style={{ fontSize: smallTextSize }}
            >
              {(errors.accountSchema as any).confirmPassword.message as string}
            </Text>
          )}
        </View>

        {/* Password Requirements */}
        <View 
          className="bg-gray-100 rounded-xl mb-6"
          style={{ padding: cardPadding }}
        >
          <Text 
            className="text-gray-700 font-semibold mb-2" 
            style={{ fontSize: headingSize }}
          >
            Password Requirements:
          </Text>
          <Text 
            className="text-gray-600" 
            style={{ fontSize: bodyTextSize, marginBottom: 4 }}
          >
            • At least 6 characters
          </Text>
          <Text 
            className="text-gray-600" 
            style={{ fontSize: bodyTextSize, marginBottom: 4 }}
          >
            • One uppercase letter
          </Text>
          <Text 
            className="text-gray-600" 
            style={{ fontSize: bodyTextSize, marginBottom: 4 }}
          >
            • One lowercase letter
          </Text>
          <Text 
            className="text-gray-600" 
            style={{ fontSize: bodyTextSize }}
          >
            • One number
          </Text>
        </View>

        {/* Action Buttons */}
        <View 
          style={{ 
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={validateSkip}
            className="bg-gray-200 rounded-xl items-center"
            style={{ 
              flex: 1,
              paddingVertical: buttonPadding,
              minHeight: minButtonHeight,
            }}
          >
            <Text 
              className="text-gray-700 font-semibold" 
              style={{ fontSize }}
            >
              Skip
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={validateAndNext}
            className="bg-blue-600 rounded-xl items-center"
            style={{ 
              flex: 1,
              paddingVertical: buttonPadding,
              minHeight: minButtonHeight,
            }}
          >
            <Text 
              className="text-white font-semibold" 
              style={{ fontSize }}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </FormContentWrapper>
    </ResponsiveFormContainer>
  );
}
