import "@/global.css";

import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { router } from "expo-router";

export default ({ children, header, description }: 
    { children: React.ReactNode, header: String, description: String }) => {
        
        
    return (
        <SafeAreaView className="flex-1 bg-lightBlue-1">
            <ScrollView
                className="flex-1 p-[20px]" // Use flex-1 to take up all available space
                contentContainerStyle={{ flexGrow: 1 }} // Ensure content stretches to fill the ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            >
                <View className="flex-row justify-between items-center">
                    <TouchableWithoutFeedback onPress={() => router.back()}>
                        <Text className="text-black text-[15px]">Back</Text>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={() => router.push('/')}>
                        <Text className="text-black text-[15px]">Exit</Text>
                    </TouchableWithoutFeedback>
                </View>
                <View className="flex-1 flex-col mt-4">
                    <Text className="text-black text-[22px] font-PoppinsSemiBold">{header}</Text>
                    {description && <Text className="text-black text-[16px] font-PoppinsRegular mb-3">{description}</Text>}
                    {children}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};