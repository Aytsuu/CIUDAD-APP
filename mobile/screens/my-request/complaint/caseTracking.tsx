import React from "react";
import { View, Text, ScrollView, TouchableOpacity,} from "react-native";
import { Calendar, CheckCircle2, AlertCircle, ClipboardList, CreditCard, ChevronRight, Clock, XCircle, Check,} from "lucide-react-native";
import { useRouter } from "expo-router";
import { formatDate } from "@/helpers/dateHelpers";
import { Card } from "@/components/ui/card";
import { useGetCaseTrackingDetails } from "./queries/summon-relatedFetchQueries";
import { LoadingState } from "@/components/ui/loading-state";
import { formatTimestamp } from "@/helpers/timestampformatter";

export default function CaseTrackingScreen({ comp_id, isRaised = "Raised",
}: {
  comp_id?: string;
  isRaised?: string;
}) {
  const router = useRouter();
  if(isRaised == "Raised"){
    const { data: tracking, isLoading, error } = useGetCaseTrackingDetails(comp_id || "");

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
        params: {
          hearing_schedules: JSON.stringify(tracking.hearing_schedules || [])
        }
      });
    };

    // Get case status display with proper logic
  const getCaseStatusDisplay = () => {
    return tracking.summon_case?.sc_conciliation_status ?? tracking.summon_case?.sc_mediation_status ?? "Waiting for Schedule";
  };


  const getSteps = () => {
    const steps = [];

    // 1 – Payment
    const payStatus = tracking.payment_request?.pay_status?.toLowerCase() ?? "unpaid";
    const amount = tracking.payment_request?.pay_status; // Assuming this is the field for amoun

      steps.push({
        id: 1,
        title: "Payment",
        description: payStatus === "paid" ? (
          <View className="space-y-1">
            <Text className="text-gray-600 text-sm leading-5">Payment completed!</Text>
          </View>
        ) : (
          <View className="space-y-1">
            <Text className="text-gray-600 text-sm leading-5">
              Pay the required mediation fee to proceed with scheduling.
            </Text>
            <Text className="text-red-600 text-xs italic leading-4">
              If payment is not made by the due date, the request will be automatically cancelled.
            </Text>
          </View>
        ),
        status: payStatus,
        display_status: tracking.payment_request?.pay_status,
        details: (
          <View className="p-2 bg-gray-50 rounded-lg border border-gray-200 mt-2">
            <View className="space-y-2">
              {/* Amount */}
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-gray-600 font-medium">Amount</Text>
                <Text className="text-xs font-semibold text-blue-600">
                  ₱ {amount ? amount.toLocaleString() : "N/A"}
                </Text>
              </View>

              {/* Date - Show payment date if paid, due date if unpaid */}
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-gray-600 font-medium">
                  {payStatus === "paid" ? "Payment Date" : "Due Date"}
                </Text>
                <Text className={`text-xs font-semibold ${payStatus === "paid" ? "text-green-600" : "text-red-600"}`}>
                  {payStatus === "paid" 
                    ? (tracking.payment_request?.pay_date_paid ? formatTimestamp(tracking.payment_request?.pay_date_paid) : "N/A")
                    : (tracking.payment_request?.pay_due_date ? formatDate(tracking.payment_request.pay_due_date, "long") : "N/A")
                  }
                </Text>
              </View>
            </View>
          </View>
        ),
      });

      const getScheduleHearingDescription = () => {
        const status = getCaseStatusDisplay().toLowerCase();
        
        if (status === "waiting for schedule") {
          return (
            <View className="space-y-1">
              <Text className="text-gray-600 text-sm leading-5 mb-3">
                Select date and time for your hearing session.
              </Text>
            </View>
          );
        }
        
        if (status === "ongoing") {
          // Find the open hearing schedule (not closed)
          const openSchedule = tracking.hearing_schedules?.find(schedule => !schedule.hs_is_closed);
          
          if (openSchedule) {
            const hearingDate = formatDate(openSchedule.summon_date.sd_date, "long");
            const hearingTime = openSchedule.summon_time.st_start_time;
            const hearingLevel = openSchedule.hs_level;
            const remark = openSchedule.remark?.rem_remarks;
            
            return (
              <View className="space-y-2">
                <Text className="text-gray-600 text-sm leading-5">
                  Your hearing is scheduled for {hearingDate} at {hearingTime}.
                </Text>
                <Text className="text-gray-600 text-sm leading-5">
                  Hearing Level: {hearingLevel}
                </Text>
                {remark && (
                  <Text className="text-gray-600 text-sm leading-5 italic">
                    Remark: {remark}
                  </Text>
                )}
              </View>
            );
          } else {
            return (
              <View className="space-y-1">
                <Text className="text-gray-600 text-sm leading-5">
                  Hearing session details are being finalized. Please check back later.
                </Text>
              </View>
            );
          }
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
                The case has been successfully resolved through mediation.
              </Text>
            </View>
          );
        }
        
        // Default description for other statuses
        return (
          <View className="space-y-1">
            <Text className="text-gray-600 text-sm leading-5">
              Attend the scheduled mediation session with both parties.
            </Text>
          </View>
        );
      };

      const getScheduleHearingDetails = () => {
        const status = getCaseStatusDisplay().toLowerCase();
        
        if (status === "waiting for schedule") {
          return "Waiting for you to select a hearing date and time.";
        }
        
        if (status === "ongoing") {
          const openSchedules = tracking.hearing_schedules?.filter(schedule => !schedule.hs_is_closed) || [];
          const closedSchedules = tracking.hearing_schedules?.filter(schedule => schedule.hs_is_closed) || [];
          
          if (openSchedules.length > 0) {
            return `${openSchedules.length} active hearing session(s) scheduled`;
          } else if (closedSchedules.length > 0) {
            return `${closedSchedules.length} completed hearing session(s)`;
          } else {
            return "No hearing sessions scheduled yet";
          }
        }
        
        if (status === "escalated") {
          return "Case forwarded to higher judicial authorities";
        }
        
        if (status === "resolved") {
          const resolutionDate = tracking.summon_case?.sc_date_marked;
          return resolutionDate 
            ? `Case resolved on ${formatDate(resolutionDate)}`
            : "Case successfully closed";
        }
        
        return "Pending hearing scheduling";
      };

      console.log(getScheduleHearingDetails())
      // 2 – Schedule Hearing
      steps.push({
        id: 2,
        title: "Schedule Hearing",
        description: getScheduleHearingDescription(),
        status: getCaseStatusDisplay().toLowerCase(),
        display_status: getCaseStatusDisplay(),
        details: getScheduleHearingDetails(),
      });

      // 3 – Case Completion
      const caseDisplay = tracking.summon_case?.sc_conciliation_status ?? "In Progress";

      steps.push({
        id: 3,
        title: "Case Completion",
        description: "The case will be marked as resolved or escalated after mediation.",
        status: getCaseStatusDisplay().toLowerCase(),
        display_status: caseDisplay,
        details: tracking.summon_case?.sc_date_marked
          ? `Case ${getCaseStatusDisplay()} on ${formatDate(tracking.summon_case.sc_date_marked)}`
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
        ongoing: { bg: "bg-blue-100", text: "text-blue-800", label: "Ongoing", icon: <Clock size={14} className="text-blue-600" /> },
        "waiting for schedule": { bg: "bg-amber-100", text: "text-amber-800", label: "Waiting for Schedule", icon: <Clock size={14} className="text-amber-600" /> },
        rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected", icon: <XCircle size={14} className="text-red-600" /> },
        overdue: { bg: "bg-red-100", text: "text-red-800", label: "Overdue", icon: <XCircle size={14} className="text-red-600" /> },
        rescheduled: { bg: "bg-red-100", text: "text-red-800", label: "Rescheduled", icon: <XCircle size={14} className="text-red-600" /> },
        escalated: { bg: "bg-red-100", text: "text-red-800", label: "Escalated", icon: <XCircle size={14} className="text-red-600" /> },
      };

      const item = map[status.toLowerCase()] ?? { bg: "bg-gray-100", text: "text-gray-800", label: status, icon: <Clock size={14} className="text-gray-600" /> };
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
                            ? "bg-emerald-100 border-2 border-emerald-500"
                            : isCurrent && !isLocked
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
                                {getStatusBadge(step.display_status || '')}
                              </View>
                              <ChevronRight size={22} className="text-blue-600 mt-1" />
                            </View>
                            <View className="space-y-3">
                              <View className="space-y-1">
                                {step.description}
                              </View>
                              {step.details && (
                                <View className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                  <Text className="text-xs text-blue-800 font-medium">{step.details}</Text>
                                </View>
                              )}
                            </View>
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
                                {getStatusBadge(step.display_status || '')}
                              </View>
                              <Text className="text-2xl font-bold text-gray-300">{step.id}</Text>
                            </View>
                            <View className="space-y-3">
                              <View className="space-y-1">
                                {step.description}
                              </View>
                              {step.details && (
                                <View className="mt-2">
                                  <View className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <Text className="text-xs text-gray-700 font-medium">{step.details}</Text>
                                  </View>
                                </View>
                              )}
                            </View>
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

                  {/* <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center space-x-2 gap-2">
                      <Clock size={16} className="text-blue-500" />
                      <Text className="text-gray-600 text-sm">Current Step</Text>
                    </View>
                    <Text className="text-gray-900 font-medium text-sm text-right max-w-[60%]">
                      {currentStep?.title ?? "Case Resolved"}
                    </Text>
                  </View> */}

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
            </View>
          )}
        </ScrollView>
      </View>
    );

  } else {
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
            Your complaint has not been raised yet.
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            Once raised, you'll see real-time updates on your case progress here.
          </Text>
        </View>
      </View>
    );
  }
}