import "@/global.css";

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function VerifyEmail() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleSendCode = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    Alert.alert('Success', `Verification code sent to ${email}`);
  };

  const handleConfirm = () => {
    if (!email || !code) {
      Alert.alert('Error', 'Both fields are required.');
      return;
    }

    console.log('Email:', email);
    console.log('Code:', code);
    router.push('/(auth)/forgotpassword'); // Navigate back if successful
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-lightBlue-1 p-[24px]">
      <View className="w-full max-w-[350px] flex items-center gap-6">

        <Text className="text-[24px] font-PoppinsMedium text-center">
          Verify Email
        </Text>

        {/* Email Input */}
        <View className="w-full">
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        {/* Code Input */}
        <View className="w-full">
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="Enter verification code"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
          />
        </View>

        {/* Send Code Link (Below Code Input) */}

<View className="w-full flex-row justify-end">
  <TouchableOpacity onPress={handleSendCode}>
    <Text className="text-primaryBlue text-[16px] font-PoppinsMedium underline">
      Send Code
    </Text>
  </TouchableOpacity>
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
