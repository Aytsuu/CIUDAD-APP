import React from "react";
import CompleteScanProcess from "../CompleteScanProcess";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { LoadingModal } from "@/components/ui/loading-modal";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import { router } from "expo-router";
import { useAddPersonal, useAddAddress, useAddPerAddress, useAddRequest } from "../../queries/authPostQueries";
import { capitalizeAllFields } from "@/helpers/capitalize";

export default function IndividualScan() {
  const { getValues, reset } = useRegistrationFormContext();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [showFeedback, setShowFeedback] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<"success" | "failure">("success");
  const { mutateAsync: addPersonal } = useAddPersonal();
    const { mutateAsync: addAddress } = useAddAddress();
    const { mutateAsync: addPersonalAddress } = useAddPerAddress();
    const { mutateAsync: addRequest } = useAddRequest();

  const submit = async () => {
    setIsSubmitting(true);

    const { accountFormSchema, personalInfoSchema } = getValues();
    const { per_addresses, ...per } = personalInfoSchema;
    const { confirmPassword, ...account } = accountFormSchema;

    const personal = await addPersonal(capitalizeAllFields(per));
    const addresses = await addAddress(per_addresses.list);
    await addPersonalAddress(
      addresses.map((add: any) => ({
        per: personal.per_id,
        add: add.add_id
      }))
    );

    await addRequest({
      comp: [{
        per: personal.per_id,
        acc: account,
        role: 'Independent'
      }]
    }, {
      onSuccess: () => {
        setIsSubmitting(false);
        setStatus('success');
        setShowFeedback(true);
      },
      onError: () => {
        setIsSubmitting(false);
      }
    })

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