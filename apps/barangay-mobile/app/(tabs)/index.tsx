import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import "../../global.css";

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    console.log('Username:', username);
    console.log('Password:', password);
  };

  const handleSignUp = () => {
    router.push('/AgeVerification');
  };

  return (
    <View className="flex-1 items-center justify-center bg-[#ECF8FF]">
      <Image
        source={require('../../assets/images/logo.png')}
        className="w-30 h-30 mb-7"
      />

      <TextInput
        className="w-[355px] h-[60px] border border-gray-300 rounded-md px-4 my-3.5 bg-white text-[16px]"
        placeholder="Username/Email"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        className="w-[355px] h-[60px] border border-gray-300 rounded-md px-4 my-3.5 bg-white text-[16px]"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      <TouchableOpacity className="mt-3.5">
        <Text className="text-black font-extrabold text-[16px]">Forgot Password?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="bg-[#00A8F0] rounded-md w-[355px] py-3.5 items-center justify-center my-8 h-[60px]"
        onPress={handleLogin}
      >
        <Text className="text-white font-bold text-[23px]">Login</Text>
      </TouchableOpacity>
      
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
    </View>
  );
};

export default LoginScreen;
