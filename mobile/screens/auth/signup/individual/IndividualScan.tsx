import React from "react";
import CompleteScanProcess from "../CompleteScanProcess";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { LoadingModal } from "@/components/ui/loading-modal";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import { router } from "expo-router";
import {
  useAddRequest,
  useAddBusinessRespondent,
} from "../../queries/authPostQueries";
import { useRegistrationTypeContext } from "@/contexts/RegistrationTypeContext";
import { View, Text } from "react-native";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { setAuthData } from "@/redux/auth-redux/authSlice";

export default function IndividualScan() {
  const dispatch = useDispatch()
  const { getValues, reset } = useRegistrationFormContext();
  const { type } = useRegistrationTypeContext();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [showFeedback, setShowFeedback] = React.useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string>('');
  const [status, setStatus] = React.useState<"success" | "failure" | "waiting" | "message">("success");
  const { mutateAsync: addRequest } = useAddRequest();
  const { mutateAsync: addBusinessRespondent } = useAddBusinessRespondent();

  const residentRegistration = async (
    per: Record<string, any>,
    account: Record<string, any>
  ) => {
    const {email, ...acc} = account;
    const {per_id, ...new_per} = per;
    try {
      await addRequest(
        { comp: [{
            per: {
              ...new_per,
            },
            acc: {
              ...acc,
              ...(email !== "" && {email: email})
            },
            role: "Independent",
          }],
        },
        {
          onSuccess: (data) => {
            console.log(data)
            dispatch(setAuthData({ 
              accessToken: data.access_token, 
              user: data.user,
              refreshToken: data.refresh_token 
            }));
            setShowFeedback(false);
            setTimeout(() => {
              setStatus("success");
              setShowFeedback(true); 
            }, 0)
          },
        }
      );
    } catch (err) {
      setShowFeedback(false);
      setTimeout(() => {
        setStatus("failure");
        setShowFeedback(true);
        setIsSubmitting(false);
      }, 0);
    }
  };

  const busRespondentRegistration = async (
    respondent: Record<string, any>,
    account: Record<string, any>
  ) => {
    try {
      const {email, ...acc} = account;
      await addBusinessRespondent({
        ...respondent,
        acc: {
          ...acc,
          ...(email !== "" && {email: email})
        }
      }, {
        onSuccess: (data) => {
          dispatch(setAuthData({ 
            accessToken: data.access_token, 
            user: data.user,
            refreshToken: data.refresh_token 
          }));
          setShowFeedback(false);
          setTimeout(() => {
            setStatus("success");
            setShowFeedback(true); 
          }, 0)
        }
      });

    } catch (error) {
      setShowFeedback(false);
      setTimeout(() => {
        setStatus("failure");
        setShowFeedback(true);
        setIsSubmitting(false);
      }, 0);
    }
  };

  const submit = async () => {
    setIsSubmitting(true)
    setStatus('waiting');
    setShowFeedback(true);

    const { accountFormSchema, personalInfoSchema, businessRespondent } = getValues();
    const { per_addresses, ...per } = personalInfoSchema;
    const { confirmPassword, ...account } = accountFormSchema;

    switch (type) {
      case "business":
        await busRespondentRegistration({...businessRespondent, br_contact: account.phone}, account);
        break;
      default:
        await residentRegistration({...per, per_addresses: per_addresses.list}, account);
        break;
    }
  };

  const FeedbackContents: any = {
    success: (
      <View className="flex-1 justify-end">
        <Button className={`bg-primaryBlue rounded-xl native:h-[45px]`}
          onPress={() => {
            setShowFeedback(false);  
            if(type == 'business') {
              // reset()
              router.replace('/(tabs)')
            } else {
              setTimeout(() => {
                setStatus('message')
                setFeedbackMessage("Your registration request has been submitted. Please go to the barangay to verify your account, and access verified exclusive features.")
                setShowFeedback(true);
              }, 0);
            }

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
        <View className="flex-row gap-2">
          <Button variant={"outline"} className={`rounded-xl native:h-[45px]`}
            onPress={() => router.replace('/(auth)')}
          >
            <Text className="text-gray-900 text-base font-semibold">
              Cancel
            </Text>
          </Button>
          <Button className={`flex-1 bg-primaryBlue rounded-xl native:h-[45px]`}
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
    message: (
      <View className="flex-1 justify-between mt-5">
        <Text className="text-base text-gray-600 text-center mb-8 leading-6 px-4 max-w-sm">
          {feedbackMessage}
        </Text>
        <Button className={`bg-primaryBlue rounded-xl native:h-[45px]`}
          onPress={() => {
            reset()
            router.replace('/(auth)/loginscreen')
          }}
        >
          <Text className="text-white text-base font-semibold">
            Continue
          </Text>
        </Button>
      </View>
    )
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
      <CompleteScanProcess
        params={{
          submit: submit,
        }}
      />
      <LoadingModal visible={isSubmitting} />
    </>
  );
}
