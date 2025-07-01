import "@/global.css";
import React, { useState } from "react";
import { View, Text, TouchableWithoutFeedback, Image } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form/form-input";
import { Eye } from "@/lib/icons/Eye";
import { EyeOff } from "@/lib/icons/EyeOff";
// import { Google } from "@/lib/icons/Google";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import ScreenLayout from "@/screens/_ScreenLayout";
import { useToastContext } from "@/components/ui/toast";
import { SignupOptions } from "./SignupOptions";
import { useAuth } from "@/contexts/AuthContext";
import { signInSchema } from "@/form-schema/signin-schema";
import { icons } from "lucide-react-native";

type SignInForm = z.infer<typeof signInSchema>;

export default () => {
  const { toast } = useToastContext();
  const defaultValues: Partial<SignInForm> = generateDefaultValues(signInSchema);
  const [showSignupOptions, setShowSignupOptions] = useState<boolean>(false);  
  const [showPassword, setShowPassword] = useState(false);
  const { login, isInitializing, signInWithGoogle } = useAuth();
  const router = useRouter();

  const { control, trigger, getValues, formState: { errors } } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues,
  });

  const handleLogin = async () => {
    try {
      const formIsValid = await trigger();
      
      if (!formIsValid) {
        if (errors.email) toast.error(errors.email.message ?? "Invalid email");
        else if (errors.password) toast.error(errors.password.message ?? "Invalid password");
        return;
      }

      const { email, password } = getValues();
      await login(email, password);
      toast.success("Welcome back!");
    } catch (error) {
      toast.error("Incorrect email or password");
      console.error("Login error:", error);
    }
  };

  return (
    <ScreenLayout
      showExitButton={false}
      customLeftAction={<Text className="text-[13px] ml-2"></Text>}
    >
      <View className="flex-1 flex-col">
        <View className="items-center justify-center mt-7">
          <Image
            source={require("@/assets/images/Logo.png")}
            className="w-24 h-24"
          />
        </View>
        <View className="flex-row justify-center mt-6">
          <Text className="text-[24px] font-PoppinsMedium">Welcome back</Text>
        </View>
        <View className="flex-grow mt-6">
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
            <TouchableWithoutFeedback
              onPress={() => setShowPassword(!showPassword)}
            >
              <View className="absolute right-5 top-1/2 transform -translate-y-1/2">
                {showPassword ? (
                  <Eye className="text-gray-700" />
                ) : (
                  <EyeOff className="text-gray-700" />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
          <TouchableWithoutFeedback onPress={() => router.push("/forgot-password")}>
            <View className="flex-row justify-end mt-3 mb-4">
              <Text className="text-primaryBlue font-PoppinsMedium text-[13px]">
                Forgot Password?
              </Text>
            </View>
          </TouchableWithoutFeedback>

          <Button
            className="bg-primaryBlue"
            size={"lg"}
            onPress={handleLogin}
            disabled={isInitializing}
          >
            <Text className="text-white font-PoppinsSemiBold text-[14px]">
              {isInitializing ? "Signing in..." : "Sign In"}
            </Text>
          </Button>

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="px-4 text-gray-500 font-PoppinsRegular text-[13px]">
              or continue with
            </Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <Button
            variant="outline"
            size="lg"
            className="border-gray-300 bg-white"
            onPress={signInWithGoogle}
            disabled={isInitializing}
          >
            <View className="flex-row items-center justify-center gap-3">
              {/* <Google width={20} height={20} /> */}
              <Text className="text-gray-800 font-PoppinsMedium text-[14px]">
                Continue with Google
              </Text>
            </View>
          </Button>
        </View>
      </View>

      <View className="flex-row justify-center gap-2 mb-6">
        <Text className="text-gray-600 font-PoppinsRegular text-[13px]">
          Don't have an account?
        </Text>
        <TouchableWithoutFeedback onPress={() => setShowSignupOptions(true)}>
          <Text className="text-primaryBlue font-PoppinsMedium text-[13px]">
            Sign up
          </Text>
        </TouchableWithoutFeedback>
      </View>

      <SignupOptions
        visible={showSignupOptions}
        onClose={() => setShowSignupOptions(false)}
      />
    </ScreenLayout>
  );
};