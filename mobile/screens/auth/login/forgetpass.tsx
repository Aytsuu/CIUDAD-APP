import "@/global.css";
import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, Alert } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye } from '@/lib/icons/Eye';  
import { EyeOff } from '@/lib/icons/EyeOff';
import { useAuth } from '@/contexts/AuthContext';
import { useToastContext } from '@/components/ui/toast';

export default function ForgetPassword() {
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToastContext();
  // const { resetPassword } = useAuth();

  const handleConfirm = async () => {
    try {
      if (!password || !rePassword) {
        Alert.alert('Error', 'Both fields are required.');
        return;
      }

      if (password !== rePassword) {
        Alert.alert('Error', 'Passwords do not match.');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters.');
        return;
      }

      setLoading(true);
      // await resetPassword(password);
      
      toast.success('Password updated successfully!');
      // router.push('/home'); // Navigate back to login
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Error', 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
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
            placeholder="New Password"
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
            placeholder="Confirm New Password"
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
          disabled={loading}
        >
          <Text className="text-white font-PoppinsSemiBold text-[16px]">
            {loading ? 'Updating...' : 'Update Password'}
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};