
import "@/global.css";
import React, { useState } from "react";
import { View, Text, TouchableWithoutFeedback, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form/form-input";
import { Eye } from "@/lib/icons/Eye";
import { EyeOff } from "@/lib/icons/EyeOff";
import { signInSchema } from "@/form-schema/signin-schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import ScreenLayout from "@/screens/_ScreenLayout";
import { useToastContext } from "@/components/ui/toast";
import { SignupOptions } from "./SignupOptions";
import { useAuth } from "@/contexts/AuthContext";

type SignInForm = z.infer<typeof signInSchema>;

export default () => {
  const { toast } = useToastContext();
  const defaultValues = generateDefaultValues(signInSchema);
  const [showSignupOptions, setShowSignupOptions] = useState<boolean>(false);  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // const { login, isInitializing } = useAuth();
  const router = useRouter();

  const { control, trigger, getValues } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues,
  });

  const handleLogin = async () => {
    
    const formIsValid = await trigger([
      "user_or_email",
      "password"
    ]);

    if(!formIsValid) {
      toast.error("Incorrect username or password");
      return;
    }
  };

  return (
    <ScreenLayout
      showExitButton={false}
      customLeftAction={<Text className="text-[13px] ml-2">CIUDAD</Text>}
    >
      <View className="flex-1 flex-col">
        <View className="items-center justify-center mt-7">
          <Image
            source={require("@/assets/images/Logo.png")}
            className="w-24 h-24"
          />
        </View>
        <View className="flex-row justify-center mt-6">
          <Text className="text-[24px] font-PoppinsMedium">Login Account</Text>
        </View>
        <View className="flex-grow mt-6">
          <FormInput
            control={control}
            name="user_or_email"
            label="Username/Email"
          />
          <View className="relative">
            <FormInput
              control={control}
              name="password"
              label="Password"
              secureTextEntry={!showPassword}
            />

            {password.length > 0 && (
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
            )}
          </View>
          <TouchableWithoutFeedback onPress={() => router.push("/verifyemail")}>
            <View className="flex-row justify-end mt-3 mb-4">
              <Text className="text-black font-PoppinsRegular text-[13px]">
                Forgot Password?
              </Text>
            </View>
          </TouchableWithoutFeedback>

          <Button
            className="bg-primaryBlue"
            size={"lg"}
            onPress={handleLogin}
          >
            <Text className="text-white font-PoppinsSemiBold text-[14px]">
              Log in
            </Text>
          </Button>
        </View>
      </View>

      <View className="flex-row justify-center gap-2">
        <Text className="text-black font-PoppinsRegular text-[13px] ">
          Not registered yet?
        </Text>
        <TouchableWithoutFeedback onPress={() => setShowSignupOptions(true)}>
          <Text className="text-black font-PoppinsMedium underline text-[13px]">
            Register
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
