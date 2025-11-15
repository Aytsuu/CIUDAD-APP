// import React from "react";
// import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
// import { LoadingModal } from "@/components/ui/loading-modal";
// import { router } from "expo-router";
// import { useDispatch } from "react-redux";
// import CompleteScanProcess from "@/screens/auth/signup/CompleteScanProcess";
// import { useToastContext } from "@/components/ui/toast";
// import { useAddPersonalModification } from "../queries/accountPostQueries";

// export default function UpdateScan() {
//   const dispatch = useDispatch()
//   const { getValues, reset } = useRegistrationFormContext();
//   const { toast } = useToastContext();
//   const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
//   const [showFeedback, setShowFeedback] = React.useState<boolean>(false);
//   const [feedbackMessage, setFeedbackMessage] = React.useState<string>('');
//   const [status, setStatus] = React.useState<"success" | "failure" | "waiting" | "message">("success");
//   const { mutateAsync: addPersonalModification } = useAddPersonalModification();

//   const submit = async () => {
//     setIsSubmitting(true)
//     const personalInfoSchema = getValues("personalInfoSchema");
//     const {per_addresses, ...per } = personalInfoSchema
//     try {
//       await addPersonalModification({
//         personal: {
//           ...personalInfoSchema,
//           per_addresses: per_addresses.list
//         }
//       });
//       toast.success("Your request has been delivered.")
//       router.back();
//     } catch (err) {
//       toast.error("Failed to submit request. Please try")
//     } finally {
//       setIsSubmitting(false)
//     }
//   };

//   return (
//     <>
//       <CompleteScanProcess
//         params={{
//           submit: submit,
//         }}
//       />
//       <LoadingModal visible={isSubmitting} />
//     </>
//   );
// }
