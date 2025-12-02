import React from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { Mail, Phone, CheckCircle } from "lucide-react-native";
import { ResponsiveFormContainer, useResponsiveForm, FormContentWrapper } from "../../../../../../components/healthcomponents/ResponsiveFormContainer";
import { sendEmailOTP, sendPhoneOTP } from "@/services/account/accountQueries";
import { useToastContext } from "@/components/ui/toast";
import RegVerification from "./RegVerification";

interface AccountFormProps {
  form: UseFormReturn<any>;
  onNext: (stepId: number, isComplete: boolean) => void;
}

export default function AccountForm({ form, onNext }: AccountFormProps) {
  const { toast } = useToastContext();
  const isMounted = React.useRef(true);
  
  // Verification states
  const [isVerifyingPhone, setIsVerifyingPhone] = React.useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = React.useState(false);
  const [isVerifiedEmail, setIsVerifiedEmail] = React.useState(false);
  const [isVerifiedPhone, setIsVerifiedPhone] = React.useState(false);
  const [validPhone, setValidPhone] = React.useState(false);
  const [validEmail, setValidEmail] = React.useState(false);
  const [isResendingEmail, setIsResendingEmail] = React.useState(false);
  const [isResendingPhone, setIsResendingPhone] = React.useState(false);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
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
    formState: { errors },
    trigger,
    clearErrors,
    setError,
  } = form;

  const accountValues = watch("accountSchema");
  const watchEmail = watch("accountSchema.email");
  const watchPhone = watch("accountSchema.phone");

  const hasEmail = watchEmail?.length > 0;
  const hasPhone = watchPhone?.length > 0;

  // Reset verification when email/phone changes
  React.useEffect(() => {
    if (isVerifiedEmail) {
      setIsVerifiedEmail(false);
      setValue("accountSchema.isVerifiedEmail", false);
    }
    if (validEmail) setValidEmail(false);
  }, [watchEmail]);

  React.useEffect(() => {
    if (isVerifiedPhone) {
      setIsVerifiedPhone(false);
      setValue("accountSchema.isVerifiedPhone", false);
    }
    if (validPhone) setValidPhone(false);
  }, [watchPhone]);

  const handleValidateEmail = async () => {
    const email = accountValues?.email;
    if (!email) return;

    try {
      setIsResendingEmail(true);
      await sendEmailOTP({
        email: email,
        type: "signup",
      });

      if (!isMounted.current) return;
      
      setValidEmail(true);
      clearErrors("accountSchema.email");
      setIsVerifyingEmail(true);
    } catch (err: any) {
      if (!isMounted.current) return;
      
      if (err.response?.data) {
        setError("accountSchema.email", {
          type: "server",
          message: err.response.data.email || "Email validation failed",
        });
      }
      setValidEmail(false);
    } finally {
      if (isMounted.current) {
        setIsResendingEmail(false);
      }
    }
  };

  const emailOtpSuccess = () => {
    if (!isMounted.current) return;
    
    setIsVerifiedEmail(true);
    setIsVerifyingEmail(false);
    setValue("accountSchema.isVerifiedEmail", true);
  };

  const handleValidatePhone = async () => {
    const isValid = await trigger(["accountSchema.phone"]);
    if (!isValid) return;

    const phone = accountValues?.phone;
    if (!phone) return;

    try {
      setIsResendingPhone(true);
      await sendPhoneOTP({
        pv_phone_num: phone,
        pv_type: "signup",
      });

      if (!isMounted.current) return;

      setValidPhone(true);
      clearErrors("accountSchema.phone");
      setIsVerifyingPhone(true);
    } catch (err: any) {
      if (!isMounted.current) return;
      
      if (err.response?.data) {
        setError("accountSchema.phone", {
          type: "server",
          message: err.response.data.phone || "Phone validation failed",
        });
      }
      setValidPhone(false);
    } finally {
      if (isMounted.current) {
        setIsResendingPhone(false);
      }
    }
  };

  const phoneOtpSuccess = () => {
    if (!isMounted.current) return;
    
    setIsVerifiedPhone(true);
    setIsVerifyingPhone(false);
    setValue("accountSchema.isVerifiedPhone", true);
  };

  const validateAndNext = () => {
    const { email, phone } = accountValues || {};
    
    // Check if phone is verified (required)
    // Email is optional, but if provided must be verified
    const isComplete = !!(
      phone && 
      isVerifiedPhone &&
      (!email || (email && isVerifiedEmail)) // Email is optional, but if provided must be verified
    );

    onNext(0, isComplete);
  };

  const validateSkip = () => {
    // Clear account schema data
    setValue("accountSchema", {
      email: "",
      phone: "",
      isVerifiedEmail: false,
      isVerifiedPhone: false,
    });
    
    onNext(0, false);
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
          Verify email and phone number for this resident. This step is optional but recommended for account access and notifications.
        </Text>
      </View>

      {/* Form Container */}
      <FormContentWrapper>
        {/* Email Field */}
        <View style={{ marginBottom }}>
          <View className="flex-row items-center justify-between mb-2">
            <Text 
              className="text-gray-700 font-semibold" 
              style={{ fontSize: headingSize }}
            >
              Email Address (optional)
            </Text>
            {!isVerifiedEmail && !isResendingEmail && hasEmail && (
              <TouchableOpacity
                onPress={handleValidateEmail}
                disabled={isResendingEmail}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text className="text-blue-600 font-semibold" style={{ fontSize: smallTextSize }}>
                  Verify
                </Text>
              </TouchableOpacity>
            )}
            {isResendingEmail && (
              <ActivityIndicator size="small" color="#3B82F6" />
            )}
            {isVerifiedEmail && (
              <View className="flex-row items-center gap-1">
                <CheckCircle size={iconSize - 4} color="#10B981" />
                <Text className="text-green-600 font-semibold" style={{ fontSize: smallTextSize }}>
                  Verified
                </Text>
              </View>
            )}
          </View>
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
          <View className="flex-row items-center justify-between mb-2">
            <Text 
              className="text-gray-700 font-semibold" 
              style={{ fontSize: headingSize }}
            >
              Phone Number *
            </Text>
            {!isVerifiedPhone && !isResendingPhone && hasPhone && (
              <TouchableOpacity
                onPress={handleValidatePhone}
                disabled={isResendingPhone}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text className="text-blue-600 font-semibold" style={{ fontSize: smallTextSize }}>
                  Verify
                </Text>
              </TouchableOpacity>
            )}
            {isResendingPhone && (
              <ActivityIndicator size="small" color="#3B82F6" />
            )}
            {isVerifiedPhone && (
              <View className="flex-row items-center gap-1">
                <CheckCircle size={iconSize - 4} color="#10B981" />
                <Text className="text-green-600 font-semibold" style={{ fontSize: smallTextSize }}>
                  Verified
                </Text>
              </View>
            )}
          </View>
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

      {/* Email OTP Verification Modal */}
      <RegVerification
        method="email"
        email={accountValues?.email}
        isOpen={hasEmail && validEmail && isVerifyingEmail && !isVerifiedEmail}
        onClose={() => {
          setIsVerifyingEmail(false);
          setValidEmail(false);
        }}
        onSuccess={emailOtpSuccess}
        onResend={handleValidateEmail}
        isResending={isResendingEmail}
      />

      {/* Phone OTP Verification Modal */}
      <RegVerification
        method="phone"
        phone={accountValues?.phone}
        isOpen={hasPhone && validPhone && isVerifyingPhone && !isVerifiedPhone}
        onClose={() => {
          setIsVerifyingPhone(false);
          setValidPhone(false);
        }}
        onSuccess={phoneOtpSuccess}
        onResend={handleValidatePhone}
        isResending={isResendingPhone}
      />
    </ResponsiveFormContainer>
  );
}

