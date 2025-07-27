import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import AccountDetails from "../AccountDetails";
import { useAddAccount } from "../../queries/authPostQueries";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import { LoadingModal } from "@/components/ui/loading-modal";

export default function LinkAccountReg() {
  const router = useRouter();
  const { getValues, reset } = useRegistrationFormContext();
  const { rp_id } = useLocalSearchParams();
  const { mutateAsync: addAccount } = useAddAccount();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [showFeedback, setShowFeedback] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<"success" | "failure">("success");

  const submit = () => {
    setIsSubmitting(true);
    const values = getValues('accountFormSchema')

    try {
      addAccount({
        username: values.username,
        email: values.email,
        password: values.password,
        resident_id: rp_id 
      }, {
        onSuccess: () => {
          setIsSubmitting(false);
          setShowFeedback(true);
          setStatus("success")
        }
      });
    } catch (err) {
      setIsSubmitting(false);
    }
  }

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
        onOk={() => { 
          reset();
          router.replace('/(auth)')
        }}
      />
    );
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