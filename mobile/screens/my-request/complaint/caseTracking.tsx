import React from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { Calendar, CheckCircle2, AlertCircle, ClipboardList, CreditCard, ChevronRight, Clock, XCircle, Check } from "lucide-react-native";
import { useRouter } from "expo-router";
import { formatDate } from "@/helpers/dateHelpers";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { Card } from "@/components/ui/card";

// Mock Data (Replace with actual API later)
const mockTrackingData = {
  sr_id: "SR-2025-00421",
  sr_req_date: "2025-03-15",
  sr_date_marked: "2025-04-10",
  progress_percentage: 50,
  current_step: [
    {
      id: 1,
      title: "Payment",
      description: "Pay the required mediation fee to proceed with scheduling.",
      status: "paid",
      display_status: "Paid",
    },
    {
      id: 2,
      title: "Schedule Mediation",
      description: "Attend the scheduled mediation session with both parties.",
      status: "pending",
      display_status: "Not Scheduled",
    },
    {
      id: 3,
      title: "Case Completion",
      description: "The case will be marked as resolved or escalated after mediation.",
      status: "pending",
      display_status: "In Progress",
    },
  ],

  // Additional context
  payment: {
    amount: 500,
    purpose: "Mediation Fee",
    spay_date_paid: "2025-03-25T14:30:00",
    spay_due_date: "2025-03-30",
  },
  schedule: {
    date: null,
    time: null,
    ss_reason: null,
  },
};

export default function CaseTracking({ 
  comp_id, 
  isRaised = "Raised" 
}: { 
  comp_id?: string; 
  isRaised?: string 
}) {
  const router = useRouter();
  const tracking = mockTrackingData; // Replace with real API later
  const isLoading = false;
  const error = null;

  // Display message if complaint is not raised
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
            Once raised, you'll see real-time updates on your case progress here.
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-b from-blue-50 to-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-lg text-gray-700 font-medium">Loading case details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-b from-red-50 to-white p-6">
        <XCircle size={64} color="#ef4444" />
        <Text className="mt-4 text-xl font-bold text-red-600 text-center">
          Failed to Load Case
        </Text>
        <Text className="mt-2 text-gray-600 text-center max-w-xs">
          Please try again later.
        </Text>
      </View>
    );
  }

  if (!tracking) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-b from-blue-50 to-white">
        <AlertCircle size={56} color="#f59e0b" />
        <Text className="mt-4 text-lg text-gray-700">No case data found</Text>
      </View>
    );
  }

  // Handle schedule navigation
  const handleSchedulePress = () => {
    router.push({
      pathname: "/(my-request)/complaint-tracking/hearing-history",
      // params: { sr_id: tracking.sr_id },
    });
  };

  // Map steps with icons and details
  const steps = tracking.current_step.map((apiStep) => {
    let icon: React.ReactNode;
    let details = "";

    switch (apiStep.id) {
      case 1: // Payment
        icon = (
          <CreditCard size={22} className={
            apiStep.status === "paid" ? "text-green-600" :
            apiStep.status === "unpaid" ? "text-red-600" : "text-amber-600"
          } />
        );
        if (apiStep.status === "paid") {
          details = `₱${tracking.payment?.amount} paid on ${formatTimestamp(tracking.payment?.spay_date_paid)}.`;
        } else if (tracking.payment?.spay_due_date) {
          details = `Due by ${formatDate(tracking.payment?.spay_due_date)}. Amount: ₱${tracking.payment?.amount}.`;
        } else {
          details = `Amount: ₱${tracking.payment?.amount} for ${tracking.payment?.purpose || 'mediation services'}.`;
        }
        break;

      case 2: // Schedule Mediation
        icon = <Calendar size={22} className={
          apiStep.status === "accepted" ? "text-green-600" :
          apiStep.status === "rejected" ? "text-red-600" : "text-amber-600"
        } />;
        if (apiStep.status === "accepted" && tracking.schedule?.date) {
          details = `Scheduled: ${formatDate(tracking.schedule.date)} at ${tracking.schedule.time || "TBD"}.`;
        } else if (apiStep.status === "rejected") {
          details = `Rescheduled. Reason: ${tracking.schedule?.ss_reason || "Not provided"}.`;
        } else {
          details = "Waiting for payment confirmation to schedule mediation.";
        }
        break;

      case 3: // Case Completion
        icon = <CheckCircle2 size={22} className={
          apiStep.status === "accepted" ? "text-green-600" :
          apiStep.status === "rejected" ? "text-red-600" : "text-gray-500"
        } />;
        if (apiStep.status === "accepted") {
          details = `Case resolved on ${formatDate(tracking.sr_date_marked)}.`;
        } else if (apiStep.status === "rejected") {
          details = `Escalated on ${formatDate(tracking.sr_date_marked)}.`;
        } else {
          details = "Pending mediation outcome.";
        }
        break;

      default:
        icon = <Calendar size={22} className="text-gray-500" />;
    }

    return { ...apiStep, icon, details };
  });

  // Progress calculation
  const progress = tracking.progress_percentage;

  // Status badge
  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
      paid: { 
        bg: "bg-emerald-100", 
        text: "text-emerald-800", 
        label: "Paid",
        icon: <Check size={14} className="text-emerald-600" />
      },
      scheduled: { 
        bg: "bg-emerald-100", 
        text: "text-emerald-800", 
        label: "Scheduled",
        icon: <Check size={14} className="text-emerald-600" />
      },
      resolved: { 
        bg: "bg-emerald-100", 
        text: "text-emerald-800", 
        label: "Resolved",
        icon: <Check size={14} className="text-emerald-600" />
      },
      pending: { 
        bg: "bg-amber-100", 
        text: "text-amber-800", 
        label: "Pending",
        icon: <Clock size={14} className="text-amber-600" />
      },
      unpaid: { 
        bg: "bg-amber-100", 
        text: "text-amber-800", 
        label: "Unpaid",
        icon: <Clock size={14} className="text-amber-600" />
      },
      "not scheduled": { 
        bg: "bg-amber-100", 
        text: "text-amber-800", 
        label: "Not Scheduled",
        icon: <Clock size={14} className="text-amber-600" />
      },
      "in progress": { 
        bg: "bg-blue-100", 
        text: "text-blue-800", 
        label: "In Progress",
        icon: <Clock size={14} className="text-blue-600" />
      },
      rejected: { 
        bg: "bg-red-100", 
        text: "text-red-800", 
        label: "Rejected",
        icon: <XCircle size={14} className="text-red-600" />
      },
      overdue: { 
        bg: "bg-red-100", 
        text: "text-red-800", 
        label: "Overdue",
        icon: <XCircle size={14} className="text-red-600" />
      },
      rescheduled: { 
        bg: "bg-red-100", 
        text: "text-red-800", 
        label: "Rescheduled",
        icon: <XCircle size={14} className="text-red-600" />
      },
      escalated: { 
        bg: "bg-red-100", 
        text: "text-red-800", 
        label: "Escalated",
        icon: <XCircle size={14} className="text-red-600" />
      },
    };

    const item = map[status.toLowerCase()] || map.pending;
    return (
      <View className={`flex-row items-center px-3 py-1.5 rounded-full ${item.bg}`}>
        {item.icon}
        <Text className={`ml-1.5 text-xs font-semibold ${item.text}`}>{item.label}</Text>
      </View>
    );
  };

  // Check if step is actionable
  const isStepActionable = (id: number) => {
    if (id === 2) { // Schedule step
      const paymentStep = steps.find(s => s.id === 1);
      return paymentStep?.status === "paid";
    }
    return false;
  };

  // Get payment status for display
  const paymentStep = steps.find(step => step.id === 1);
  const currentStep = steps.find(s => ["pending", "unpaid", "not scheduled"].includes(s.status));
  const caseStatus = currentStep?.display_status || "Resolved";

  return (
    <View className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      {/* Timeline Steps */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6 space-y-6">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const isActionable = isStepActionable(step.id);
            const isCompleted = ["paid", "scheduled", "resolved"].includes(step.status);
            const isCurrent = step.status === "pending" || step.status === "unpaid" || step.status === "not scheduled";

            return (
              <View key={step.id} className="relative">
                {/* Connector Line */}
                {!isLast && (
                  <View
                    className={`absolute left-6 top-14 w-0.5 h-full -z-0 ${
                      steps[index + 1].status === "paid" || steps[index + 1].status === "scheduled"
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    }`}
                  />
                )}

                {/* Step Card */}
                <View className="flex-row">
                  {/* Icon Circle */}
                  <View className="items-center mr-4">
                    <View
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-emerald-100 border-emerald-500"
                          : isCurrent
                          ? "bg-blue-100 border-blue-500"
                          : "bg-gray-100 border-gray-300"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={20} className="text-emerald-600" />
                      ) : (
                        step.icon
                      )}
                    </View>
                  </View>

                  {/* Content */}
                  <View className="flex-1 pb-8">
                    {isActionable ? (
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

                        <Text className="text-gray-600 text-sm leading-5 mb-3">
                          {step.description}
                        </Text>

                        {step.details && (
                          <View className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <Text className="text-xs text-blue-800 font-medium">{step.details}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View
                        className={`bg-white rounded-xl p-5 shadow-md border-2 ${
                          isCompleted
                            ? "border-emerald-200"
                            : isCurrent
                            ? "border-blue-200"
                            : "border-gray-200"
                        } ${!isCompleted && !isCurrent ? "opacity-70" : ""}`}
                      >
                        <View className="flex-row justify-between items-start mb-3">
                          <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-900 mb-2">{step.title}</Text>
                            {getStatusBadge(step.display_status)}
                          </View>
                          <Text className="text-2xl font-bold text-gray-300">{step.id}</Text>
                        </View>

                        <Text className="text-gray-600 text-sm leading-5 mb-3">
                          {step.description}
                        </Text>

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

        {/* Case Summary Card */}
        <View className="px-5 pb-8">
          <Card className="overflow-hidden shadow-lg border-0">
            {/* Gradient Header */}
           <View className="bg-primaryBlue px-6 py-4">
              <View className="flex-row items-center space-x-2 gap-2">
                <ClipboardList size={20} color="white" />
                <Text className="text-white font-bold text-lg">Case Summary</Text>
              </View>
            </View>

            {/* Content */}
            <View className="p-6 space-y-5 bg-white">
              {/* Case ID */}
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center space-x-2">
                  <Text className="text-gray-500 text-sm font-medium">Case No.</Text>
                </View>
                <Text className="text-blue-600 font-bold text-sm tracking-wider">
                  {tracking.sr_id}
                </Text>
              </View>

              <View className="py-2">
                <View className="h-px bg-gray-200" />
              </View>

              {/* Payment Status */}
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center space-x-2 gap-2">
                  <CreditCard size={16} className={
                    paymentStep?.status === "paid" ? "text-emerald-500" : 
                    paymentStep?.status === "unpaid" ? "text-red-500" : "text-amber-500"
                  } />
                  <Text className="text-gray-600 text-sm">Payment Status</Text>
                </View>
                <View>
                  {getStatusBadge(paymentStep?.display_status || "Unpaid")}
                </View>
              </View>

              {/* Current Step */}
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center space-x-2 gap-2">
                  <Clock size={16} className="text-blue-500" />
                  <Text className="text-gray-600 text-sm">Current Step</Text>
                </View>
                <Text className="text-gray-900 font-medium text-sm text-right max-w-[60%]">
                  {currentStep?.title || "Case Resolved"}
                </Text>
              </View>

              {/* Case Status */}
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center space-x-2 gap-2">
                  <CheckCircle2 size={16} className={
                    caseStatus === "Resolved" ? "text-emerald-500" :
                    caseStatus === "In Progress" ? "text-blue-500" : "text-amber-500"
                  } />
                  <Text className="text-gray-600 text-sm">Case Status</Text>
                </View>
                <View>
                  {getStatusBadge(caseStatus)}
                </View>
              </View>

              {/* Progress Bar */}
              <View className="mt-4">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-xs text-gray-500">Overall Progress</Text>
                  <Text className="text-xs font-bold text-blue-600">{progress}%</Text>
                </View>
                <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </View>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}