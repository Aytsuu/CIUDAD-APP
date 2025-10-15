import PageLayout from "@/screens/_PageLayout"
import { LoadingState } from "@/components/ui/loading-state"
import { TouchableOpacity, View, Text, ScrollView } from "react-native"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { useRouter, useLocalSearchParams } from "expo-router"
import { ComplaintRecordForSummon } from "../complaint-record"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Users, User, FileText, Calendar } from "lucide-react-native"
import { useGetSummonCaseDetails } from "../queries/summonFetchQueries"
import { formatTimestamp } from "@/helpers/timestampformatter"

export default function SummonRemarkDetails(){
    const router = useRouter()
    const params = useLocalSearchParams()
    const [activeTab, setActiveTab] = useState<"details" | "schedule" | "complaint">("details")

    const { sc_id, incident_type, hasResident, comp_names, acc_names, complainant_addresses, accused_addresses, complainant_rp_ids, sc_code, sc_mediation_status} = params

    const {data: details, isLoading} = useGetSummonCaseDetails(String(sc_id))


    // Parse array data from comma-separated strings
    const complainantNames = comp_names ? (comp_names as string).split(',') : []
    const accusedNames = acc_names ? (acc_names as string).split(',') : []
    const complainantAddresses = complainant_addresses ? (complainant_addresses as string).split(',') : []
    const accusedAddresses = accused_addresses ? (accused_addresses as string).split(',') : []

    const hasResidentBool = hasResident === "true"

    // badge color
    const getStatusColor = (status: string | null | undefined) => {
        if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
        
        switch(status.toLowerCase()) {
            case "ongoing":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "resolved":
                return "bg-green-100 text-green-800 border-green-200";
            case "escalated":
                return "bg-red-100 text-red-800 border-red-200";
            case "waiting for schedule":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

   
    if(isLoading){
        return (
            <View className="flex-1 justify-center items-center">
                <LoadingState/>
            </View>    
        )
    }
  

    // Case Details Tab Content
    const CaseDetailsTab = () => (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-6">
                {/* Case Information */}
                <Card className="border-2 border-gray-200 shadow-sm bg-white mb-3">
                    <CardHeader className="flex flex-row gap-3 items-center">
                        <Text className="text-md font-bold text-gray-900">Case Information </Text>
                        {hasResidentBool && (
                            <View className="bg-green-100 px-2 py-1 rounded-full border border-green-200">
                                <Text className="text-green-700 text-xs font-semibold">Resident</Text>
                            </View>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                            <Text className="text-sm font-medium text-gray-600">Incident Type</Text>
                            <Text className="text-sm font-semibold text-red-500">{incident_type}</Text>
                        </View>

                        <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                            <Text className="text-sm font-medium text-gray-600">Case Status</Text>
                            <View className={`px-3 py-1 rounded-full border ${
                                getStatusColor(details?.sc_conciliation_status || String(sc_mediation_status))
                            }`}>
                                <Text className="text-sm font-medium">
                                    {details?.sc_conciliation_status || sc_mediation_status || "No Status"}
                                </Text>
                            </View>
                        </View>

                        {/* Show Reason if available */}
                        {details?.sc_reason && (
                            <View className="py-2 border-b border-gray-100">
                                <Text className="text-sm font-medium text-gray-600 mb-2">Reason</Text>
                                <Text className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    {details.sc_reason}
                                </Text>
                            </View>
                        )}

                        {/* Show Date Marked if available */}
                        {details?.sc_date_marked && (
                            <View className="flex-row justify-between items-center py-2">
                                <Text className="text-sm font-medium text-gray-600">Date Marked</Text>
                                <Text className="text-sm font-semibold text-gray-900">
                                    {formatTimestamp(details.sc_date_marked)}
                                </Text>
                            </View>
                        )}
                    </CardContent>
                </Card>

                {/* Complainants Section */}
                <Card className="border-2 border-gray-200 shadow-sm bg-white mb-3">
                    <CardHeader>
                        <View className="flex-row items-center space-x-2">
                            <Users size={20} className="text-green-600" />
                            <Text className="text-md font-bold text-gray-900">
                                Complainant{complainantNames.length > 1 ? 's' : ''} ({complainantNames.length})
                            </Text>
                        </View>
                    </CardHeader>
                    <CardContent>
                        {complainantNames.length > 0 ? (
                            <View className="space-y-3">
                                {complainantNames.map((name, index) => (
                                    <View key={index} className="border border-green-200 rounded-lg p-3 bg-green-50">
                                        <Text className="font-semibold text-green-900 text-sm">
                                            {name || "Unnamed Complainant"}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View className="items-center py-4 bg-gray-50 rounded-lg">
                                <Users size={24} className="text-gray-400 mb-2" />
                                <Text className="text-gray-500">No complainants listed</Text>
                            </View>
                        )}
                    </CardContent>
                </Card>

                {/* Respondents Section */}
                <Card className="border-2 border-gray-200 shadow-sm bg-white mb-3">
                    <CardHeader>
                        <View className="flex-row items-center space-x-2">
                            <User size={20} className="text-red-600" />
                            <Text className="text-md font-bold text-gray-900">
                                Respondent{accusedNames.length > 1 ? 's' : ''} ({accusedNames.length})
                            </Text>
                        </View>
                    </CardHeader>
                    <CardContent>
                        {accusedNames.length > 0 ? (
                            <View className="space-y-3">
                                {accusedNames.map((name, index) => (
                                    <View key={index} className="border border-red-200 rounded-lg p-3 bg-red-50">
                                        <Text className="font-semibold text-red-900 text-sm">
                                            {name || "Unnamed Respondent"}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View className="items-center py-4 bg-gray-50 rounded-lg">
                                <User size={24} className="text-gray-400 mb-2" />
                                <Text className="text-gray-500">No respondents listed</Text>
                            </View>
                        )}
                    </CardContent>
                </Card>
            </View>
        </ScrollView>
    )

    // Hearing Schedule Tab Content
    const HearingScheduleTab = () => (
        <View className="flex-1 justify-center items-center p-6">
            <Calendar size={48} className="text-gray-300 mb-4" />
            <Text className="text-gray-500 text-center text-md font-medium mb-2">
                Hearing Schedule
            </Text>
            <Text className="text-gray-400 text-center text-sm">
                Hearing schedule information will be displayed here
            </Text>
            {/* You can replace this with your actual hearing schedule component */}
        </View>
    )

    // Complaint Record Tab Content
    const ComplaintRecordTab = () => (
        <View className="flex-1">
            {details?.comp_id ? (
                <ComplaintRecordForSummon comp_id={details.comp_id as string} />
            ) : (
                <View className="flex-1 justify-center items-center p-6">
                    <FileText size={48} className="text-gray-300 mb-4" />
                    <Text className="text-gray-500 text-center text-md font-medium mb-2">
                        No Case ID Available
                    </Text>
                    <Text className="text-gray-400 text-center text-sm">
                        Unable to load complaint record without case ID
                    </Text>
                </View>
            )}
        </View>
    )

    return(
        <>
            <PageLayout
                leftAction={
                    <TouchableOpacity 
                        onPress={() => router.back()} 
                        className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
                    >
                        <ChevronLeft size={24} className="text-gray-700" />
                    </TouchableOpacity>
                }
                wrapScroll={false}
                headerTitle={<Text className="text-gray-900 text-[13px]">Case {sc_code}</Text>}
            >
                <View className="flex-1 bg-gray-50">
                    {/* Tabs */}
                    <View className="bg-white border-b border-gray-200">
                        <View className="flex-row">
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
                                    activeTab === "schedule" ? "border-blue-500" : "border-transparent"
                                }`}
                                onPress={() => setActiveTab("schedule")}
                            >
                                <Text className={`font-medium ${activeTab === "schedule" ? "text-blue-600" : "text-gray-500"}`}>
                                    Hearing Schedule
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`flex-1 py-4 items-center border-b-2 ${
                                    activeTab === "complaint" ? "border-blue-500" : "border-transparent"
                                }`}
                                onPress={() => setActiveTab("complaint")}
                            >
                                <Text className={`font-medium ${activeTab === "complaint" ? "text-blue-600" : "text-gray-500"}`}>
                                    Complaint 
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tab Content */}
                    <View className="flex-1">
                        {activeTab === "details" && <CaseDetailsTab />}
                        {activeTab === "schedule" && <HearingScheduleTab />}
                        {activeTab === "complaint" && <ComplaintRecordTab />}
                    </View>
                </View>
            </PageLayout>
        </>
    )
}