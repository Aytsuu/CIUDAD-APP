import "@/global.css";

import React from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from "@/components/ui/button";
import _ScreenLayout from "@/screens/_ScreenLayout";
import { Plus } from '@/lib/icons/Plus'

export default function Dependent() {
  const router = useRouter();

  const handleProceed = () => {
    router.push('/register-completion'); 
  };

  const handleAddDependent = () => {
    router.push('/add-dependent'); 
  };

  return (
    <_ScreenLayout
        header={'Dependents'}
        description={'Optional'}
    >
        <View className="flex-1 gap-10">

            {/* Blank White Area */}
            <View className="flex-1 gap-5">
                <TouchableWithoutFeedback
                    onPress={handleAddDependent}
                >
                    <View className="flex-1 flex-row gap-3">
                        <Plus className="text-muted-foreground"/> 
                        <Text className="text-muted-foreground font-PoppinsMedium text-[16px]"> Add Dependent </Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>

            {/* Action Button*/}
            <View className="">
                <Button
                    onPress={handleProceed}
                    className="bg-primaryBlue native:h-[57px]"
                >
                    <Text className="text-white font-PoppinsMedium text-[16px]">Next</Text>
                </Button>
            </View>
        </View>
    </_ScreenLayout>
  );
};
