// import React, { useState } from "react";
// import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
// import { Calendar, CheckCircle2, AlertCircle, ClipboardList, CreditCard, ChevronRight, Clock, XCircle, Check} from "lucide-react-native";
// import { useRouter } from "expo-router";
// import { formatDate } from "@/helpers/dateHelpers";
// import { Card } from "@/components/ui/card";
// import { useGetCaseTrackingDetails } from "./queries/summon-relatedFetchQueries";
// import { LoadingState } from "@/components/ui/loading-state";
// import { formatTimestamp } from "@/helpers/timestampformatter";
// import { formatTime } from "@/helpers/timeFormatter";

// export default function CaseTrackingScreen({ comp_id, isRaised = "Raised",
// }: {
//   comp_id?: string;
//   isRaised?: string;
// }) {
//   const router = useRouter();
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   const { data: tracking, isLoading, error, refetch } = useGetCaseTrackingDetails( comp_id ? comp_id : "");

//   // Refresh function
//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await refetch();
//     setIsRefreshing(false);
//   };

//   if (isRaised !== "Raised") {
//     return (
//       <View className="flex-1 bg-gradient-to-b from-blue-50 to-white justify-center items-center p-6">
//         <View className="bg-white rounded-2xl p-10 items-center shadow-lg border border-blue-100 max-w-md w-full">
//           <View className="bg-blue-100 p-4 rounded-full mb-5">
//             <ClipboardList size={48} color="#2563eb" />
//           </View>
//           <Text className="text-2xl font-bold text-gray-800 text-center mb-3">
//             Case Tracking Not Available
//           </Text>
//           <Text className="text-gray-600 text-center mb-6 leading-6">
//             Your complaint has not been raised yet.
//           </Text>
//           <Text className="text-sm text-gray-500 text-center">
//             Once raised, you'll see real-time updates on your case progress here.
//           </Text>
//         </View>
//       </View>
//     );
//   }

//   // Loading state
//   if (isLoading) {
//     return (
//       <View className="flex-1 bg-gradient-to-b from-blue-50 to-white justify-center items-center">
//         <View className="h-64 justify-center items-center">
//           <LoadingState />
//         </View>
//       </View>
//     );
//   }

//   // Error state
//   if (error || !tracking) {
//     return (
//       <View className="flex-1 justify-center items-center bg-gradient-to-b from-blue-50 to-white">
//         <AlertCircle size={56} color="#f59e0b" />
//         <Text className="mt-4 text-lg text-gray-700">No case data found</Text>
//       </View>
//     );
//   }

//   // Get case status display
//   const getCaseStatusDisplay = () => {
//     return (
//       tracking.summon_case?.sc_conciliation_status ||
//       tracking.summon_case?.sc_mediation_status ||
//       "None"
//     );
//   };

//   const handleSchedulePress = () => {
//     router.push({
//       pathname: "/(my-request)/complaint-tracking/hearing-history",
//       params: {
//         sc_id: tracking?.summon_case?.sc_id || "",
//         status: getCaseStatusDisplay(),
//       },
//     });
//   };

//   const handlePaymentPress = () => {
//     // Navigate to payment logs screen
//     router.push({
//       pathname: "/(my-request)/complaint-tracking/summon-payment-logs",
//       params: {
//         comp_id: comp_id,
//       },
//     });
//   };

//   const handleCaseCompletionPress = () => {
//     router.push({
//       pathname: "/(my-request)/complaint-tracking/file-action-payment-logs",
//       params: {
//         comp_id: comp_id,
//       },
//     });
//   };

//   const getSteps = () => {
//     const steps: {
//       id: number;
//       title: string;
//       description: React.ReactNode;
//       status: string;
//       display_status: string;
//       details: React.ReactNode;
//       onPress: () => void;
//       isActionable: boolean;
//     }[] = [];

//     // 1 – Payment
//     const payStatus = tracking.payment_request_summon?.pay_status?.toLowerCase() ?? "unpaid";
//     const amount = tracking.payment_request_summon?.pay_amount;
//     const isDeclined = payStatus === "declined";

//     steps.push({
//       id: 1,
//       title: "Payment",
//       description: payStatus === "paid" ? (
//         <View className="space-y-1">
//           <Text className="text-gray-600 text-sm leading-5">Payment completed!</Text>
//         </View>
//       ) : isDeclined ? (
//         <View className="space-y-1">
//           <Text className="text-gray-600 text-sm leading-5">
//             Your payment request has been declined.
//           </Text>
//           <Text className="text-red-600 text-xs italic leading-4 mt-1">
//             Please contact the barangay for more information.
//           </Text>
//         </View>
//       ) : (
//         <View className="space-y-1">
//           <Text className="text-gray-600 text-sm leading-5">
//             Please pay the mediation fee at the barangay hall to proceed with scheduling your hearing session.
//           </Text>
//           <Text className="text-red-600 text-xs italic leading-4 mt-1">
//             Important: Unpaid requests will be automatically declined after the due date.
//           </Text>
//         </View>
//       ),
//       status: payStatus,
//       display_status: tracking.payment_request_summon?.pay_status || "Unpaid",
//       details: (
//         <View className="space-y-1">
//           <View className="flex flex-row items-center justify-between w-full">
//             <Text className="text-xs text-gray-600 font-medium">Amount</Text>
//             <Text className="text-xs font-semibold text-blue-600">
//               ₱ {amount ? amount.toLocaleString() : "N/A"}
//             </Text>
//           </View>
//           <View className="flex flex-row items-center justify-between w-full">
//             <Text className="text-xs text-gray-600 font-medium">
//               {payStatus === "unpaid" ? "Due Date" : payStatus === "paid" ? "Date Paid" : "Declined Date"}
//             </Text>
//             <Text
//               className={`text-xs font-semibold ${
//                 payStatus === "paid" ? "text-green-600" : 
//                 payStatus === "declined" ? "text-red-600" : "text-red-600"
//               }`}
//             >
//               {payStatus === "unpaid"
//                 ? formatDate(tracking?.payment_request_summon?.pay_due_date || "", "long")
//                 : payStatus === "paid"
//                 ? formatTimestamp(tracking.payment_request_summon?.pay_date_paid || "")
//                 : formatTimestamp(tracking.payment_request_summon?.pay_date_paid || "N/A")}
//             </Text>
//           </View>
//           {isDeclined && (
//             <View className="w-full">
//               <Text className="text-xs text-gray-600 font-medium mb-1">Reason</Text>
//                 <Text className="text-xs text-red-600 italic">
//                   {tracking.payment_request_summon?.pay_reason || "Request Declined"}
//                 </Text>
//             </View>
//           )}
//         </View>
//       ),
//       onPress: handlePaymentPress,
//       isActionable: false // Step 1 is no longer pressable
//     });

//     // Helper: Schedule Hearing Description
//     const getScheduleHearingDescription = () => {
//       const status = getCaseStatusDisplay().toLowerCase();

//       if (status === "waiting for schedule" && tracking.summon_case?.hearing_schedules.length !== 6) {
//       return (
//           <View className="space-y-1">
//             <Text className="text-gray-600 text-sm leading-5">
//               Select date and time for your hearing session.
//             </Text>
//           </View>
//         );
//       }

//       if (status === "waiting for schedule" && tracking.summon_case?.hearing_schedules.length === 6) {
//       return (
//           <View className="space-y-1">
//             <Text className="text-gray-600 text-sm leading-5">
//               Your case has reached the final hearing session
//             </Text>
//           </View>
//         );
//       }

//       if (status === "ongoing") {
//         const openSchedule = tracking.summon_case?.hearing_schedules?.find(
//           (schedule) => !schedule.hs_is_closed
//         );

//         if (openSchedule) {
//           const remark = openSchedule.remark?.rem_remarks;
//           return (
//             <View className="space-y-2">
//               <Text className="text-gray-600 text-sm leading-5">
//                 {remark
//                   ? "The barangay staff has provided an update on your hearing session."
//                   : "Your schedule is ready and waiting for a remark from barangay staff."}
//               </Text>
//             </View>
//           );
//         }

//         return (
//           <View className="space-y-1">
//             <Text className="text-gray-600 text-sm leading-5">
//               Hearing session details are being finalized. Please check back later.
//             </Text>
//           </View>
//         );
//       }

//       if (status === "escalated") {
//         return (
//           <View className="space-y-1">
//             <Text className="text-gray-600 text-sm leading-5">
//               This case has been escalated to higher court as it was unresolvable at the barangay level.
//             </Text>
//           </View>
//         );
//       }

//       if (status === "resolved") {
//         return (
//           <View className="space-y-1">
//             <Text className="text-gray-600 text-sm leading-5">
//               The case has been successfully resolved through hearing sessions.
//             </Text>
//           </View>
//         );
//       }

//       return (
//         <View className="space-y-1">
//           <Text className="text-gray-600 text-sm leading-5">
//             Attend the scheduled mediation session with both parties.
//           </Text>
//         </View>
//       );
//     };

//     // Helper: Schedule Hearing Details
//     const getScheduleHearingDetails = () => {
//       const status = getCaseStatusDisplay().toLowerCase();

//       if (status === "waiting for schedule" && tracking.summon_case?.hearing_schedules.length !== 6) {
//         return (
//           <Text className="text-xs text-gray-700">
//             Waiting for you to select a hearing date and time.
//           </Text>
//         );
//       }

//       if (status === "waiting for schedule" && tracking.summon_case?.hearing_schedules.length === 6) {
//         return (
//           <Text className="text-xs text-gray-700">
//             Waiting for the barangay's final verdict.
//           </Text>
//         );
//       }

//       if (status === "ongoing") {
//         const openSchedule = tracking.summon_case?.hearing_schedules?.find(
//           (schedule) => !schedule.hs_is_closed
//         );

//         if (openSchedule) {
//           const hearingDate =
//             formatDate(openSchedule.summon_date?.sd_date, "long") || "Date not set";
//           const hearingTime = openSchedule.summon_time?.st_start_time
//             ? formatTime(openSchedule.summon_time.st_start_time)
//             : "Time not set";

//           return (
//             <Text className="text-xs text-gray-700">
//               Scheduled for {hearingDate} at {hearingTime}
//             </Text>
//           );
//         }

//         return <Text className="text-xs text-gray-700">Hearing session in progress</Text>;
//       }

//       if (status === "escalated") {
//         return (
//           <Text className="text-xs text-gray-700">
//             Case forwarded to higher judicial authorities
//           </Text>
//         );
//       }

//       if (status === "resolved") {
//         return <Text className="text-xs text-gray-700">Case successfully closed</Text>
        
//       }

//       return <Text className="text-xs text-gray-700">Pending hearing scheduling</Text>;
//     };

//     // 2 – Schedule Hearing
//     steps.push({
//       id: 2,
//       title: "Schedule Hearing",
//       description: getScheduleHearingDescription(),
//       status: getCaseStatusDisplay().toLowerCase(),
//       display_status: getCaseStatusDisplay(),
//       details: getScheduleHearingDetails(),
//       onPress: handleSchedulePress,
//       isActionable: true // Step 2 remains pressable
//     });

//     // Helper: Case Completion Description
//     const getCaseCompletionDescription = () => {
//       const status = getCaseStatusDisplay().toLowerCase();
      
//       if (status === "resolved") {
//         return (
//           <View className="space-y-1">
//             <Text className="text-gray-600 text-sm leading-5">
//               The case has been successfully resolved and closed.
//             </Text>
//           </View>
//         );
//       }
      
//       if (status === "escalated") {
//         return (
//           <View className="space-y-1">
//             <Text className="text-gray-600 text-sm leading-5">
//               The case has been escalated to higher judicial authorities for further legal action.
//             </Text>
//           </View>
//         );
//       }

//       // Default description for ongoing cases
//       return (
//         <View className="space-y-1">
//           <Text className="text-gray-600 text-sm leading-5">
//             The case can be resolved at any hearing session or escalated after reaching the final session.
//           </Text>
//           <Text className="text-blue-600 text-xs italic leading-4 mt-1">
//             The final outcome depends on the progress and agreement between parties.
//           </Text>
//         </View>
//       );
//     };

//     // Helper: Case Completion Details
//     const getCaseCompletionDetails = () => {
//       const status = getCaseStatusDisplay().toLowerCase();
      
//       if (status === "resolved" && tracking.summon_case?.sc_date_marked) {
//         return (
//           <View className="space-y-2">
//             <View className="flex flex-row items-center justify-between w-full">
//               <Text className="text-xs text-gray-600 font-medium">Resolution Date</Text>
//               <Text className="text-xs font-semibold text-green-600">
//                 {formatTimestamp(tracking.summon_case.sc_date_marked)}
//               </Text>
//             </View>
//             {tracking.summon_case?.staff_name && (
//               <View className="flex flex-row items-center justify-between w-full">
//                 <Text className="text-xs text-gray-600 font-medium">Resolved By</Text>
//                 <Text className="text-xs font-semibold text-gray-700">
//                   {tracking.summon_case.staff_name}
//                 </Text>
//               </View>
//             )}
//           </View>
//         );
//       }
      
//       if (status === "escalated" && tracking.summon_case?.sc_date_marked) {
//         return (
//           <View className="space-y-2">
//             <View className="flex flex-row items-center justify-between w-full">
//               <Text className="text-xs text-gray-600 font-medium">Escalation Date</Text>
//               <Text className="text-xs font-semibold text-red-600">
//                 {formatTimestamp(tracking.summon_case.sc_date_marked)}
//               </Text>
//             </View>
//             {tracking.summon_case?.staff_name && (
//               <View className="flex flex-row items-center justify-between w-full">
//                 <Text className="text-xs text-gray-600 font-medium">Escalated By</Text>
//                 <Text className="text-xs font-semibold text-gray-700">
//                   {tracking.summon_case.staff_name}
//                 </Text>
//               </View>
//             )}
//           </View>
//         );
//       }

//       // Default details for ongoing cases
//       return (
//         <Text className="text-xs text-gray-700">
//           Waiting for the final outcome after all hearing sessions are completed.
//         </Text>
//       );
//     };

//     // 3 – Case Completion
//     steps.push({
//       id: 3,
//       title: "Case Completion",
//       description: getCaseCompletionDescription(),
//       status: getCaseStatusDisplay().toLowerCase(),
//       display_status: getCaseStatusDisplay(),
//       details: getCaseCompletionDetails(),
//       onPress: handleCaseCompletionPress,
//       isActionable: false // Step 3 is no longer pressable
//     });

//     return steps;
//   };

//   const steps = getSteps();

//   const isPreviousStepCompleted = (currentIdx: number) => {
//     if (currentIdx === 0) return true;
//     const prev = steps[currentIdx - 1];
//     return ["paid", "scheduled", "resolved", "escalated"].includes(prev.status);
//   };

//   const getStatusBadge = (status: string) => {
//     const statusMap: Record<
//       string,
//       { bg: string; text: string; label: string; icon: React.ReactNode }
//     > = {
//       paid: {
//         bg: "bg-emerald-100",
//         text: "text-emerald-800",
//         label: "Paid",
//         icon: <Check size={14} className="text-emerald-600" />,
//       },
//       scheduled: {
//         bg: "bg-emerald-100",
//         text: "text-emerald-800",
//         label: "Scheduled",
//         icon: <Check size={14} className="text-emerald-600" />,
//       },
//       resolved: {
//         bg: "bg-emerald-100",
//         text: "text-emerald-800",
//         label: "Resolved",
//         icon: <Check size={14} className="text-emerald-600" />,
//       },
//       pending: {
//         bg: "bg-amber-100",
//         text: "text-amber-800",
//         label: "Pending",
//         icon: <Clock size={14} className="text-amber-600" />,
//       },
//       unpaid: {
//         bg: "bg-amber-100",
//         text: "text-amber-800",
//         label: "Unpaid",
//         icon: <Clock size={14} className="text-amber-600" />,
//       },
//       declined: {
//         bg: "bg-red-100",
//         text: "text-red-800",
//         label: "Declined",
//         icon: <XCircle size={14} className="text-red-600" />,
//       },
//       "not scheduled": {
//         bg: "bg-amber-100",
//         text: "text-amber-800",
//         label: "Not Scheduled",
//         icon: <Clock size={14} className="text-amber-600" />,
//       },
//       "in progress": {
//         bg: "bg-blue-100",
//         text: "text-blue-800",
//         label: "In Progress",
//         icon: <Clock size={14} className="text-blue-600" />,
//       },
//       ongoing: {
//         bg: "bg-blue-100",
//         text: "text-blue-800",
//         label: "Ongoing",
//         icon: <Clock size={14} className="text-blue-600" />,
//       },
//       "waiting for schedule": {
//         bg: "bg-amber-100",
//         text: "text-amber-800",
//         label: "Waiting for Schedule",
//         icon: <Clock size={14} className="text-amber-600" />,
//       },
//       rejected: {
//         bg: "bg-red-100",
//         text: "text-red-800",
//         label: "Rejected",
//         icon: <XCircle size={14} className="text-red-600" />,
//       },
//       overdue: {
//         bg: "bg-red-100",
//         text: "text-red-800",
//         label: "Overdue",
//         icon: <XCircle size={14} className="text-red-600" />,
//       },
//       rescheduled: {
//         bg: "bg-red-100",
//         text: "text-red-800",
//         label: "Rescheduled",
//         icon: <XCircle size={14} className="text-red-600" />,
//       },
//       escalated: {
//         bg: "bg-red-100",
//         text: "text-red-800",
//         label: "Escalated",
//         icon: <XCircle size={14} className="text-red-600" />,
//       },
//     };

//     const item =
//       statusMap[status.toLowerCase()] ?? {
//         bg: "bg-gray-100",
//         text: "text-gray-800",
//         label: status,
//         icon: <Clock size={14} className="text-gray-600" />,
//       };

//     return (
//       <View className={`flex-row items-center px-3 py-1.5 rounded-full ${item.bg}`}>
//         {item.icon}
//         <Text className={`ml-1.5 text-xs font-semibold ${item.text}`}>
//           {item.label}
//         </Text>
//       </View>
//     );
//   };

//   const getStepIcon = (step: any) => {
//     switch (step.id) {
//       case 1:
//         return (
//           <CreditCard
//             size={22}
//             className={
//               step.status === "paid"
//                 ? "text-green-600"
//                 : step.status === "unpaid"
//                 ? "text-red-600"
//                 : step.status === "declined"
//                 ? "text-red-600"
//                 : "text-amber-600"
//             }
//           />
//         );
//       case 2:
//         return (
//           <Calendar
//             size={22}
//             className={step.status === "scheduled" ? "text-green-600" : "text-amber-600"}
//           />
//         );
//       case 3:
//         return (
//           <CheckCircle2
//             size={22}
//             className={
//               step.status === "resolved"
//                 ? "text-green-600"
//                 : step.status === "escalated"
//                 ? "text-red-600"
//                 : "text-gray-500"
//             }
//           />
//         );
//       default:
//         return <Calendar size={22} className="text-gray-500" />;
//     }
//   };

//   const isStepCompleted = (step: any, stepIndex: number) => {
//     switch (step.id) {
//       case 1:
//         return step.status === "paid";
//       case 2:
//         return step.status === "resolved" || step.status === "escalated";
//       case 3:
//         return step.status === "resolved" || step.status === "escalated";
//       default:
//         return false;
//     }
//   };


//   return (
//     <View className="flex-1 bg-gradient-to-b from-blue-50 to-white">
//       <ScrollView 
//         className="flex-1" 
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={handleRefresh}
//             colors={['#00a8f0']}
//             tintColor="#00a8f0"
//           />
//         }
//       >
//         <View className="px-5 py-6 space-y-6">
//           {steps.map((step, idx) => {
//             const isLast = idx === steps.length - 1;
//             const isCompleted = isStepCompleted(step, idx);
//             const isLocked = !isPreviousStepCompleted(idx);

//             return (
//               <View key={step.id} className="relative">
//                 {/* Connector line */}
//                 {!isLast && (
//                   <View
//                     className={`absolute left-6 top-15 w-0.5 h-full -z-0 ${
//                       isStepCompleted(steps[idx + 1], idx + 1)
//                         ? "bg-blue-500"
//                         : "bg-gray-300"
//                     }`}
//                   />
//                 )}

//                 <View className="flex-row">
//                   {/* Icon Circle */}
//                   <View className="items-center mr-4">
//                     <View
//                       className={`w-12 h-12 rounded-full flex items-center justify-center ${
//                         isCompleted
//                           ? "bg-emerald-100 border-2 border-emerald-500"
//                           : !isLocked
//                           ? "bg-blue-100 border-2 border-blue-500"
//                           : "bg-gray-100 border-2 border-gray-300"
//                       }`}
//                     >
//                       {isCompleted ? (
//                         <Check size={20} className="text-emerald-600" />
//                       ) : (
//                         getStepIcon(step)
//                       )}
//                     </View>
//                   </View>

//                   {/* Content */}
//                   <View className="flex-1 pb-8">
//                     {isLocked ? (
//                       <View className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200 opacity-60">
//                         <View className="flex-row items-center justify-between">
//                           <View className="flex-row items-center">
//                             <Text className="text-2xl font-bold text-gray-300 mr-3">
//                               {step.id}
//                             </Text>
//                             <Text className="text-lg font-bold text-gray-500">{step.title}</Text>
//                           </View>
//                         </View>
//                       </View>
//                     ) : (
//                       // Conditionally render TouchableOpacity only for actionable steps
//                       step.isActionable ? (
//                         <TouchableOpacity
//                           onPress={step.onPress}
//                           className={`bg-white rounded-xl p-5 shadow-md border-2 ${
//                             isCompleted
//                               ? "border-emerald-200 active:bg-emerald-50"
//                               : "border-blue-200 active:bg-blue-50"
//                           }`}
//                         >
//                           <View className="flex-row justify-between items-start mb-3">
//                             <View className="flex-1">
//                               <View className="flex-row items-center mb-2">
//                                 <Text className="text-2xl font-bold text-gray-300 mr-3">
//                                   {step.id}
//                                 </Text>
//                                 <Text className="text-lg font-bold text-gray-900">
//                                   {step.title}
//                                 </Text>
//                               </View>
//                               {getStatusBadge(step.display_status || "")}
//                             </View>
//                             <ChevronRight
//                               size={22}
//                               className={
//                                 isCompleted ? "text-emerald-600 mt-1" : "text-blue-600 mt-1"
//                               }
//                             />
//                           </View>
//                           <View className="space-y-3">
//                             {step.description}
//                             {step.details && (
//                               <View className="mt-2">
//                                 <View className={`p-3 rounded-lg border ${
//                                   isCompleted ? "bg-emerald-50 border-emerald-100" : "bg-blue-50 border-blue-100"
//                                 }`}>
//                                   {step.details}
//                                 </View>
//                               </View>
//                             )}
//                           </View>
//                         </TouchableOpacity>
//                       ) : (
//                         // Non-actionable step (Step 1 and 3)
//                         <View
//                           className={`bg-white rounded-xl p-5 shadow-md border-2 ${
//                             isCompleted
//                               ? "border-emerald-200"
//                               : "border-blue-200"
//                           }`}
//                         >
//                           <View className="flex-row justify-between items-start mb-3">
//                             <View className="flex-1">
//                               <View className="flex-row items-center mb-2">
//                                 <Text className="text-2xl font-bold text-gray-300 mr-3">
//                                   {step.id}
//                                 </Text>
//                                 <Text className="text-lg font-bold text-gray-900">
//                                   {step.title}
//                                 </Text>
//                               </View>
//                               {getStatusBadge(step.display_status || "")}
//                             </View>
//                             {/* Remove ChevronRight for non-actionable steps */}
//                           </View>
//                           <View className="space-y-3">
//                             {step.description}
//                             {step.details && (
//                               <View className="mt-2">
//                                 <View className={`p-3 rounded-lg border ${
//                                   isCompleted ? "bg-emerald-50 border-emerald-100" : "bg-blue-50 border-blue-100"
//                                 }`}>
//                                   {step.details}
//                                 </View>
//                               </View>
//                             )}
//                           </View>
//                         </View>
//                       )
//                     )}
//                   </View>
//                 </View>
//               </View>
//             );
//           })}
//         </View>

//         {/* Case Summary Card */}
//         {tracking.payment_request_summon?.pay_status === "Paid" && (
//           <View className="px-5 pb-8">
//             <TouchableOpacity>
//               <Card className="overflow-hidden shadow-lg border-0 active:bg-gray-50">
//                 <View className="bg-primaryBlue px-6 py-4">
//                   <View className="flex-row items-center space-x-2 gap-2">
//                     <ClipboardList size={20} color="white" />
//                     <Text className="text-white font-bold text-lg">Case Summary</Text>
//                   </View>
//                 </View>

//                 <View className="p-6 space-y-5 bg-white">
//                   <View className="flex-row justify-between items-center">
//                     <Text className="text-gray-500 text-sm font-medium">Case No.</Text>
//                     <Text className="text-blue-600 font-bold text-sm tracking-wider">
//                       {tracking.summon_case?.sc_code ?? "N/A"}
//                     </Text>
//                   </View>

//                   <View className="h-px bg-gray-200 my-2" />

//                   <View className="flex-row justify-between items-center mb-2">
//                     <View className="flex-row items-center space-x-2 gap-2">
//                       <CreditCard size={16} className="text-emerald-500" />
//                       <Text className="text-gray-600 text-sm">Payment Status</Text>
//                     </View>
//                     {getStatusBadge("Paid")}
//                   </View>
//                   <View className="flex-row justify-between items-center">
//                     <View className="flex-row items-center space-x-2 gap-2">
//                       <CheckCircle2
//                         size={16}
//                         className={
//                           getCaseStatusDisplay() === "Resolved"
//                             ? "text-emerald-500"
//                             : getCaseStatusDisplay() === "Ongoing"
//                             ? "text-blue-500"
//                             : getCaseStatusDisplay() === "Waiting for Schedule"
//                             ? "text-amber-500"
//                             : "text-red-500"
//                         }
//                       />
//                       <Text className="text-gray-600 text-sm">Case Status</Text>
//                     </View>
//                     {getStatusBadge(getCaseStatusDisplay())}
//                   </View>
//                 </View>
//               </Card>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { Calendar, CheckCircle2, AlertCircle, ClipboardList, CreditCard, ChevronRight, Clock, XCircle, Check} from "lucide-react-native";
import { useRouter } from "expo-router";
import { formatDate } from "@/helpers/dateHelpers";
import { Card } from "@/components/ui/card";
import { useGetCaseTrackingDetails } from "./queries/summon-relatedFetchQueries";
import { LoadingState } from "@/components/ui/loading-state";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { formatTime } from "@/helpers/timeFormatter";

export default function CaseTrackingScreen({ comp_id, isRaised = "Raised",
}: {
  comp_id?: string;
  isRaised?: string;
}) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: tracking, isLoading, error, refetch } = useGetCaseTrackingDetails( comp_id ? comp_id : "");

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Get case status display
  const getCaseStatusDisplay = () => {
    return (
      tracking?.summon_case?.sc_conciliation_status ||
      tracking?.summon_case?.sc_mediation_status ||
      "None"
    );
  };

  const handleSchedulePress = () => {
    router.push({
      pathname: "/(my-request)/complaint-tracking/hearing-history",
      params: {
        sc_id: tracking?.summon_case?.sc_id || "",
        status: getCaseStatusDisplay(),
      },
    });
  };

  const handlePaymentPress = () => {
    router.push({
      pathname: "/(my-request)/complaint-tracking/summon-payment-logs",
      params: {
        comp_id: comp_id,
      },
    });
  };

  const handleCaseCompletionPress = () => {
    router.push({
      pathname: "/(my-request)/complaint-tracking/file-action-payment-logs",
      params: {
        comp_id: comp_id,
      },
    });
  };

  const getSteps = () => {
    const steps: {
      id: number;
      title: string;
      description: React.ReactNode;
      status: string;
      display_status: string;
      details: React.ReactNode;
      onPress: () => void;
      isActionable: boolean;
    }[] = [];

    // 1 – Payment
    const payStatus = tracking?.payment_request_summon?.pay_status?.toLowerCase() ?? "unpaid";
    const amount = tracking?.payment_request_summon?.pay_amount;
    const isDeclined = payStatus === "declined";

    steps.push({
      id: 1,
      title: "Payment",
      description: payStatus === "paid" ? (
        <View className="space-y-1">
          <Text className="text-gray-600 text-sm leading-5">Payment completed!</Text>
        </View>
      ) : isDeclined ? (
        <View className="space-y-1">
          <Text className="text-gray-600 text-sm leading-5">
            Your payment request has been declined.
          </Text>
          <Text className="text-red-600 text-xs italic leading-4 mt-1">
            Please contact the barangay for more information.
          </Text>
        </View>
      ) : (
        <View className="space-y-1">
          <Text className="text-gray-600 text-sm leading-5">
            Please pay the mediation fee at the barangay hall to proceed with scheduling your hearing session.
          </Text>
          <Text className="text-red-600 text-xs italic leading-4 mt-1">
            Important: Unpaid requests will be automatically declined after the due date.
          </Text>
        </View>
      ),
      status: payStatus,
      display_status: tracking?.payment_request_summon?.pay_status || "Unpaid",
      details: (
        <View className="space-y-1">
          <View className="flex flex-row items-center justify-between w-full">
            <Text className="text-xs text-gray-600 font-medium">Amount</Text>
            <Text className="text-xs font-semibold text-blue-600">
              ₱ {amount ? amount.toLocaleString() : "N/A"}
            </Text>
          </View>
          <View className="flex flex-row items-center justify-between w-full">
            <Text className="text-xs text-gray-600 font-medium">
              {payStatus === "unpaid" ? "Due Date" : payStatus === "paid" ? "Date Paid" : "Declined Date"}
            </Text>
            <Text
              className={`text-xs font-semibold ${
                payStatus === "paid" ? "text-green-600" : 
                payStatus === "declined" ? "text-red-600" : "text-red-600"
              }`}
            >
              {payStatus === "unpaid"
                ? formatDate(tracking?.payment_request_summon?.pay_due_date || "", "long")
                : payStatus === "paid"
                ? formatTimestamp(tracking?.payment_request_summon?.pay_date_paid || "")
                : formatTimestamp(tracking?.payment_request_summon?.pay_date_paid || "N/A")}
            </Text>
          </View>
          {isDeclined && (
            <View className="w-full">
              <Text className="text-xs text-gray-600 font-medium mb-1">Reason</Text>
                <Text className="text-xs text-red-600 italic">
                  {tracking?.payment_request_summon?.pay_reason || "Request Declined"}
                </Text>
            </View>
          )}
        </View>
      ),
      onPress: handlePaymentPress,
      isActionable: false // Step 1 is no longer pressable
    });

    // Helper: Schedule Hearing Description
    const getScheduleHearingDescription = () => {
      const status = getCaseStatusDisplay().toLowerCase();

      if (status === "waiting for schedule" && tracking?.summon_case?.hearing_schedules.length !== 6) {
      return (
          <View className="space-y-1">
            <Text className="text-gray-600 text-sm leading-5">
              Select date and time for your hearing session.
            </Text>
          </View>
        );
      }

      if (status === "waiting for schedule" && tracking?.summon_case?.hearing_schedules.length === 6) {
      return (
          <View className="space-y-1">
            <Text className="text-gray-600 text-sm leading-5">
              Your case has reached the final hearing session
            </Text>
          </View>
        );
      }

      if (status === "ongoing") {
        const openSchedule = tracking?.summon_case?.hearing_schedules?.find(
          (schedule) => !schedule.hs_is_closed
        );

        if (openSchedule) {
          const remark = openSchedule.remark?.rem_remarks;
          return (
            <View className="space-y-2">
              <Text className="text-gray-600 text-sm leading-5">
                {remark
                  ? "The barangay staff has provided an update on your hearing session."
                  : "Your schedule is ready and waiting for a remark from barangay staff."}
              </Text>
            </View>
          );
        }

        return (
          <View className="space-y-1">
            <Text className="text-gray-600 text-sm leading-5">
              Hearing session details are being finalized. Please check back later.
            </Text>
          </View>
        );
      }

      if (status === "escalated") {
        return (
          <View className="space-y-1">
            <Text className="text-gray-600 text-sm leading-5">
              This case has been escalated to higher court as it was unresolvable at the barangay level.
            </Text>
          </View>
        );
      }

      if (status === "resolved") {
        return (
          <View className="space-y-1">
            <Text className="text-gray-600 text-sm leading-5">
              The case has been successfully resolved through hearing sessions.
            </Text>
          </View>
        );
      }

      return (
        <View className="space-y-1">
          <Text className="text-gray-600 text-sm leading-5">
            Attend the scheduled mediation session with both parties.
          </Text>
        </View>
      );
    };

    // Helper: Schedule Hearing Details
    const getScheduleHearingDetails = () => {
      const status = getCaseStatusDisplay().toLowerCase();

      if (status === "waiting for schedule" && tracking?.summon_case?.hearing_schedules.length !== 6) {
        return (
          <Text className="text-xs text-gray-700">
            Waiting for you to select a hearing date and time.
          </Text>
        );
      }

      if (status === "waiting for schedule" && tracking?.summon_case?.hearing_schedules.length === 6) {
        return (
          <Text className="text-xs text-gray-700">
            Waiting for the barangay's final verdict.
          </Text>
        );
      }

      if (status === "ongoing") {
        const openSchedule = tracking?.summon_case?.hearing_schedules?.find(
          (schedule) => !schedule.hs_is_closed
        );

        if (openSchedule) {
          const hearingDate =
            formatDate(openSchedule.summon_date?.sd_date, "long") || "Date not set";
          const hearingTime = openSchedule.summon_time?.st_start_time
            ? formatTime(openSchedule.summon_time.st_start_time)
            : "Time not set";

          return (
            <Text className="text-xs text-gray-700">
              Scheduled for {hearingDate} at {hearingTime}
            </Text>
          );
        }

        return <Text className="text-xs text-gray-700">Hearing session in progress</Text>;
      }

      if (status === "escalated") {
        return (
          <Text className="text-xs text-gray-700">
            Case forwarded to higher judicial authorities
          </Text>
        );
      }

      if (status === "resolved") {
        return <Text className="text-xs text-gray-700">Case successfully closed</Text>
        
      }

      return <Text className="text-xs text-gray-700">Pending hearing scheduling</Text>;
    };

    // 2 – Schedule Hearing
    steps.push({
      id: 2,
      title: "Schedule Hearing",
      description: getScheduleHearingDescription(),
      status: getCaseStatusDisplay().toLowerCase(),
      display_status: getCaseStatusDisplay(),
      details: getScheduleHearingDetails(),
      onPress: handleSchedulePress,
      isActionable: true // Step 2 remains pressable
    });

    // Helper: Case Completion Description
    const getCaseCompletionDescription = () => {
      const status = getCaseStatusDisplay().toLowerCase();
      
      if (status === "resolved") {
        return (
          <View className="space-y-1">
            <Text className="text-gray-600 text-sm leading-5">
              The case has been successfully resolved and closed.
            </Text>
          </View>
        );
      }
      
      if (status === "escalated") {
        return (
          <View className="space-y-1">
            <Text className="text-gray-600 text-sm leading-5">
              The case has been escalated to higher judicial authorities for further legal action.
            </Text>
          </View>
        );
      }

      // Default description for ongoing cases
      return (
        <View className="space-y-1">
          <Text className="text-gray-600 text-sm leading-5">
            The case can be resolved at any hearing session or escalated after reaching the final session.
          </Text>
          <Text className="text-blue-600 text-xs italic leading-4 mt-1">
            The final outcome depends on the progress and agreement between parties.
          </Text>
        </View>
      );
    };

    // Helper: Case Completion Details
    const getCaseCompletionDetails = () => {
      const status = getCaseStatusDisplay().toLowerCase();
      
      if (status === "resolved" && tracking?.summon_case?.sc_date_marked) {
        return (
          <View className="space-y-2">
            <View className="flex flex-row items-center justify-between w-full">
              <Text className="text-xs text-gray-600 font-medium">Resolution Date</Text>
              <Text className="text-xs font-semibold text-green-600">
                {formatTimestamp(tracking.summon_case.sc_date_marked)}
              </Text>
            </View>
            {tracking.summon_case?.staff_name && (
              <View className="flex flex-row items-center justify-between w-full">
                <Text className="text-xs text-gray-600 font-medium">Resolved By</Text>
                <Text className="text-xs font-semibold text-gray-700">
                  {tracking.summon_case.staff_name}
                </Text>
              </View>
            )}
          </View>
        );
      }
      
      if (status === "escalated" && tracking?.summon_case?.sc_date_marked) {
        return (
          <View className="space-y-2">
            <View className="flex flex-row items-center justify-between w-full">
              <Text className="text-xs text-gray-600 font-medium">Escalation Date</Text>
              <Text className="text-xs font-semibold text-red-600">
                {formatTimestamp(tracking.summon_case.sc_date_marked)}
              </Text>
            </View>
            {tracking.summon_case?.staff_name && (
              <View className="flex flex-row items-center justify-between w-full">
                <Text className="text-xs text-gray-600 font-medium">Escalated By</Text>
                <Text className="text-xs font-semibold text-gray-700">
                  {tracking.summon_case.staff_name}
                </Text>
              </View>
            )}
          </View>
        );
      }

      // Default details for ongoing cases
      return (
        <Text className="text-xs text-gray-700">
          Waiting for the final outcome after all hearing sessions are completed.
        </Text>
      );
    };

    // 3 – Case Completion
    steps.push({
      id: 3,
      title: "Case Completion",
      description: getCaseCompletionDescription(),
      status: getCaseStatusDisplay().toLowerCase(),
      display_status: getCaseStatusDisplay(),
      details: getCaseCompletionDetails(),
      onPress: handleCaseCompletionPress,
      isActionable: false // Step 3 is no longer pressable
    });

    return steps;
  };

  const isPreviousStepCompleted = (currentIdx: number) => {
    if (currentIdx === 0) return true;
    const steps = getSteps();
    const prev = steps[currentIdx - 1];
    return ["paid", "scheduled", "resolved", "escalated"].includes(prev.status);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { bg: string; text: string; label: string; icon: React.ReactNode }
    > = {
      paid: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        label: "Paid",
        icon: <Check size={14} className="text-emerald-600" />,
      },
      scheduled: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        label: "Scheduled",
        icon: <Check size={14} className="text-emerald-600" />,
      },
      resolved: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        label: "Resolved",
        icon: <Check size={14} className="text-emerald-600" />,
      },
      pending: {
        bg: "bg-amber-100",
        text: "text-amber-800",
        label: "Pending",
        icon: <Clock size={14} className="text-amber-600" />,
      },
      unpaid: {
        bg: "bg-amber-100",
        text: "text-amber-800",
        label: "Unpaid",
        icon: <Clock size={14} className="text-amber-600" />,
      },
      declined: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Declined",
        icon: <XCircle size={14} className="text-red-600" />,
      },
      "not scheduled": {
        bg: "bg-amber-100",
        text: "text-amber-800",
        label: "Not Scheduled",
        icon: <Clock size={14} className="text-amber-600" />,
      },
      "in progress": {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "In Progress",
        icon: <Clock size={14} className="text-blue-600" />,
      },
      ongoing: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Ongoing",
        icon: <Clock size={14} className="text-blue-600" />,
      },
      "waiting for schedule": {
        bg: "bg-amber-100",
        text: "text-amber-800",
        label: "Waiting for Schedule",
        icon: <Clock size={14} className="text-amber-600" />,
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Rejected",
        icon: <XCircle size={14} className="text-red-600" />,
      },
      overdue: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Overdue",
        icon: <XCircle size={14} className="text-red-600" />,
      },
      rescheduled: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Rescheduled",
        icon: <XCircle size={14} className="text-red-600" />,
      },
      escalated: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Escalated",
        icon: <XCircle size={14} className="text-red-600" />,
      },
    };

    const item =
      statusMap[status.toLowerCase()] ?? {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: status,
        icon: <Clock size={14} className="text-gray-600" />,
      };

    return (
      <View className={`flex-row items-center px-3 py-1.5 rounded-full ${item.bg}`}>
        {item.icon}
        <Text className={`ml-1.5 text-xs font-semibold ${item.text}`}>
          {item.label}
        </Text>
      </View>
    );
  };

  const getStepIcon = (step: any) => {
    switch (step.id) {
      case 1:
        return (
          <CreditCard
            size={22}
            className={
              step.status === "paid"
                ? "text-green-600"
                : step.status === "unpaid"
                ? "text-red-600"
                : step.status === "declined"
                ? "text-red-600"
                : "text-amber-600"
            }
          />
        );
      case 2:
        return (
          <Calendar
            size={22}
            className={step.status === "scheduled" ? "text-green-600" : "text-amber-600"}
          />
        );
      case 3:
        return (
          <CheckCircle2
            size={22}
            className={
              step.status === "resolved"
                ? "text-green-600"
                : step.status === "escalated"
                ? "text-red-600"
                : "text-gray-500"
            }
          />
        );
      default:
        return <Calendar size={22} className="text-gray-500" />;
    }
  };

  const isStepCompleted = (step: any, stepIndex: number) => {
    switch (step.id) {
      case 1:
        return step.status === "paid";
      case 2:
        return step.status === "resolved" || step.status === "escalated";
      case 3:
        return step.status === "resolved" || step.status === "escalated";
      default:
        return false;
    }
  };

  // Not Raised State Content
  const renderNotRaisedState = () => (
    <View className="flex-1 justify-center items-center p-6">
      <View className="bg-white rounded-2xl p-10 items-center shadow-lg border border-blue-100 max-w-md w-full">
        <View className="bg-blue-100 p-4 rounded-full mb-5">
          <ClipboardList size={48} color="#2563eb" />
        </View>
        <Text className="text-2xl font-bold text-gray-800 text-center mb-3">
          Case Tracking Not Available
        </Text>
        <Text className="text-gray-600 text-center mb-6 leading-6">
          Your complaint has not been raised yet.
        </Text>
        <Text className="text-sm text-gray-500 text-center">
          Once raised, you'll see real-time updates on your case progress here.
        </Text>
      </View>
    </View>
  );

  // Loading State Content
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState />
    </View>
  );

  // Error State Content
  const renderErrorState = () => (
    <View className="flex-1 justify-center items-center p-6">
      <AlertCircle size={56} color="#f59e0b" />
      <Text className="mt-4 text-lg text-gray-700">No case data found</Text>
    </View>
  );

  // Main Content
  const renderMainContent = () => {
    const steps = getSteps();

    return (
      <>
        <View className="px-5 py-6 space-y-6">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            const isCompleted = isStepCompleted(step, idx);
            const isLocked = !isPreviousStepCompleted(idx);

            return (
              <View key={step.id} className="relative">
                {/* Connector line */}
                {!isLast && (
                  <View
                    className={`absolute left-6 top-15 w-0.5 h-full -z-0 ${
                      isStepCompleted(steps[idx + 1], idx + 1)
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    }`}
                  />
                )}

                <View className="flex-row">
                  {/* Icon Circle */}
                  <View className="items-center mr-4">
                    <View
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-emerald-100 border-2 border-emerald-500"
                          : !isLocked
                          ? "bg-blue-100 border-2 border-blue-500"
                          : "bg-gray-100 border-2 border-gray-300"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={20} className="text-emerald-600" />
                      ) : (
                        getStepIcon(step)
                      )}
                    </View>
                  </View>

                  {/* Content */}
                  <View className="flex-1 pb-8">
                    {isLocked ? (
                      <View className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200 opacity-60">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Text className="text-2xl font-bold text-gray-300 mr-3">
                              {step.id}
                            </Text>
                            <Text className="text-lg font-bold text-gray-500">{step.title}</Text>
                          </View>
                        </View>
                      </View>
                    ) : (
                      step.isActionable ? (
                        <TouchableOpacity
                          onPress={step.onPress}
                          className={`bg-white rounded-xl p-5 shadow-md border-2 ${
                            isCompleted
                              ? "border-emerald-200 active:bg-emerald-50"
                              : "border-blue-200 active:bg-blue-50"
                          }`}
                        >
                          <View className="flex-row justify-between items-start mb-3">
                            <View className="flex-1">
                              <View className="flex-row items-center mb-2">
                                <Text className="text-2xl font-bold text-gray-300 mr-3">
                                  {step.id}
                                </Text>
                                <Text className="text-lg font-bold text-gray-900">
                                  {step.title}
                                </Text>
                              </View>
                              {getStatusBadge(step.display_status || "")}
                            </View>
                            <ChevronRight
                              size={22}
                              className={
                                isCompleted ? "text-emerald-600 mt-1" : "text-blue-600 mt-1"
                              }
                            />
                          </View>
                          <View className="space-y-3">
                            {step.description}
                            {step.details && (
                              <View className="mt-2">
                                <View className={`p-3 rounded-lg border ${
                                  isCompleted ? "bg-emerald-50 border-emerald-100" : "bg-blue-50 border-blue-100"
                                }`}>
                                  {step.details}
                                </View>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <View
                          className={`bg-white rounded-xl p-5 shadow-md border-2 ${
                            isCompleted
                              ? "border-emerald-200"
                              : "border-blue-200"
                          }`}
                        >
                          <View className="flex-row justify-between items-start mb-3">
                            <View className="flex-1">
                              <View className="flex-row items-center mb-2">
                                <Text className="text-2xl font-bold text-gray-300 mr-3">
                                  {step.id}
                                </Text>
                                <Text className="text-lg font-bold text-gray-900">
                                  {step.title}
                                </Text>
                              </View>
                              {getStatusBadge(step.display_status || "")}
                            </View>
                          </View>
                          <View className="space-y-3">
                            {step.description}
                            {step.details && (
                              <View className="mt-2">
                                <View className={`p-3 rounded-lg border ${
                                  isCompleted ? "bg-emerald-50 border-emerald-100" : "bg-blue-50 border-blue-100"
                                }`}>
                                  {step.details}
                                </View>
                              </View>
                            )}
                          </View>
                        </View>
                      )
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Case Summary Card */}
        {tracking?.payment_request_summon?.pay_status === "Paid" && (
          <View className="px-5 pb-8">
            <TouchableOpacity>
              <Card className="overflow-hidden shadow-lg border-0 active:bg-gray-50">
                <View className="bg-primaryBlue px-6 py-4">
                  <View className="flex-row items-center space-x-2 gap-2">
                    <ClipboardList size={20} color="white" />
                    <Text className="text-white font-bold text-lg">Case Summary</Text>
                  </View>
                </View>

                <View className="p-6 space-y-5 bg-white">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-500 text-sm font-medium">Case No.</Text>
                    <Text className="text-blue-600 font-bold text-sm tracking-wider">
                      {tracking.summon_case?.sc_code ?? "N/A"}
                    </Text>
                  </View>

                  <View className="h-px bg-gray-200 my-2" />

                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center space-x-2 gap-2">
                      <CreditCard size={16} className="text-emerald-500" />
                      <Text className="text-gray-600 text-sm">Payment Status</Text>
                    </View>
                    {getStatusBadge("Paid")}
                  </View>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center space-x-2 gap-2">
                      <CheckCircle2
                        size={16}
                        className={
                          getCaseStatusDisplay() === "Resolved"
                            ? "text-emerald-500"
                            : getCaseStatusDisplay() === "Ongoing"
                            ? "text-blue-500"
                            : getCaseStatusDisplay() === "Waiting for Schedule"
                            ? "text-amber-500"
                            : "text-red-500"
                        }
                      />
                      <Text className="text-gray-600 text-sm">Case Status</Text>
                    </View>
                    {getStatusBadge(getCaseStatusDisplay())}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  // Determine which content to render
  const renderContent = () => {
    if (isRaised !== "Raised") {
      return renderNotRaisedState();
    }

    if (isLoading) {
      return renderLoadingState();
    }

    if (error || !tracking) {
      return renderErrorState();
    }

    return renderMainContent();
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#00a8f0']}
            tintColor="#00a8f0"
          />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}