import "@/global.css"

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Button } from '@/~/components/ui/button';
import { Input } from '@/~/components/ui/input';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    console.log('Username:', username);
    console.log('Password:', password);
  };

  const handleSignUp = () => {
    router.push('./registration/AgeVerification');
  };

  return (
    <SafeAreaView className="w-screen h-screen items-center justify-center bg-[#ECF8FF] p-[24px]"> 
      <Image
        source={require('@/assets/images/Logo.png')}
        className="w-30 h-30 mb-7"
      />
      <View className="w-full flex flex-col items-center justify-center">
        <Input
          className="w-full"
          placeholder="Username/Email"
          value={username}
          onChangeText={setUsername}
        />
        <Input
          className="w-full" 
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <TouchableOpacity className="mt-3.5">
        <Text className="text-black font-extrabold text-[16px]">Forgot Password?</Text>
      </TouchableOpacity>
      
      <Button 
        className="bg-[#00A8F0] w-full h-[60px]"
        onPress={handleLogin}
      >
        <Text className="text-white font-bold text-[23px]">Login</Text>
      </Button>
      
      <Text className="mt-2">
        <Text className="text-black font-extrabold text-[16px]">
          Don't have an account?
        </Text>
      </Text>
      <TouchableOpacity className="mt-8" onPress={handleSignUp}>
        <Text className="text-black font-extrabold underline text-[18px]">
          Sign Up
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default LoginScreen;