import React from "react";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { LoadingModal } from "@/components/ui/loading-modal";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import { router } from "expo-router";
import { useRegistrationTypeContext } from "@/contexts/RegistrationTypeContext";
import { View, Text } from "react-native";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import CompleteScanProcess from "@/screens/auth/signup/CompleteScanProcess";
import { useAddPersonalModification } from "../../queries/accountPostQueries";
import { useToastContext } from "@/components/ui/toast";

export default function UpdateScan() {
  const dispatch = useDispatch()
  const { getValues, reset } = useRegistrationFormContext();
  const { toast } = useToastContext();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [showFeedback, setShowFeedback] = React.useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string>('');
  const [status, setStatus] = React.useState<"success" | "failure" | "waiting" | "message">("success");
  const { mutateAsync: addPersonalModification } = useAddPersonalModification();

  const submit = async () => {
    setIsSubmitting(true)
    const personalInfoSchema = getValues("personalInfoSchema");
    try {
      console.log("data:",personalInfoSchema)
      await addPersonalModification({
        personal: personalInfoSchema
      });
      toast.success("Your request has been delivered.")
      router.back();
    } catch (err) {
      toast.error("Failed to submit request. Please try")
    } finally {
      setIsSubmitting(false)
    }
  };

  return (
    <>
      <CompleteScanProcess
        params={{
          submit: submit,
        }}
      />
      <LoadingModal visible={isSubmitting} />
    </>
  );
}
