// import React from "react";
// import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity,} from "react-native";
// import { Calendar, CheckCircle2, AlertCircle, ClipboardList, CreditCard, ChevronRight, Clock, XCircle, Check,} from "lucide-react-native";
// import { useRouter } from "expo-router";
// import { formatDate } from "@/helpers/dateHelpers";
// import { formatTimestamp } from "@/helpers/timestampformatter";
// import { Card } from "@/components/ui/card";
// import { useGetCaseTrackingDetails } from "./queries/summon-relatedFetchQueries";
// import { LoadingState } from "@/components/ui/loading-state";

// export default function CaseTrackingScreen({ comp_id, isRaised = "Raised",}: { comp_id?: string; isRaised?: string;}) {
//   const router = useRouter();
//   const { data: tracking, isLoading, error } = useGetCaseTrackingDetails( comp_id || "");

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
//             Your complaint has not been raised yet. Submit a blotter report to
//             begin tracking.
//           </Text>
//           <Text className="text-sm text-gray-500 text-center">
//             Once raised, you’ll see real-time updates on your case progress
//             here.
//           </Text>
//         </View>
//       </View>
//     );
//   }

//   if (isLoading) {
//     return (
//       <View className="flex-1 justify-center items-center bg-gradient-to-b from-blue-50 to-white">
//         <ActivityIndicator size="large" color="#3b82f6" />
//         <Text className="mt-4 text-lg text-gray-700 font-medium">
//           Loading case details...
//         </Text>
//       </View>
//     );
//   }

//   if (error || !tracking) {
//     return (
//       <View className="flex-1 justify-center items-center bg-gradient-to-b from-blue-50 to-white">
//         <AlertCircle size={56} color="#f59e0b" />
//         <Text className="mt-4 text-lg text-gray-700">No case data found</Text>
//       </View>
//     );
//   }

//   /* ------------------------------------------------------------------ */
//   /*  Helpers                                                            */
//   /* ------------------------------------------------------------------ */
//   const handleSchedulePress = () => {
//     router.push({
//       pathname: "/(my-request)/complaint-tracking/hearing-history",
//     });
//   };

//   const getSteps = () => {
//     const steps = [];

//     // 1 – Payment
//     const payStatus = tracking.payment_request?.pay_status?.toLowerCase() ?? "unpaid";
//     const payDisplay = tracking.payment_request?.pay_status ?? "Unpaid";

//     steps.push({
//       id: 1,
//       title: "Payment",
//       description: "Pay the required mediation fee to proceed with scheduling.",
//       status: payStatus,
//       display_status: payDisplay,
//       details: tracking.payment_request
//         ? `Amount for mediation services. ${
//             payStatus === "paid"
//               ? tracking.payment_request.pay_date_paid
//                 ? `Paid on ${formatTimestamp(tracking.payment_request.pay_date_paid)}`
//                 : "Payment completed"
//               : `Due by ${formatDate(tracking.payment_request.pay_due_date)}`
//           }`
//         : "Payment required for mediation services.",
//     });

//     // 2 – Schedule Hearing
//     // const hasSchedules = tracking.hearing_schedules?.length > 0;
//     // const schedStatus = hasSchedules ? "scheduled" : "pending";
//     // const schedDisplay = hasSchedules ? "Scheduled" : "Not Scheduled";

//     steps.push({
//       id: 2,
//       title: "Schedule Hearing",
//       description: "Attend the scheduled mediation session with both parties.",
//       status:  "",
//       display_status: "",
//       details: tracking.hearing_schedules?.length
//         ? `${tracking.hearing_schedules?.length} hearing session(s) scheduled`
//         : "Waiting for payment confirmation to schedule hearing.",
//     });

//     // 3 – Case Completion
//     const caseStatus = tracking.summon_case?.sc_conciliation_status?.toLowerCase() ?? "pending";
//     const caseDisplay = tracking.summon_case?.sc_conciliation_status ?? "In Progress";

//     steps.push({
//       id: 3,
//       title: "Case Completion",
//       description: "The case will be marked as resolved or escalated after mediation.",
//       status: caseStatus,
//       display_status: caseDisplay,
//       details: tracking.summon_case?.sc_date_marked
//         ? `Case ${caseStatus} on ${formatDate(tracking.summon_case.sc_date_marked)}`
//         : "Pending mediation outcome.",
//     });

//     return steps;
//   };

//   const steps = getSteps();

//   const isPreviousStepCompleted = (currentIdx: number) => {
//     if (currentIdx === 0) return true;
//     const prev = steps[currentIdx - 1];
//     return ["paid", "scheduled", "resolved", "escalated"].includes(prev.status);
//   };

//   const calculateProgress = () => {
//     let done = 0;
//     steps.forEach((s) => {
//       if (s.id === 1 && s.status === "paid") done++;
//       if (s.id === 2 && s.status === "scheduled") done++;
//       if (s.id === 3 && ["resolved", "escalated"].includes(s.status)) done++;
//     });
//     return Math.round((done / steps.length) * 100);
//   };
//   const progress = calculateProgress();

//   const getStatusBadge = (status: string) => {
//     const map: Record<
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

//     const item = map[status.toLowerCase()] ?? map.pending;
//     return (
//       <View
//         className={`flex-row items-center px-3 py-1.5 rounded-full ${item.bg}`}
//       >
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

//   const isStepActionable = (id: number) => {
//     if (id === 2) {
//       const payment = steps.find((s) => s.id === 1);
//       return payment?.status === "paid";
//     }
//     return false;
//   };

//   const currentStep = steps.find((s) =>
//     ["pending", "unpaid", "not scheduled"].includes(s.status)
//   );
//   const caseStatus = tracking.summon_case?.sc_conciliation_status ?? "In Progress";

//   /* ------------------------------------------------------------------ */
//   /*  Render                                                            */
//   /* ------------------------------------------------------------------ */
//   return (
//     <View className="flex-1 bg-gradient-to-b from-blue-50 to-white">
//       {/* ---------- Timeline Steps ---------- */}
//       <ScrollView
//         className="flex-1"
//         showsVerticalScrollIndicator={false}
//       >
//         <View className="px-5 py-6 space-y-6">
//           {steps.map((step, idx) => {
//             const isLast = idx === steps.length - 1;
//             const isActionable = isStepActionable(step.id);
//             const isCompleted = ["paid", "scheduled", "resolved"].includes(step.status);
//             const isCurrent = ["pending", "unpaid", "not scheduled"].includes(step.status);
//             const isLocked = !isPreviousStepCompleted(idx); // previous step not done

//             return (
//               <View key={step.id} className="relative">
//                 {/* Connector line */}
//                 {!isLast && (
//                   <View
//                     className={`absolute left-6 top-14 w-0.5 h-full -z-0 ${
//                       steps[idx + 1].status === "paid" ||
//                       steps[idx + 1].status === "scheduled"
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
//                           ? "bg-emerald-100 border-emerald-500"
//                           : isCurrent && !isLocked
//                           ? "bg-blue-100 border-blue-500"
//                           : "bg-gray-100 border-gray-300"
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
//                     {/* ---------- Locked (show only title) ---------- */}
//                     {isLocked ? (
//                       <View className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200 opacity-60">
//                         <Text className="text-lg font-bold text-gray-500">
//                           {step.title}
//                         </Text>
//                       </View>
//                     ) : isActionable ? (
//                       /* ---------- Actionable (Schedule) ---------- */
//                       <TouchableOpacity
//                         onPress={handleSchedulePress}
//                         className="bg-white rounded-xl p-5 shadow-md border-2 border-blue-200 active:bg-blue-50"
//                       >
//                         <View className="flex-row justify-between items-start mb-3">
//                           <View className="flex-1">
//                             <Text className="text-lg font-bold text-gray-900 mb-2">
//                               {step.title}
//                             </Text>
//                             {getStatusBadge(step.display_status)}
//                           </View>
//                           <ChevronRight
//                             size={22}
//                             className="text-blue-600 mt-1"
//                           />
//                         </View>

//                         <Text className="text-gray-600 text-sm leading-5 mb-3">
//                           {step.description}
//                         </Text>

//                         {step.details && (
//                           <View className="p-3 bg-blue-50 rounded-lg border border-blue-100">
//                             <Text className="text-xs text-blue-800 font-medium">
//                               {step.details}
//                             </Text>
//                           </View>
//                         )}
//                       </TouchableOpacity>
//                     ) : (
//                       /* ---------- Normal (completed / current) ---------- */
//                       <View
//                         className={`bg-white rounded-xl p-5 shadow-md border-2 ${
//                           isCompleted
//                             ? "border-emerald-200"
//                             : "border-blue-200"
//                         }`}
//                       >
//                         <View className="flex-row justify-between items-start mb-3">
//                           <View className="flex-1">
//                             <Text className="text-lg font-bold text-gray-900 mb-2">
//                               {step.title}
//                             </Text>
//                             {getStatusBadge(step.display_status)}
//                           </View>
//                           <Text className="text-2xl font-bold text-gray-300">
//                             {step.id}
//                           </Text>
//                         </View>

//                         <Text className="text-gray-600 text-sm leading-5 mb-3">
//                           {step.description}
//                         </Text>

//                         {step.details && (
//                           <View className="p-3 bg-gray-50 rounded-lg border border-gray-200">
//                             <Text className="text-xs text-gray-700">
//                               {step.details}
//                             </Text>
//                           </View>
//                         )}
//                       </View>
//                     )}
//                   </View>
//                 </View>
//               </View>
//             );
//           })}
//         </View>

//         {/* ---------- Case Summary Card ---------- */}
//         <View className="px-5 pb-8">
//           <Card className="overflow-hidden shadow-lg border-0">
//             {/* Header – solid primaryBlue */}
//             <View className="bg-primaryBlue px-6 py-4">
//               <View className="flex-row items-center space-x-2">
//                 <ClipboardList size={20} color="white" />
//                 <Text className="text-white font-bold text-lg">
//                   Case Summary
//                 </Text>
//               </View>
//             </View>

//             <View className="p-6 space-y-5 bg-white">
//               {/* Case No. */}
//               <View className="flex-row justify-between items-center">
//                 <Text className="text-gray-500 text-sm font-medium">
//                   Case No.
//                 </Text>
//                 <Text className="text-blue-600 font-bold text-sm tracking-wider">
//                   {tracking.summon_case?.sc_code ?? "N/A"}
//                 </Text>
//               </View>

//               <View className="h-px bg-gray-200" />

//               {/* Payment Status */}
//               <View className="flex-row justify-between items-center">
//                 <View className="flex-row items-center space-x-2">
//                   <CreditCard
//                     size={16}
//                     className={
//                       tracking.payment_request?.pay_status === "Paid"
//                         ? "text-emerald-500"
//                         : tracking.payment_request?.pay_status === "Unpaid"
//                         ? "text-red-500"
//                         : "text-amber-500"
//                     }
//                   />
//                   <Text className="text-gray-600 text-sm">Payment Status</Text>
//                 </View>
//                 {getStatusBadge(tracking.payment_request?.pay_status ?? "Unpaid")}
//               </View>

//               {/* Current Step */}
//               <View className="flex-row justify-between items-center">
//                 <View className="flex-row items-center space-x-2">
//                   <Clock size={16} className="text-blue-500" />
//                   <Text className="text-gray-600 text-sm">Current Step</Text>
//                 </View>
//                 <Text className="text-gray-900 font-medium text-sm text-right max-w-[60%]">
//                   {currentStep?.title ?? "Case Resolved"}
//                 </Text>
//               </View>

//               {/* Case Status */}
//               <View className="flex-row justify-between items-center">
//                 <View className="flex-row items-center space-x-2">
//                   <CheckCircle2
//                     size={16}
//                     className={
//                       caseStatus === "Resolved"
//                         ? "text-emerald-500"
//                         : caseStatus === "In Progress"
//                         ? "text-blue-500"
//                         : "text-amber-500"
//                     }
//                   />
//                   <Text className="text-gray-600 text-sm">Case Status</Text>
//                 </View>
//                 {getStatusBadge(caseStatus)}
//               </View>

//               {/* Progress */}
//               <View className="mt-4">
//                 <View className="flex-row justify-between items-center mb-2">
//                   <Text className="text-xs text-gray-500">
//                     Overall Progress
//                   </Text>
//                   <Text className="text-xs font-bold text-blue-600">
//                     {progress}%
//                   </Text>
//                 </View>
//                 <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
//                   <View
//                     className="h-full bg-blue-500 rounded-full"
//                     style={{ width: `${progress}%` }}
//                   />
//                 </View>
//               </View>
//             </View>
//           </Card>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  CreditCard,
  ChevronRight,
  Clock,
  XCircle,
  Check,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { formatDate } from "@/helpers/dateHelpers";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { Card } from "@/components/ui/card";
import { useGetCaseTrackingDetails } from "./queries/summon-relatedFetchQueries";
import { LoadingState } from "@/components/ui/loading-state";

export default function CaseTrackingScreen({
  comp_id,
  isRaised = "Raised",
}: {
  comp_id?: string;
  isRaised?: string;
}) {
  const router = useRouter();
  const { data: tracking, isLoading, error } = useGetCaseTrackingDetails(comp_id || "");

  /* ------------------------------------------------------------------ */
  /*  Early Returns                                                     */
  /* ------------------------------------------------------------------ */
  if (isRaised !== "Raised") {
    return (
      <View className="flex-1 bg-gradient-to-b from-blue-50 to-white justify-center items-center p-6">
        <View className="bg-white rounded-2xl p-10 items-center shadow-lg border border-blue-100 max-w-md w-full">
          <View className="bg-blue-100 p-4 rounded-full mb-5">
            <ClipboardList size={48} color="#2563eb" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 text-center mb-3">
            Case Tracking Not Available
          </Text>
          <Text className="text-gray-600 text-center mb-6 leading-6">
            Your complaint has not been raised yet. Submit a blotter report to begin tracking.
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            Once raised, you’ll see real-time updates on your case progress here.
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-gradient-to-b from-blue-50 to-white justify-center items-center">
        <View className="h-64 justify-center items-center">
          <LoadingState />
        </View>
      </View>
    );
  }

  if (error || !tracking) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-b from-blue-50 to-white">
        <AlertCircle size={56} color="#f59e0b" />
        <Text className="mt-4 text-lg text-gray-700">No case data found</Text>
      </View>
    );
  }

  const handleSchedulePress = () => {
    router.push({
      pathname: "/(my-request)/complaint-tracking/hearing-history",
    });
  };

  const getSteps = () => {
    const steps = [];

    // 1 – Payment
    const payStatus = tracking.payment_request?.pay_status?.toLowerCase() ?? "unpaid";
    const payDisplay = tracking.payment_request?.pay_status ?? "Unpaid";

    steps.push({
      id: 1,
      title: "Payment",
      description: "Pay the required mediation fee to proceed with scheduling.",
      status: payStatus,
      display_status: payDisplay,
      details: (
        <View className="space-y-2">
          {/* Amount */}
          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-gray-600">Amount to pay</Text>
            <Text className="text-xs font-medium text-blue-600">
              ₱ {tracking.payment_request?.pay_status?.toLocaleString() || "N/A"}
            </Text>
          </View>

          {/* Due Date */}
          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-gray-600">Due date</Text>
            <Text className="text-xs font-medium text-red-600">
              {tracking.payment_request? formatDate(tracking.payment_request?.pay_due_date, "long"): "N/A"}
            </Text>
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-200 my-2" />

          {/* Warning Note */}
          <Text className="text-xs text-red-700 italic pb-2">
            If payment is not made by the due date, the request will be automatically cancelled.
          </Text>
        </View>
      ),
    });

    // 2 – Schedule Hearing
    // const hasSchedules = tracking.hearing_schedules?.length > 0;
    // const schedStatus = hasSchedules ? "scheduled" : "pending";
    // const schedDisplay = hasSchedules ? "Scheduled" : "Not Scheduled";

    steps.push({
      id: 2,
      title: "Schedule Hearing",
      description: "Attend the scheduled mediation session with both parties.",
      status: "",
      display_status: "",
      details: tracking.hearing_schedules?.length
        ? `${tracking.hearing_schedules?.length} hearing session(s) scheduled`
        : "Waiting for payment confirmation to schedule hearing.",
    });

    // 3 – Case Completion
    const caseStatus = tracking.summon_case?.sc_conciliation_status?.toLowerCase() ?? "pending";
    const caseDisplay = tracking.summon_case?.sc_conciliation_status ?? "In Progress";

    steps.push({
      id: 3,
      title: "Case Completion",
      description: "The case will be marked as resolved or escalated after mediation.",
      status: caseStatus,
      display_status: caseDisplay,
      details: tracking.summon_case?.sc_date_marked
        ? `Case ${caseStatus} on ${formatDate(tracking.summon_case.sc_date_marked)}`
        : "Pending mediation outcome.",
    });

    return steps;
  };

  const steps = getSteps();

  const isPreviousStepCompleted = (currentIdx: number) => {
    if (currentIdx === 0) return true;
    const prev = steps[currentIdx - 1];
    return ["paid", "scheduled", "resolved", "escalated"].includes(prev.status);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<
      string,
      { bg: string; text: string; label: string; icon: React.ReactNode }
    > = {
      paid: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Paid", icon: <Check size={14} className="text-emerald-600" /> },
      scheduled: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Scheduled", icon: <Check size={14} className="text-emerald-600" /> },
      resolved: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Resolved", icon: <Check size={14} className="text-emerald-600" /> },
      pending: { bg: "bg-amber-100", text: "text-amber-800", label: "Pending", icon: <Clock size={14} className="text-amber-600" /> },
      unpaid: { bg: "bg-amber-100", text: "text-amber-800", label: "Unpaid", icon: <Clock size={14} className="text-amber-600" /> },
      "not scheduled": { bg: "bg-amber-100", text: "text-amber-800", label: "Not Scheduled", icon: <Clock size={14} className="text-amber-600" /> },
      "in progress": { bg: "bg-blue-100", text: "text-blue-800", label: "In Progress", icon: <Clock size={14} className="text-blue-600" /> },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected", icon: <XCircle size={14} className="text-red-600" /> },
      overdue: { bg: "bg-red-100", text: "text-red-800", label: "Overdue", icon: <XCircle size={14} className="text-red-600" /> },
      rescheduled: { bg: "bg-red-100", text: "text-red-800", label: "Rescheduled", icon: <XCircle size={14} className="text-red-600" /> },
      escalated: { bg: "bg-red-100", text: "text-red-800", label: "Escalated", icon: <XCircle size={14} className="text-red-600" /> },
    };

    const item = map[status.toLowerCase()] ?? map.pending;
    return (
      <View className={`flex-row items-center px-3 py-1.5 rounded-full ${item.bg}`}>
        {item.icon}
        <Text className={`ml-1.5 text-xs font-semibold ${item.text}`}>{item.label}</Text>
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
              step.status === "paid" ? "text-green-600" : step.status === "unpaid" ? "text-red-600" : "text-amber-600"
            }
          />
        );
      case 2:
        return (
          <Calendar size={22} className={step.status === "scheduled" ? "text-green-600" : "text-amber-600"} />
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

  const isStepActionable = (id: number) => {
    if (id === 2) {
      const payment = steps.find((s) => s.id === 1);
      return payment?.status === "paid";
    }
    return false;
  };

  const currentStep = steps.find((s) =>
    ["pending", "unpaid", "not scheduled"].includes(s.status)
  );
  const caseStatus = tracking.summon_case?.sc_conciliation_status ? tracking.summon_case.sc_conciliation_status : tracking.summon_case?.sc_conciliation_status;

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <View className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      {/* ---------- Scrollable Content ---------- */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6 space-y-6">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            const isActionable = isStepActionable(step.id);
            const isCompleted = ["paid", "scheduled", "resolved"].includes(step.status);
            const isCurrent = ["pending", "unpaid", "not scheduled"].includes(step.status);
            const isLocked = !isPreviousStepCompleted(idx);

            return (
              <View key={step.id} className="relative">
                {/* Connector line */}
                {!isLast && (
                  <View
                    className={`absolute left-6 top-14 w-0.5 h-full -z-0 ${
                      steps[idx + 1].status === "paid" || steps[idx + 1].status === "scheduled"
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
                          ? "bg-emerald-100 border-emerald-500"
                          : isCurrent && !isLocked
                          ? "bg-blue-100 border-blue-500"
                          : "bg-gray-100 border-gray-300"
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
                        <Text className="text-lg font-bold text-gray-500">{step.title}</Text>
                      </View>
                    ) : isActionable ? (
                      <TouchableOpacity
                        onPress={handleSchedulePress}
                        className="bg-white rounded-xl p-5 shadow-md border-2 border-blue-200 active:bg-blue-50"
                      >
                        <View className="flex-row justify-between items-start mb-3">
                          <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-900 mb-2">{step.title}</Text>
                            {getStatusBadge(step.display_status)}
                          </View>
                          <ChevronRight size={22} className="text-blue-600 mt-1" />
                        </View>
                        <Text className="text-gray-600 text-sm leading-5 mb-3">{step.description}</Text>
                        {step.details && (
                          <View className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <Text className="text-xs text-blue-800 font-medium">{step.details}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View
                        className={`bg-white rounded-xl p-5 shadow-md border-2 ${
                          isCompleted ? "border-emerald-200" : "border-blue-200"
                        }`}
                      >
                        <View className="flex-row justify-between items-start mb-3">
                          <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-900 mb-2">{step.title}</Text>
                            {getStatusBadge(step.display_status)}
                          </View>
                          <Text className="text-2xl font-bold text-gray-300">{step.id}</Text>
                        </View>
                        <Text className="text-gray-600 text-sm leading-5 mb-3">{step.description}</Text>
                        {step.details && (
                          <View className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <Text className="text-xs text-gray-700">{step.details}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* ---------- Case Summary Card (Only if Paid) ---------- */}
        {tracking.payment_request?.pay_status === "Paid" && (
          <View className="px-5 pb-8">
            <Card className="overflow-hidden shadow-lg border-0">
              <View className="bg-primaryBlue px-6 py-4">
                <View className="flex-row items-center space-x-2">
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

                <View className="h-px bg-gray-200" />

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center space-x-2">
                    <CreditCard size={16} className="text-emerald-500" />
                    <Text className="text-gray-600 text-sm">Payment Status</Text>
                  </View>
                  {getStatusBadge("Paid")}
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center space-x-2">
                    <Clock size={16} className="text-blue-500" />
                    <Text className="text-gray-600 text-sm">Current Step</Text>
                  </View>
                  <Text className="text-gray-900 font-medium text-sm text-right max-w-[60%]">
                    {currentStep?.title ?? "Case Resolved"}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center space-x-2">
                    <CheckCircle2
                      size={16}
                      className={
                        caseStatus === "Resolved"
                          ? "text-emerald-500"
                          : caseStatus === "In Progress"
                          ? "text-blue-500"
                          : "text-amber-500"
                      }
                    />
                    <Text className="text-gray-600 text-sm">Case Status</Text>
                  </View>
                  {getStatusBadge(caseStatus || "")}
                </View>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
