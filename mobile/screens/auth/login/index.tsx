import "@/global.css"

import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye } from '@/lib/icons/Eye';  
import { EyeOff } from '@/lib/icons/EyeOff';

export default function LoginScreen(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    console.log('Username:', username);
    console.log('Password:', password);
  };

  const handleSignUp = () => {
    router.push('/verification');
  };

  return (
    <SafeAreaView className="flex-1 justify-between bg-lightBlue-1 p-[24px]"> 
      <View className="flex-1 flex-col">
        <View className="items-center justify-center mt-10">
          <Image
            source={require('@/assets/images/Logo.png')}
            className="w-30 h-30"
          />
        </View>
        <View className="flex-row justify-center mt-7">
          <Text className="text-[24px] font-PoppinsMedium">Login Account</Text>
        </View>
        <View className="flex-grow gap-5 mt-7">
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="Username/Email"
            value={username}
            onChangeText={setUsername}
          />
          <View className="relative">
            <Input
              className="h-[57px] font-PoppinsRegular"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />

            {
              password.length > 0 && (
                <TouchableWithoutFeedback
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <View className="absolute right-5 top-1/2 transform -translate-y-1/2">
                    {showPassword ? <Eye className="text-gray-700" /> : <EyeOff className="text-gray-700" />} 
                  </View>
                </TouchableWithoutFeedback>
              )
            }

          </View>
          <TouchableOpacity onPress={() => router.push('/verifyemail')}>
  <View className="flex-row justify-end">
    <Text className="text-black font-PoppinsRegular text-[16px]">Forgot Password?</Text>
  </View>
</TouchableOpacity>



          
          <Button 
            className="bg-primaryBlue native:h-[57px]"
            size={'lg'}
            onPress={handleLogin}
          >
            <Text className="text-white font-PoppinsSemiBold text-[16px]">Log in</Text>
          </Button>
        </View>
      </View>
      
      <View className="flex-row justify-center gap-2">
          <Text className="text-black font-PoppinsRegular text-[16px] ">
            Not registered yet?
          </Text>
        <TouchableWithoutFeedback onPress={handleSignUp}>
          <Text className="text-black font-PoppinsMedium underline text-[16px]">
            Register
          </Text>
        </TouchableWithoutFeedback>
      </View>
    </SafeAreaView>
  );
};