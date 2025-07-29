import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import AccountDetails from "../AccountDetails";
import { useAddAccount } from "../../queries/authPostQueries";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import { LoadingModal } from "@/components/ui/loading-modal";
import { View, Text } from "react-native";
import { Button } from "@/components/ui/button";

export default function LinkAccountReg() {
  const router = useRouter();
  const { getValues, reset } = useRegistrationFormContext();
  const { rp_id } = useLocalSearchParams();
  const { mutateAsync: addAccount } = useAddAccount();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [showFeedback, setShowFeedback] = React.useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string>('');
  const [status, setStatus] = React.useState<"success" | "failure" | "loading" | "message">("success");

  const submit = () => {
    setIsSubmitting(true);
    setStatus('loading');
    setShowFeedback(true)
    const values = getValues('accountFormSchema')

    try {
      addAccount({
        username: values.username,
        email: values.email,
        password: values.password,
        resident_id: rp_id 
      }, {
        onSuccess: () => {
          setShowFeedback(false);
          setTimeout(() => {
            setStatus('success');
            setShowFeedback(true);
          }, 0);
        }
      });
    } catch (err) {
      setShowFeedback(false);
      setTimeout(() => {
        setStatus("failure");
        setShowFeedback(true);
        setIsSubmitting(false);
      }, 0);
    }
  }

  const FeedbackContents: any = {
    success: (
      <View className="flex-1 justify-end">
        <Button className={`bg-primaryBlue rounded-xl native:h-[45px]`}
          onPress={() => {
            reset()
            router.replace('/(tabs)')
          }}
        >
          <Text className="text-white text-base font-semibold">
            Continue
          </Text>
        </Button>
      </View>
    ),
    failure: (
      <View className="flex-1 justify-end">
        <View className="flex-row gap-3">
          <Button variant={"outline"} className={`flex-1 rounded-xl native:h-[45px]`}
          >
            <Text className="text-gray-600 text-base font-semibold">
              Cancel
            </Text>
          </Button>
          <Button className={`bg-primaryBlue flex-1 rounded-xl native:h-[45px]`}
            onPress={() => {
              setShowFeedback(false)
              setTimeout(() => {
                submit();
              }, 0)
            }}
          >
            <Text className="text-white text-base font-semibold">
              Try Again
            </Text>
          </Button>
        </View>
      </View>
    ),
  }

  if (showFeedback) {
    return (
      <FeedbackScreen
        status={status}
        content={FeedbackContents[status]}
      />
    );
  }

  if (isSubmitting) {
    return
  }
  
  return (
    <>
      <AccountDetails submit={submit}/>
      <LoadingModal
        visible={isSubmitting}
      />
    </>
  )
}