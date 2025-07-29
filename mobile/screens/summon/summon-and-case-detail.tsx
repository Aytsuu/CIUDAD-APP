import PageLayout from "../_PageLayout"
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { ChevronRight } from "@/lib/icons/ChevronRight"
import { Check } from "@/lib/icons/Check"
import { AlertTriangle } from "@/lib/icons/AlertTriangle"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useEscalateCase, useResolveCase } from "./queries/summonUpdateQueries"
import { formatTime } from "@/helpers/timeFormatter"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfirmationModal } from "@/components/ui/confirmationModal"
import { useState } from "react"

export default function SummonDetailsView() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const sr_id = params.sr_id as string
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details")

  // const { data: caseDetails, isLoading } = useGetCaseDetails(sr_id || "")
  const isLoading = false // Mock loading state

  // Updated mock data to match your types
  const caseDetails = {
    sr_id: "1",
    sr_code: "001-25",
    sr_status: "Ongoing",
    sr_decision_date: "2023-07-01T10:15:00Z",
    complainant: [
      {
        cpnt_id: "CPNT-001",
        cpnt_name: "John Doe",
        address: {
          add_province: "Metro Manila",
          add_city: "Quezon City",
          add_barangay: "Barangay 1",
          add_street: "Main Street",
          sitio_name: "Sitio A",
          formatted_address: "123 Main St, Barangay 1, Quezon City, Metro Manila"
        }
      }
    ],
    complaint: {
      comp_id: "COMP-001",
      comp_incident_type: "Noise Complaint",
      comp_allegation: "Excessive noise during quiet hours disturbing the peace",
      comp_datetime: "2023-05-10T22:30:00Z",
      accused: [
        {
          acsd_id: "ACSD-001",
          acsd_name: "Jane Smith",
          address: {
            add_province: "Metro Manila",
            add_city: "Quezon City",
            add_barangay: "Barangay 1",
            add_street: "Main Street",
            formatted_address: "124 Main St, Barangay 1, Quezon City, Metro Manila"
          }
        },
        {
          acsd_id: "ACSD-002",
          acsd_name: "Mike Johnson",
          address: {
            add_province: "Metro Manila",
            add_city: "Quezon City",
            add_barangay: "Barangay 1",
            add_street: "Main Street",
            formatted_address: "125 Main St, Barangay 1, Quezon City, Metro Manila"
          }
        }
      ]
    },
    case_activities: [
      {
        ca_id: "ACT-001",
        ca_reason: "Initial hearing to address the noise complaint",
        ca_hearing_date: "2023-06-15",
        ca_hearing_time: "14:30:00",
        ca_mediation: "Attempting mediation between parties",
        ca_date_of_issuance: "2023-06-01T10:15:00Z",
        srf_detail: {
          srf_id: "SRF-001",
          srf_name: "Summon_001.pdf",
          srf_url: "https://example.com/summon/001"
        }
      },
      {
        ca_id: "ACT-002",
        ca_reason: "Follow-up hearing to assess compliance",
        ca_hearing_date: "2023-07-01",
        ca_hearing_time: "10:00:00",
        ca_mediation: "Reviewing mediation progress",
        ca_date_of_issuance: "2023-06-20T09:30:00Z",
        srf_detail: {
          srf_id: "SRF-002",
          srf_name: "Summon_002.pdf",
          srf_url: "https://example.com/summon/002"
        }
      }
    ]
  }

  const { mutate: markResolve } = useResolveCase()
  const { mutate: markEscalate } = useEscalateCase()

  const isCaseClosed = caseDetails?.sr_status === "Resolved" || caseDetails?.sr_status === "Escalated"

  const handleResolve = () => {
    markResolve(sr_id)
  }

  const handleEscalate = () => {
    markEscalate({
      srId: sr_id,
      comp_id: caseDetails?.complaint.comp_id || "",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-green-50 text-green-700"
      case "escalated":
        return "bg-red-50 text-red-700"
      case "ongoing":
        return "bg-blue-50 text-blue-600"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  if (isLoading) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Loading...</Text>}
        rightAction={<View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 text-sm mt-2">Loading case details...</Text>
        </View>
      </PageLayout>
    )
  }

  const renderCaseDetails = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <Card className="mx-4 mt-4 mb-6 bg-white rounded-lg overflow-hidden">
        <View className="p-4">
          {/* Status Badge */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">Case Details</Text>
            <View className={`px-3 py-1 rounded-full ${getStatusColor(caseDetails?.sr_status || "")}`}>
              <Text className={`text-xs font-medium ${getStatusColor(caseDetails?.sr_status || "")}`}>
                {caseDetails?.sr_status || "Unknown"}
              </Text>
            </View>
          </View>

          {/* Complainant */}
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Complainant</Text>
            <Text className="text-base font-medium text-gray-800">
              {caseDetails?.complainant?.map(c => c.cpnt_name).join(", ") || "N/A"}
            </Text>
            {caseDetails?.complainant?.[0]?.address?.formatted_address && (
              <Text className="text-sm text-gray-500 mt-1">
                {caseDetails.complainant[0].address.formatted_address}
              </Text>
            )}
          </View>

          {/* Accused */}
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Accused</Text>
            <Text className="text-base font-medium text-gray-800">
              {caseDetails?.complaint?.accused?.map(a => a.acsd_name).join(", ") || "N/A"}
            </Text>
            {caseDetails?.complaint?.accused?.[0]?.address?.formatted_address && (
              <Text className="text-sm text-gray-500 mt-1">
                {caseDetails.complaint.accused[0].address.formatted_address}
              </Text>
            )}
          </View>

          {/* Incident Type */}
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Incident Type</Text>
            <Text className="text-base font-medium text-gray-800">
              {caseDetails?.complaint?.comp_incident_type || "N/A"}
            </Text>
          </View>

          {/* Incident Date */}
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Incident Date</Text>
            <Text className="text-base font-medium text-gray-800">
              {caseDetails?.complaint?.comp_datetime ? formatTimestamp(caseDetails.complaint.comp_datetime) : "N/A"}
            </Text>
          </View>

          {/* Allegation */}
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Allegation</Text>
            <Text className="text-sm text-gray-700">{caseDetails?.complaint?.comp_allegation || "N/A"}</Text>
          </View>

          {/* Decision Date for closed cases */}
          {isCaseClosed && (
            <View className="mt-2 pt-2 border-t border-gray-100">
              <Text className="text-xs text-gray-500">
                Marked on{" "}
                {caseDetails?.sr_decision_date ? formatTimestamp(caseDetails.sr_decision_date) : "an unknown date"}
              </Text>
            </View>
          )}

          {/* Action Buttons for ongoing cases */}
          {!isCaseClosed && (
            <View className="flex-row justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
              <ConfirmationModal
                trigger={
                  <Button className="bg-green-500 text-white px-3 py-2 rounded-md flex-row items-center">
                    <Check className="w-4 h-4 mr-1 text-white" />
                    <Text className="text-white text-xs">Resolve</Text>
                  </Button>
                }
                title="Confirm Resolution"
                description="Are you sure you want to mark this case as resolved?"
                actionLabel="Resolve"
              />
              <ConfirmationModal
                trigger={
                  <Button className="bg-red-500 text-white px-3 py-2 rounded-md flex-row items-center">
                    <AlertTriangle className="w-4 h-4 mr-1 text-white" />
                    <Text className="text-white text-xs">Escalate</Text>
                  </Button>
                }
                title="Confirm Escalation"
                description="Are you sure you want to escalate this case?"
                actionLabel="Escalate"
              />
            </View>
          )}
        </View>
      </Card>
    </ScrollView>
  )

  const renderCaseActivity = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="mx-4 mt-4 mb-6">
        {caseDetails?.case_activities?.length > 0 ? (
          caseDetails.case_activities.map((activity) => (
            <Card key={activity.ca_id} className="mb-4 bg-white rounded-lg overflow-hidden">
              <View className="p-4">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="font-medium text-gray-900">Hearing Date</Text>
                  <Text>{activity.ca_hearing_date}</Text>
                </View>

                <View className="flex-row justify-between items-center mb-3">
                  <Text className="font-medium text-gray-900">Hearing Time</Text>
                  <Text>{formatTime(activity.ca_hearing_time)}</Text>
                </View>

                <View className="flex-row justify-between items-center mb-3">
                  <Text className="font-medium text-gray-900">Date of Issuance</Text>
                  <Text>{formatTimestamp(activity.ca_date_of_issuance)}</Text>
                </View>

                <View className="mb-3">
                  <Text className="font-medium text-gray-900 mb-1">Reason</Text>
                  <Text className="text-gray-700">{activity.ca_reason}</Text>
                </View>

                <View className="mb-3">
                  <Text className="font-medium text-gray-900 mb-1">Mediation</Text>
                  <Text className="text-gray-700">{activity.ca_mediation}</Text>
                </View>

                {activity.srf_detail && (
                  <TouchableOpacity 
                    className="flex-row justify-between items-center py-3 border-t border-gray-100"
                    onPress={() => {
                      // Handle summon file view
                      console.log("Viewing summon file:", activity.srf_detail.srf_url)
                    }}
                  >
                    <Text className="font-medium text-gray-900">Summon File</Text>
                    <View className="flex-row items-center">
                      <Text className="text-blue-600 mr-1">{activity.srf_detail.srf_name}</Text>
                      <ChevronRight size={16} color="#1273B8" />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))
        ) : (
          <View className="items-center justify-center py-8 bg-white rounded-lg">
            <Text className="text-gray-500">No case activities found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Case No. {caseDetails?.sr_code}</Text>}
      rightAction={<View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>}
    >
      <View className="flex-1 bg-gray-50">
        {/* Tab Headers */}
        <View className="flex-row bg-white border-b border-gray-200">
          <TouchableOpacity
            className={`flex-1 py-4 items-center border-b-2 ${
              activeTab === "details" ? "border-blue-500" : "border-transparent"
            }`}
            onPress={() => setActiveTab("details")}
          >
            <Text className={`font-medium ${activeTab === "details" ? "text-blue-600" : "text-gray-500"}`}>
              Case Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-4 items-center border-b-2 ${
              activeTab === "activity" ? "border-blue-500" : "border-transparent"
            }`}
            onPress={() => setActiveTab("activity")}
          >
            <Text className={`font-medium ${activeTab === "activity" ? "text-blue-600" : "text-gray-500"}`}>
              Case Activity
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "details" ? renderCaseDetails() : renderCaseActivity()}
      </View>
    </PageLayout>
  )
}