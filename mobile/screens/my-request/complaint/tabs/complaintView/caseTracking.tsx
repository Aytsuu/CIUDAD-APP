import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { FileText, CreditCard, Calendar, CheckCircle2, AlertCircle, ClipboardList } from "lucide-react-native";
import { useGetCaseTracking } from "../../api-operations/queries/SummonFetchQueries";

interface CaseStep {
  id: number;
  title: string;
  description: string;
  status: "pending" | "accepted" | "rejected";
  icon: React.ReactNode;
  details?: string;
}

export default function CaseTracking({ comp_id, isRaised }: { 
    comp_id: string;
    isRaised?: string
}) {
  const { data: tracking, isLoading, error } = useGetCaseTracking(comp_id);
  console.log('Data', tracking)

  // Display message if complaint is not raised
  if (isRaised !== "Raised") {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center p-6">
        <View className="bg-white rounded-lg p-8 items-center shadow-sm border border-gray-200">
          <ClipboardList size={64} color="#6b7280" className="mb-4" />
          <Text className="text-xl font-semibold text-gray-800 text-center mb-2">
            Case Tracking Not Available
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Raise a blotter report to start the case tracking process.
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            Once your complaint is raised, you'll be able to track the progress of your case here.
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading case tracking...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <AlertCircle size={48} color="#ef4444" />
        <Text className="mt-4 text-red-600 text-center">
          Error loading case tracking: {error.message}
        </Text>
      </View>
    );
  }

  if (!tracking) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">No case tracking data found</Text>
      </View>
    );
  }

  // Format dates for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get the actual steps from the API data
  const steps: CaseStep[] = tracking.current_step.map(apiStep => {
    let icon: React.ReactNode;
    let details = apiStep.details || "";

    switch (apiStep.id) {
      case 1: // Summon Request
        icon = <FileText size={20} className="text-blue-600" />;
        break;
      case 2: // Payment
        icon = <CreditCard size={20} className={
          apiStep.status === 'accepted' ? 'text-green-600' : 
          apiStep.status === 'rejected' ? 'text-red-600' : 'text-gray-600'
        } />;
        // Add payment details if available
        if (tracking.payment && apiStep.status === 'accepted') {
          details = `Amount: $${tracking.payment.amount || 'N/A'} for ${tracking.payment.purpose || 'mediation services'}. Paid on ${formatDateTime(tracking.payment.spay_date_paid)}.`;
        } else if (tracking.payment && apiStep.status === 'rejected') {
          details = `Payment overdue. Due date was ${formatDate(tracking.payment.spay_due_date)}.`;
        }
        break;
      case 3: // Schedule Mediation
        icon = <Calendar size={20} className={
          apiStep.status === 'accepted' ? 'text-green-600' : 
          apiStep.status === 'rejected' ? 'text-red-600' : 'text-gray-600'
        } />;
        // Add schedule details if available
        if (tracking.schedule && apiStep.status === 'accepted') {
          details = `Scheduled for ${formatDate(tracking.schedule.date)} at ${tracking.schedule.time || 'specified time'}.`;
        }
        break;
      case 4: // Case Completion
        icon = <CheckCircle2 size={20} className={
          apiStep.status === 'accepted' ? 'text-green-600' : 
          apiStep.status === 'rejected' ? 'text-red-600' : 'text-gray-600'
        } />;
        break;
      default:
        icon = <FileText size={20} className="text-gray-600" />;
    }

    return {
      id: apiStep.id,
      title: apiStep.title,
      description: apiStep.description,
      status: apiStep.status,
      icon,
      details
    };
  });

  const getStepProgress = () => {
    return tracking.progress_percentage;
  };

  const getStatusIcon = (status: CaseStep["status"]) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 size={16} className="text-green-600" />;
      case "pending":
        return <AlertCircle size={16} className="text-yellow-600" />;
      case "rejected":
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: CaseStep["status"]) => {
    let badgeStyle = "";
    let badgeText = "";
    let label = "";

    switch (status) {
      case "pending":
        badgeStyle = "bg-yellow-100";
        badgeText = "text-yellow-800";
        label = "Pending";
        break;
      case "accepted":
        badgeStyle = "bg-green-100";
        badgeText = "text-green-800";
        label = "Accepted";
        break;
      case "rejected":
        badgeStyle = "bg-red-100";
        badgeText = "text-red-800";
        label = "Rejected";
        break;
    }

    return (
      <View className={`px-2 py-1 rounded-full ${badgeStyle}`}>
        <Text className={`text-xs font-medium ${badgeText}`}>{label}</Text>
      </View>
    );
  };

  const ProgressBar = ({ progress }: { progress: number }) => (
    <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <View
        className="h-full bg-blue-600 rounded-full"
        style={{ width: `${progress}%` }}
      />
    </View>
  );

  // Determine which steps should be disabled based on actual status
  const isStepDisabled = (stepId: number, stepStatus: string) => {
    if (stepId === 1) return false; // Step 1 is always enabled
    
    // Step 2 is enabled only if Step 1 is accepted
    if (stepId === 2) {
      const step1 = steps.find(step => step.id === 1);
      return step1?.status !== 'accepted';
    }
    
    // Step 3 is enabled only if Step 2 is accepted
    if (stepId === 3) {
      const step2 = steps.find(step => step.id === 2);
      return step2?.status !== 'accepted';
    }
    
    // Step 4 is enabled only if Step 3 is accepted
    if (stepId === 4) {
      const step3 = steps.find(step => step.id === 3);
      return step3?.status !== 'accepted';
    }
    
    return true;
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Progress Bar */}
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-600">Progress</Text>
            <Text className="text-sm text-gray-600">
              {Math.round(getStepProgress())}% Complete
            </Text>
          </View>
          <ProgressBar progress={getStepProgress()} />
        </View>
      </View>

      {/* Steps */}
      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-4 pb-6">
          {steps.map((step) => {
            const isDisabled = isStepDisabled(step.id, step.status);

            return (
              <View
                key={step.id}
                className={`bg-white rounded-lg p-4 border ${
                  isDisabled
                    ? "opacity-60 border-gray-200"
                    : "border-blue-200 shadow-sm"
                }`}
                pointerEvents={isDisabled ? "none" : "auto"}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-row items-center space-x-3 flex-1">
                    <View className="p-2 rounded-full bg-gray-100">
                      {step.icon}
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-900">
                        {step.title}
                      </Text>
                      <View className="flex-row items-center space-x-2 mt-1">
                        {getStatusIcon(step.status)}
                        {getStatusBadge(step.status)}
                      </View>
                    </View>
                  </View>
                  <Text className="text-xl font-bold text-gray-400">
                    {step.id}
                  </Text>
                </View>

                <Text className="text-sm text-gray-600 mb-3 leading-5">
                  {step.description}
                </Text>

                {step.details && (
                  <View className="bg-gray-50 p-3 rounded-md mb-3">
                    <Text className="text-xs text-gray-600">{step.details} </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}