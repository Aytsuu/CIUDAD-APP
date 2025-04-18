import "@/global.css";

import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, Alert } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye } from '@/lib/icons/Eye';  
import { EyeOff } from '@/lib/icons/EyeOff';

export default function ForgetPassword() {
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);  
  const router = useRouter();

  const handleConfirm = () => {
    if (!password || !rePassword) {
      Alert.alert('Error', 'Both fields are required.');
      return;
    }

    if (password !== rePassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    console.log('Password:', password);
    console.log('Re-Password:', rePassword);
    router.push('/'); // Navigate back if successful
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-lightBlue-1 p-[24px]">
      <View className="w-full max-w-[350px] flex items-center gap-6">
        
        <Text className="text-[24px] font-PoppinsMedium text-center">
          Forget Password?
        </Text>

        {/* Password Input */}
        <View className="relative w-full">
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          {password.length > 0 && (
            <TouchableWithoutFeedback onPress={() => setShowPassword(!showPassword)}>
              <View className="absolute right-5 top-1/2 transform -translate-y-1/2">
                {showPassword ? <Eye className="text-gray-700" /> : <EyeOff className="text-gray-700" />}
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>

        {/* Re-Password Input */}
        <View className="relative w-full">
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="Re-Password"
            value={rePassword}
            onChangeText={setRePassword}
            secureTextEntry={!showRePassword}
          />
          {rePassword.length > 0 && (
            <TouchableWithoutFeedback onPress={() => setShowRePassword(!showRePassword)}>
              <View className="absolute right-5 top-1/2 transform -translate-y-1/2">
                {showRePassword ? <Eye className="text-gray-700" /> : <EyeOff className="text-gray-700" />}
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>

        {/* Confirm Button */}
        <Button 
          className="bg-primaryBlue w-full native:h-[57px]"
          size={'lg'}
          onPress={handleConfirm}
        >
          <Text className="text-white font-PoppinsSemiBold text-[16px]">Confirm</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};
