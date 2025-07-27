import React from "react";
import CompleteScanProcess from "../CompleteScanProcess";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { LoadingModal } from "@/components/ui/loading-modal";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import { router } from "expo-router";
import {
  useAddPersonal,
  useAddAddress,
  useAddPerAddress,
  useAddRequest,
  useAddAccount,
  useAddBusinessRespondent,
} from "../../queries/authPostQueries";
import { capitalizeAllFields } from "@/helpers/capitalize";
import { useRegistrationTypeContext } from "@/contexts/RegistrationTypeContext";

export default function IndividualScan() {
  const { getValues, reset } = useRegistrationFormContext();
  const { type } = useRegistrationTypeContext();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [showFeedback, setShowFeedback] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<"success" | "failure">("success");
  const { mutateAsync: addPersonal } = useAddPersonal();
  const { mutateAsync: addAddress } = useAddAddress();
  const { mutateAsync: addPersonalAddress } = useAddPerAddress();
  const { mutateAsync: addRequest } = useAddRequest();
  const { mutateAsync: addBusinessRespondent } = useAddBusinessRespondent();
  const { mutateAsync: addAccount } = useAddAccount();

  const residentRegistration = async (
    per: Record<string, any>,
    per_addresses: Record<string, any>,
    account: Record<string, any>
  ) => {
    try {
      const personal = await addPersonal(capitalizeAllFields(per));
      const new_addresses = await addAddress(per_addresses.list);
      await addPersonalAddress(
        {
          data: new_addresses?.map((address: any) => ({
            add: address.add_id,
            per: personal.per_id,
          })),
        }
      );

      await addRequest(
        {
          comp: [
            {
              per: personal.per_id,
              acc: account,
              role: "Independent",
            },
          ],
        },
        {
          onSuccess: () => {
            setIsSubmitting(false);
            setStatus("success");
            setShowFeedback(true);
          },
        }
      );
    } catch (err) {
      setStatus("failure");
      setIsSubmitting(false);
      setShowFeedback(true);
    }
  };

  const busRespondentRegistration = async (
    per: Record<string, any>,
    per_addresses: Record<string, any>,
    account: Record<string, any>
  ) => {
    try {
      const personal = await addPersonal({ ...capitalizeAllFields(per) });
      console.log(personal)
      const new_addresses = await addAddress(per_addresses.list);
      await addPersonalAddress(
        {
          data: new_addresses?.map((address: any) => ({
            add: address.add_id,
            per: personal.per_id,
          })),
          history_id: personal.history
        }
      );

      const respondent = await addBusinessRespondent({
        per: personal.per_id,
      });

      await addAccount({
        ...account,
        br: respondent.br_id,
      }, {
          onSuccess: () => {
            setIsSubmitting(false);
            // setStatus("success");
            // setShowFeedback(true);
          },
        });
    } catch (error) {
      // setStatus("failure");
      setIsSubmitting(false);
      // setShowFeedback(true);
    }
  };

  const submit = async () => {
    setIsSubmitting(true);
    const { accountFormSchema, personalInfoSchema } = getValues();
    const { per_addresses, ...per } = personalInfoSchema;
    const { confirmPassword, ...account } = accountFormSchema;

    switch (type) {
      case "business":
        await busRespondentRegistration(per, per_addresses, account);
        break;
      default:
        await residentRegistration(per, per_addresses, account);
        break;
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
        onOk={() => {
          router.push("/(auth)");
          reset();
        }}
      />
    );
  }

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
