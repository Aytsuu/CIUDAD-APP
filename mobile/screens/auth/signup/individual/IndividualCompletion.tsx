// import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
// import {
//   useAddPersonal,
//   useAddRequest,
//   useAddAddress,
//   useAddPerAddress,
// } from "../../queries/authPostQueries";
// import React from "react";
// import { FeedbackScreen } from "@/components/ui/feedback-screen";
// import { useRouter } from "expo-router";
// import { 
//   View, 
// } from "react-native";
// import { LoadingModal } from "@/components/ui/loading-modal";
// import { capitalizeAllFields } from "@/helpers/capitalize";
// import CompletionPage from "@/components/ui/completion-page";

// export default function IndividualCompletion() {
//   const router = useRouter();
//   const [showFeedback, setShowFeedback] = React.useState(false);
//   const [status, setStatus] = React.useState<"success" | "failure">("success");
//   const [isSubmitting, setIsSubmitting] = React.useState(false);
//   const { getValues, reset } = useRegistrationFormContext();
//   const { mutateAsync: addPersonal } = useAddPersonal();
//   const { mutateAsync: addRequest } = useAddRequest();
//   const { mutateAsync: addAddress } = useAddAddress();
//   const { mutateAsync: addPersonalAddress } = useAddPerAddress();
  
//   const submit = async () => {
//     setIsSubmitting(true);
//     try {
//       const {per_addresses, ...data} = getValues("personalInfoSchema");
//       const {confirmPassword, phone, ...accountInfo} = getValues("accountFormSchema")
      
//       addPersonal({...capitalizeAllFields(data)}, {
//         onSuccess: (newData) => {
//           addAddress(per_addresses.list, {
//             onSuccess: (new_addresses) => {
//               const per_address = new_addresses?.map((address: any) => ({
//                 add: address.add_id,
//                 per: newData.per_id,
//               }));
//               addPersonalAddress(per_address)
//             }
//           })

//           addRequest({
//             per: newData.per_id,
//             role: "Independent",
//             acc: accountInfo
//           }, {
//             onSuccess: () => {
//               setStatus("success");
//               setIsSubmitting(false);
//               setShowFeedback(true);
//               reset();
//             },
//             onError: () => {
//               setIsSubmitting(false);
//             }
//           });
//         }
//       });
//     } catch (error) {
//       setStatus("failure");
//       setIsSubmitting(false);
//       setShowFeedback(true);
//     }
//   };

//   if (showFeedback) {
//     return (
//       <FeedbackScreen
//         status={status}
//       />
//     );
//   }

//   return (
//     <View className="flex-1">
//       <CompletionPage 
//         params={{
//           submit: submit
//         }}
//       />
//       <LoadingModal 
//         visible={isSubmitting}
//       />
//     </View>
//   );
// }