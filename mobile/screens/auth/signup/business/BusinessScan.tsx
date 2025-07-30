import React from "react";
import CompleteScanProcess from "../CompleteScanProcess";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { LoadingModal } from "@/components/ui/loading-modal";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import { router } from "expo-router";
import { useAddPersonal, useAddAddress, useAddPerAddress, useAddAccount, useAddBusinessRespondent } from "../../queries/authPostQueries";
import { capitalizeAllFields } from "@/helpers/capitalize";

export default function BusinessScan() {
  const { getValues, reset } = useRegistrationFormContext();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [showFeedback, setShowFeedback] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<"success" | "failure">("success");
  const { mutateAsync: addPersonal } = useAddPersonal();
  const { mutateAsync: addBusinessRespondent } = useAddBusinessRespondent();
  const { mutateAsync: addAddress } = useAddAddress();
  const { mutateAsync: addPersonalAddress } = useAddPerAddress();
  const { mutateAsync: addAccount } = useAddAccount();

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const {per_addresses, ...data} = getValues("personalInfoSchema");
      const {confirmPassword, ...accountInfo} = getValues("accountFormSchema")
      
      const personal = await addPersonal({...capitalizeAllFields(data)});
      const new_addresses = await addAddress(per_addresses.list);
      await addPersonalAddress(new_addresses?.map((address: any) => ({
        add: address.add_id,
        per: personal.per_id,
      })))

      const respondent = await addBusinessRespondent({
        per: personal.per_id
      });

      await addAccount({
        ...accountInfo,
        br: respondent.br_id
      });

    } catch (error) {
      setStatus("failure");
      setIsSubmitting(false);
      setShowFeedback(true);
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
          router.push('/(auth)')
          reset();
        }}
      />
    );
  }

  return (
    <>
      <CompleteScanProcess 
        params={{
          submit: submit
        }}
      />
      <LoadingModal
        visible={isSubmitting}
      />
    </>
    
  )
}