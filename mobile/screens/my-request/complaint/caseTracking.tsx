import React from "react";
import { View, Text, ScrollView, TouchableOpacity,} from "react-native";
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

  const { data: tracking, isLoading, error } = useGetCaseTrackingDetails( comp_id ? comp_id : "");

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
            Your complaint has not been raised yet.
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            Once raised, you'll see real-time updates on your case progress here.
          </Text>
        </View>
      </View>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-gradient-to-b from-blue-50 to-white justify-center items-center">
        <View className="h-64 justify-center items-center">
          <LoadingState />
        </View>
      </View>
    );
  }

  // Error state
  if (error || !tracking) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-b from-blue-50 to-white">
        <AlertCircle size={56} color="#f59e0b" />
        <Text className="mt-4 text-lg text-gray-700">No case data found</Text>
      </View>
    );
  }

  // Get case status display
  const getCaseStatusDisplay = () => {
    return (
      tracking.summon_case?.sc_conciliation_status ??
      tracking.summon_case?.sc_mediation_status ??
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

  const getSteps = () => {
    const steps: {
      id: number;
      title: string;
      description: React.ReactNode;
      status: string;
      display_status: string;
      details: React.ReactNode;
    }[] = [];

    // 1 – Payment
    const payStatus = tracking.payment_request?.pay_status?.toLowerCase() ?? "unpaid";
    const amount = tracking.payment_request?.pay_amount;

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
            Please pay the mediation fee at the barangay hall to proceed with scheduling your hearing session.
          </Text>
          <Text className="text-red-600 text-xs italic leading-4 mt-1">
            Important: Unpaid requests will be automatically declined after the due date.
          </Text>
        </View>
      ),
      status: payStatus,
      display_status: tracking.payment_request?.pay_status || "Unpaid",
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
              {payStatus === "unpaid" ? "Due Date" : "Date Paid"}
            </Text>
            <Text
              className={`text-xs font-semibold ${
                payStatus === "paid" ? "text-green-600" : "text-red-600"
              }`}
            >
              {payStatus === "unpaid"
                ? formatDate(tracking?.payment_request?.pay_due_date || "", "long")
                : formatTimestamp(tracking.payment_request?.pay_date_paid || "")}
            </Text>
          </View>
        </View>
      ),
    });

    // Helper: Schedule Hearing Description
    const getScheduleHearingDescription = () => {
      const status = getCaseStatusDisplay().toLowerCase();

      if (status === "waiting for schedule" && tracking.summon_case?.hearing_schedules.length !== 6) {
       return (
          <View className="space-y-1">
            <Text className="text-gray-600 text-sm leading-5">
              Select date and time for your hearing session.
            </Text>
          </View>
        );
      }

      if (status === "waiting for schedule" && tracking.summon_case?.hearing_schedules.length === 6) {
       return (
          <View className="space-y-1">
            <Text className="text-gray-600 text-sm leading-5">
              Your case has reached the final hearing session
            </Text>
          </View>
        );
      }

      if (status === "ongoing") {
        const openSchedule = tracking.summon_case?.hearing_schedules?.find(
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

      if (status === "waiting for schedule" && tracking.summon_case?.hearing_schedules.length !== 6) {
        return (
          <Text className="text-xs text-gray-700">
            Waiting for you to select a hearing date and time.
          </Text>
        );
      }

      if (status === "waiting for schedule" && tracking.summon_case?.hearing_schedules.length === 6) {
        return (
          <Text className="text-xs text-gray-700">
            Waiting for the barangay's final verdict.
          </Text>
        );
      }

      if (status === "ongoing") {
        const openSchedule = tracking.summon_case?.hearing_schedules?.find(
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
    });

    // 3 – Case Completion
    steps.push({
      id: 3,
      title: "Case Completion",
      description: (
        <View className="space-y-1">
          <Text className="text-gray-600 text-sm leading-5">
            The case will be marked as resolved or escalated after mediation.
          </Text>
        </View>
      ),
      status: getCaseStatusDisplay().toLowerCase(),
      display_status: getCaseStatusDisplay(),
      details: tracking.summon_case?.sc_date_marked ? (
        <Text className="text-xs text-gray-700">
          Case resolved on {formatTimestamp(tracking.summon_case.sc_date_marked)} and marked by{" "}
          {tracking.summon_case?.staff_name}
        </Text>
      ) : (
        <Text className="text-xs text-gray-700">Pending mediation outcome.</Text>
      ),
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

  const isStepActionable = (id: number) => {
    if (id === 2) {
      const payment = steps.find((s) => s.id === 1);
      return payment?.status === "paid";
    }
    return false;
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

  return (
    <View className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6 space-y-6">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            const isActionable = isStepActionable(step.id);
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
                    ) : isActionable ? (
                      <TouchableOpacity
                        onPress={handleSchedulePress}
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
                              <View className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                {step.details}
                              </View>
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
                        <View className="space-y-2">
                          {step.description}
                          {step.details && (
                            <View className="mt-2">
                              <View className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                {step.details}
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

        {/* Case Summary Card */}
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
}