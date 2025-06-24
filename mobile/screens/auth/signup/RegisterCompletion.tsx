import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import {
  useAddPersonal,
  useAddRequest,
  useAddRequestFile,
  useAddAddress,
  useAddPerAddress,
} from "./queries/signupAddQueries";
import React from "react";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import { useRouter } from "expo-router";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  Dimensions 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useToastContext } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

const { width } = Dimensions.get('window');

export default function RegisterCompletion({ photo, setPhoto, setDetectionStatus }: {
  photo: string,
  setPhoto: React.Dispatch<React.SetStateAction<Record<string, any>>>
  setDetectionStatus: React.Dispatch<React.SetStateAction<string>>
}) {
  const { toast } = useToastContext();
  const router = useRouter();
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [status, setStatus] = React.useState<"success" | "failure">("success");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { getValues } = useRegistrationFormContext();
  const { mutateAsync: addPersonal } = useAddPersonal();
  const { mutateAsync: addRequest } = useAddRequest();
  const { mutateAsync: addRequestFile } = useAddRequestFile();
  const { mutateAsync: addAddress } = useAddAddress();
  const { mutateAsync: addPersonalAddress } = useAddPerAddress();

  const cancel = () => {
    setPhoto({});
    setDetectionStatus("");
  };

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const {per_addresses, ...data} = getValues("personalInfoSchema");
      const dob = getValues("verificationSchema.dob");
      const photoList = getValues("photoSchema.list");

      console.log("Data:", data)
      console.log("Addresses:", per_addresses.list)

      addPersonal({...data, per_dob: dob }, {
        onSuccess: (newData) => {
          addAddress(per_addresses.list, {
            onSuccess: (new_addresses) => {
              const per_address = new_addresses?.map((address: any) => ({
                add: address.add_id,
                per: newData.per_id,
              }));
              addPersonalAddress(per_address)
            }
          })
          addRequest(newData.per_id, {
            onSuccess: (request) => {
              const data = photoList.map((photo: any) => ({
                ...photo,
                req: request.req_id,
              }))
              addRequestFile(data, {
                onSuccess: () => {
                  setStatus("success");
                  setShowFeedback(true);
                }
              });
            }
          });
        }
      });
    } catch (error) {
      setStatus("failure");
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showFeedback) {
    return (
      <FeedbackScreen
        status={status}
        onRetry={() => {
          // Simulate a retry that might succeed
          const willSucceed = Math.random() > 0.5;
          setTimeout(() => {
            setStatus(willSucceed ? "success" : "failure");
          }, 1500);
        }}
        onOk={() => router.push('/(auth)')}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
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
              Please review your information and photo before submitting your registration.
            </Text>
          </View>

          {/* Photo Preview */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Your Photo
            </Text>
            <View className="items-center">
              <View className="w-48 h-60 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
                {photo && (
                  <Image
                    source={{ uri: photo }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                )}
              </View>
              <TouchableOpacity
                onPress={cancel}
                className="mt-4 px-4 py-2 bg-blue-50 rounded-full"
                disabled={isSubmitting}
              >
                <Text className="text-blue-600 font-medium text-sm">
                  Retake Photo
                </Text>
              </TouchableOpacity>
            </View>
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
                  By submitting this registration, you confirm that all information provided is accurate and complete. This will be used for verification purposes.
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
            variant={"secondary"}
            onPress={cancel}
            disabled={isSubmitting}
            className={`flex-1 py-4 rounded-2xl ${
              isSubmitting ? 'opacity-50' : 'active:bg-gray-50'
            }`}
          >
            <Text className="text-gray-700 font-semibold text-center text-sm">
              Cancel
            </Text>
          </Button>
          
          <Button
            onPress={submit}
            className={`flex-1 py-4 rounded-2xl ${
              isSubmitting 
                ? 'bg-blue-400' 
                : 'bg-blue-600 active:bg-blue-700'
            }`}
          >
             {isSubmitting && (
                <ActivityIndicator size="small" color="white" className="mr-2" />
              )}
              <Text className="text-white font-semibold text-sm">
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
              </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}