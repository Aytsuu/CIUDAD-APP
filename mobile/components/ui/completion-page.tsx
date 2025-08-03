import React from "react";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import { router, useRouter } from "expo-router";
import { 
  View, 
  Text, 
  ScrollView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useToastContext } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { LoadingModal } from "@/components/ui/loading-modal";
import { capitalizeAllFields } from "@/helpers/capitalize";

export default function CompletionPage({params} : {params: Record<string, any>}) {
  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-6 mt-10">
          {/* Success Icon */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
              Almost Done!
            </Text>
            <Text className="text-gray-600 text-center text-base leading-relaxed">
              Please review your information before submitting your registration.
            </Text>
          </View>

          {/* Important Notice */}
          <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#F59E0B" className="mt-0.5 mr-3" />
              <View className="flex-1">
                <Text className="text-amber-800 font-semibold text-sm mb-1">
                  Important Notice
                </Text>
                <Text className="text-amber-700 text-sm leading-relaxed">
                  By submitting this, you confirm that all information provided is accurate and complete. This will be used for transaction and verification purposes.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <View className="flex-row gap-4">
          <Button 
            onPress={() => router.back()}
            variant={"secondary"}
            className='flex-1 py-4 rounded-2xl active:bg-gray-50'
          >
            <Text className="text-gray-700 font-semibold text-center text-sm">
              Cancel
            </Text>
          </Button>
          
          <Button
            onPress={() => params?.submit()}
            className={`flex-1 py-4 rounded-2xl bg-blue-600 active:bg-blue-700`}
          >
            <Text className="text-white font-semibold text-sm">
              Confirm & Submit
            </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}