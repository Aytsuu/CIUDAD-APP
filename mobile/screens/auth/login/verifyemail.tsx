import "@/global.css";
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToastContext } from '@/components/ui/toast';

export default function VerifyEmail() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const { toast } = useToastContext();

  const handleSendCode = async () => {
    try {
      if (!email) {
        Alert.alert('Error', 'Please enter your email.');
        return;
      }

      setLoading(true);
      // await sendOtp(email);
      
      toast.success(`Verification code sent to ${email}`);
      setCodeSent(true);
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast.error('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      if (!email || !code) {
        Alert.alert('Error', 'Both fields are required.');
        return;
      }

      setLoading(true);
      // await verifyOtp(email, code);
      
      toast.success('Email verified successfully!');
      // router.push('/(auth)/forgotpassword');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
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
            autoCapitalize="none"
            editable={!codeSent}
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

        {/* Send Code Link */}
        <View className="w-full flex-row justify-end">
          <TouchableOpacity 
            onPress={handleSendCode}
            disabled={loading || codeSent}
          >
            <Text className={`text-primaryBlue text-[16px] font-PoppinsMedium underline ${
              (loading || codeSent) ? 'opacity-50' : ''
            }`}>
              {loading ? 'Sending...' : codeSent ? 'Code Sent' : 'Send Code'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Confirm Button */}
        <Button 
          className="bg-primaryBlue w-full native:h-[57px]"
          size={'lg'}
          onPress={handleConfirm}
          disabled={loading || !codeSent}
        >
          <Text className="text-white font-PoppinsSemiBold text-[16px]">
            {loading ? 'Verifying...' : 'Confirm'}
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};