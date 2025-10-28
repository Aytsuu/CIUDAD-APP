import PageLayout from "@/screens/_PageLayout"
import { LoadingState } from "@/components/ui/loading-state"
import { TouchableOpacity, View, Text, ScrollView, Modal, Image, Pressable, Alert, Linking } from "react-native"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { ChevronRight } from "@/lib/icons/ChevronRight" 
import { X } from "@/lib/icons/X" 
import { useRouter, useLocalSearchParams } from "expo-router"
import { ComplaintRecordForSummon } from "../complaint-record"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Users, User, FileText, Calendar, Paperclip, Eye, Check, Forward, CircleAlert, Plus } from "lucide-react-native"
import { useGetCouncilCaseDetails } from "../queries/summonFetchQueries"
import { useResolveCase, useForwardcase } from "../queries/summonUpdateQueries"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { formatDate } from "@/helpers/dateHelpers"
import { formatTime } from "@/helpers/timeFormatter"
import { Button } from "@/components/ui/button"
import { ConfirmationModal } from "@/components/ui/confirmationModal"
import { LoadingModal } from "@/components/ui/loading-modal"

export default function CouncilMediationDetails() {
    const router = useRouter()
    const params = useLocalSearchParams()
    const [activeTab, setActiveTab] = useState<"details" | "schedule" | "complaint">("details")
    const [viewImagesModalVisible, setViewImagesModalVisible] = useState(false)
    const [selectedImages, setSelectedImages] = useState<{url: string, name: string}[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    const { 
        sc_id, 
        incident_type, 
        hasResident, 
        comp_names, 
        acc_names, 
        complainant_addresses, 
        accused_addresses, 
        sc_code 
    } = params

    const { data: caseDetails, isLoading } = useGetCouncilCaseDetails(String(sc_id))
    const { mutate: resolve, isPending: isResolvePending } = useResolveCase()
    const { mutate: forward, isPending: isForwardPending } = useForwardcase()

    // Parse array data from comma-separated strings
    const complainantNames = comp_names ? (comp_names as string).split(',') : []
    const accusedNames = acc_names ? (acc_names as string).split(',') : []
    const complainantAddresses = complainant_addresses ? (complainant_addresses as string).split(',') : []
    const accusedAddresses = accused_addresses ? (accused_addresses as string).split(',') : []

    const hasResidentBool = hasResident === "true"

    // Extract data from caseDetails
    const {
        sc_mediation_status: case_status,
        sc_date_marked,
        sc_reason,
        comp_id,
        hearing_schedules = [],
    } = caseDetails || {}

    const isCaseClosed = case_status === "Resolved" || case_status === "Forwarded to Lupon"
    
    // Check if current mediation is 3rd level and closed
    const isThirdMediation = hearing_schedules.some(schedule => 
        schedule.hs_level === "3rd MEDIATION" && schedule.hs_is_closed
    )

    // Check if all hearing schedules have remarks
    const allSchedulesHaveRemarks = hearing_schedules.length > 0 && 
        hearing_schedules.every(schedule => 
            schedule.remark && schedule.remark.rem_id
        )

    // Check if all hearing schedules are closed
    const allSchedulesAreClosed = hearing_schedules.length > 0 && 
        hearing_schedules.every(schedule => schedule.hs_is_closed)

    // Check if buttons should be disabled
    const shouldDisableButtons = !allSchedulesHaveRemarks || !allSchedulesAreClosed

    // Determine if Create button should be shown
    const shouldShowCreateButton = !isCaseClosed && 
                                  !hasResidentBool && 
                                  !isThirdMediation

    // Determine if Resolve button should be shown
    const shouldShowResolveButton = !isCaseClosed

    const handleResolve = () => {
        const status_type = "Council"
        resolve({ status_type, sc_id: String(sc_id) })
    }
    
    const handleForward = () => {
        forward(String(sc_id))
    }

    const handleViewImages = (files: any[], index = 0) => {
        const images = files.map(file => ({
            url: file.url || file.rsd_url ,
            name: file.name || file.rsd_name
        }))
        setSelectedImages(images)
        setCurrentIndex(index)
        setViewImagesModalVisible(true)
    }

    const handleMinutesClick = (hearingMinutes: any[], hs_id: string, hasRemarks: boolean) => {
        // For mobile, navigate to hearing minutes form
        if (hearingMinutes.length === 0 || !hearingMinutes.some(minute => minute.hm_url)) {
            if (!hasRemarks) {
                Alert.alert("Cannot Add Minutes", "Please add remarks first before adding hearing minutes.")
                return
            }
            router.push({
                pathname: "/(summon)/add-hearing-minutes",
                params: {
                    hs_id,
                    sc_id: String(sc_id),
                    status_type: "Council"
                }
            })
        } else {
            const firstMinute = hearingMinutes.find(minute => minute.hm_url)
            if (firstMinute?.hm_url) {
                Alert.alert("Open Minutes", "Would you like to view the minutes?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Open", onPress: () => {
                        Linking.openURL(firstMinute.hm_url).catch(() =>
                            Alert.alert('Cannot Open File', 'Please make sure you have a PDF reader app installed.')
                        );
                    } } 
                ])
            }
        }
    }

    const handleCreateSched = (sc_id: string) => {
        router.push({
            pathname: "/(summon)/create-schedule",
            params: {
                sc_id: sc_id
            }
        })
    }

    const getStatusColor = (status: string | null | undefined) => {
        if (!status) return "bg-gray-100 text-gray-800 border-gray-200"
        
        switch(status.toLowerCase()) {
            case "ongoing":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "resolved":
                return "bg-green-100 text-green-800 border-green-200"
            case "forwarded to lupon":
                return "bg-red-100 text-red-800 border-red-200"
            case "waiting for schedule":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    if (isLoading) {
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
                <Card className="border-2 border-gray-200 shadow-sm bg-white mb-4">
                    <CardHeader className="flex flex-row gap-3 items-center">
                        <Text className="text-md font-bold text-gray-900">Case Information</Text>
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
                            <View className={`px-3 py-1 rounded-full border ${getStatusColor(case_status)}`}>
                                <Text className="text-sm font-medium">
                                    {case_status || "No Status"}
                                </Text>
                            </View>
                        </View>

                        {sc_reason && (
                            <View className="py-2 border-b border-gray-100">
                                <Text className="text-sm font-medium text-gray-600 mb-2">Reason</Text>
                                <Text className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    {sc_reason}
                                </Text>
                            </View>
                        )}

                        {sc_date_marked && (
                            <View className="flex-row justify-between items-center py-2">
                                <Text className="text-sm font-medium text-gray-600">Date Marked</Text>
                                <Text className="text-sm font-semibold text-gray-900">
                                    {formatTimestamp(sc_date_marked)}
                                </Text>
                            </View>
                        )}
                    </CardContent>
                </Card>

                {/* Complainants Section */}
                <Card className="border-2 border-gray-200 shadow-sm bg-white mb-4">
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
                                        {complainantAddresses[index] && (
                                            <Text className="text-green-700 text-xs mt-1">
                                                {complainantAddresses[index]}
                                            </Text>
                                        )}
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
                <Card className="border-2 border-gray-200 shadow-sm bg-white mb-4">
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
                                        {accusedAddresses[index] && (
                                            <Text className="text-red-700 text-xs mt-1">
                                                {accusedAddresses[index]}
                                            </Text>
                                        )}
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

                {/* Action Buttons */}
                {!isCaseClosed && (
                    <View className="flex flex-col gap-3">
                            {shouldShowResolveButton && (
                                <ConfirmationModal
                                    trigger={
                                        <Button
                                            className={` flex flex-row gap-2 w-full py-3 rounded-lg ${shouldDisableButtons ? 'bg-gray-400' : 'bg-green-500'}`}
                                            disabled={shouldDisableButtons}
                                        >
                                            <Check size={20} color="white" />
                                            <Text className="text-white font-semibold ml-2">Mark as Resolved</Text>
                                        </Button>
                                    }
                                    title="Confirm Resolution"
                                    description="Are you sure you want to mark this case as resolved?"
                                    actionLabel="Confirm"
                                    onPress={() => handleResolve()}
                                />
                            )}
                            
                            {isThirdMediation && (
                                <ConfirmationModal
                                    trigger={
                                        <Button
                                            className={ ` flex flex-row gap-2 w-full py-3 rounded-lg ${shouldDisableButtons ? 'bg-gray-400' : 'bg-red-500'}`}
                                            disabled={shouldDisableButtons}
                                        >
                                            <Forward size={20} color="white" />
                                            <Text className="text-white font-semibold ml-2">Forward to Lupon</Text>
                                        </Button>
                                    }
                                    title="Forward to Lupon"
                                    description="Are you sure you want to forward this case to Lupon for further action?"
                                    actionLabel="Confirm"
                                    onPress={() => handleForward()}
                                />
                            )}

                            {(shouldDisableButtons && (shouldShowResolveButton || isThirdMediation)) && (
                                <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                                    <Text className="text-yellow-800 text-sm text-center">
                                        All hearing schedules must have remarks and be closed before taking action
                                    </Text>
                                </View>
                            )}
                    </View>
                )}

                {/* Notices */}
                {case_status === "Forwarded to Lupon" && (
                    <View className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-3">
                        <Text className="text-amber-800 text-sm">
                            <Text className="font-bold">Case Forwarded:</Text> This case has completed the 3rd council mediation and has been forwarded to the Office of Lupon Tagapamayapa for further action.
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    )

    // Hearing Schedule Tab Content
    const HearingScheduleTab = () => {
        const hearingSchedules = hearing_schedules || []

        return (
            <View className="flex-1">
                {/* Resident Case Notice */}
                {hasResidentBool && !isCaseClosed && (
                    <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-4 mt-4 mb-2">
                        <Text className="text-blue-800 text-sm">
                            <Text className="font-bold">Resident Case:</Text> As the complainant is a resident, they have the option to choose their preferred date and time for the hearing schedule.
                        </Text>
                    </View>
                )}

                {/* Create Schedule Button */}
                {shouldShowCreateButton && (
                    <View className="p-4 border-b border-gray-200 bg-white">
                        <Button
                            className="flex flex-row gap-2 bg-blue-500 py-3 rounded-lg"
                            onPress={() => handleCreateSched(String(sc_id))}
                        >
                            <Plus size={20} color="white" />
                            <Text className="text-white font-semibold ml-2">Create New Schedule</Text>
                        </Button>
                    </View>
                )}

                {hearingSchedules.length === 0 ? (
                    <View className="flex-1 justify-center items-center p-6">
                        <Calendar size={48} className="text-gray-300 mb-4" />
                        <Text className="text-gray-500 text-center text-md font-medium mb-2">
                            No Hearing Schedules
                        </Text>
                        <Text className="text-gray-400 text-center text-sm">
                            No hearing schedules have been created for this case yet.
                        </Text>
                    </View>
                ) : (
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        <View className="p-6">
                            {hearingSchedules.map((schedule: any, index: number) => {
                                const hasRemarks = schedule.remark && schedule.remark.rem_id
                                
                                return (
                                    <Card key={schedule.hs_id || index} className="border-2 border-gray-200 shadow-sm bg-white mb-4">
                                        <CardContent className="p-4">
                                            {/* Header with Hearing Level and Status */}
                                            <View className="flex-row justify-between items-start mb-3">
                                                <View className="flex flex-row items-center gap-3">
                                                    <Text className="text-md font-bold text-gray-900">
                                                        {schedule.hs_level}
                                                    </Text>
                                                    <View className={`px-2 py-1 rounded-full ${
                                                        schedule.hs_is_closed
                                                            ? "bg-orange-100 border border-orange-200"
                                                            : "bg-green-100 border border-green-200"
                                                    }`}> 
                                                        <Text className={`text-xs font-medium ${
                                                            schedule.hs_is_closed ? "text-orange-700" : "text-green-700"
                                                        }`}>
                                                            {schedule.hs_is_closed ? "Closed" : "Open"}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Hearing Date and Time */}
                                            <View className="space-y-2 mb-3">
                                                <View className="flex-row justify-between items-center">
                                                    <Text className="text-sm font-medium text-gray-600">Hearing Date & Time</Text>
                                                    <Text className="text-sm font-semibold text-gray-900">
                                                        {formatDate(schedule.summon_date?.sd_date, "long")}, {formatTime(schedule.summon_time?.st_start_time)}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Remarks Section */}
                                            <View className="border-t border-gray-100 pt-3 mb-3">
                                                {hasRemarks ? (
                                                    <View className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                                        <View className="flex-row justify-between items-start mb-2">
                                                            <Text className="text-sm font-semibold text-blue-800">
                                                                Remarks Added
                                                            </Text>
                                                            <Text className="text-xs text-blue-600">
                                                                {formatTimestamp(schedule.remark.rem_date)}
                                                            </Text>
                                                        </View>
                                                        <Text className="text-sm text-gray-700 mb-2">
                                                            {schedule.remark.rem_remarks}
                                                        </Text>
                                                        {schedule.remark.supp_docs && schedule.remark.supp_docs.length > 0 && (
                                                            <View className="mt-2">
                                                                <TouchableOpacity 
                                                                    onPress={() => handleViewImages(schedule.remark.supp_docs)}
                                                                    className="flex-row items-center justify-between bg-white border border-blue-200 rounded-lg p-3"
                                                                >
                                                                    <View className="flex-row items-center">
                                                                        <Paperclip size={16} color="#3b82f6" />
                                                                        <Text className="text-blue-700 text-sm font-semibold ml-2">
                                                                            View Attached Files ({schedule.remark.supp_docs.length})
                                                                        </Text>
                                                                    </View>
                                                                    <Eye size={16} color="#3b82f6" />
                                                                </TouchableOpacity>
                                                            </View>
                                                        )}
                                                    </View>
                                                ) : (
                                                    <View className="bg-red-50 rounded-lg p-3 border border-red-200">
                                                        <View className="flex-row items-center space-x-2 gap-2">
                                                            <CircleAlert size={16} color="#dc2626" />
                                                            <Text className="text-sm font-semibold text-red-800">
                                                                No Remarks Available
                                                            </Text>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Minutes Section - UPDATED WITH DISABLED STATE */}
                                            <View className="border-t border-gray-100 pt-3 mb-3">
                                                <Text className="text-sm font-medium text-gray-600 mb-2">Hearing Minutes</Text>
                                                {schedule.hearing_minutes && schedule.hearing_minutes.length > 0 ? (
                                                    <TouchableOpacity 
                                                        onPress={() => handleMinutesClick(schedule.hearing_minutes, schedule.hs_id, hasRemarks)}
                                                        className="flex-row items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3"
                                                    >
                                                        <View className="flex-row items-center">
                                                            <FileText size={16} color="#16a34a" />
                                                            <Text className="text-green-700 text-sm font-semibold ml-2">
                                                                View Minutes
                                                            </Text>
                                                        </View>
                                                        <Eye size={16} color="#16a34a" />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <TouchableOpacity 
                                                        onPress={() => handleMinutesClick([], schedule.hs_id, hasRemarks)}
                                                        className={`flex-row items-center justify-between rounded-lg p-3 ${
                                                            hasRemarks 
                                                                ? "bg-red-50 border border-red-200" 
                                                                : "bg-gray-100 border border-gray-300"
                                                        }`}
                                                        disabled={!hasRemarks}
                                                    >
                                                        <View className="flex-row items-center">
                                                            {hasRemarks ? (
                                                                <CircleAlert size={16} color="#dc2626" />
                                                            ) : (
                                                                <CircleAlert size={16} color="#9ca3af" />
                                                            )}
                                                            <Text className={`text-sm font-semibold ml-2 ${
                                                                hasRemarks ? "text-red-700" : "text-gray-500"
                                                            }`}>
                                                                No Minutes Available
                                                            </Text>
                                                        </View>
                                                        {hasRemarks ? (
                                                            <Plus size={16} color="#dc2626" />
                                                        ) : (
                                                            <Plus size={16} color="#9ca3af" />
                                                        )}
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </View>
                    </ScrollView>
                )}
            </View>
        )
    }

    // Complaint Record Tab Content
    const ComplaintRecordTab = () => (
        <View className="flex-1">
            {comp_id ? (
                <ComplaintRecordForSummon comp_id={String(comp_id)} />
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

    return (
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
                headerTitle={<Text className="text-gray-900 text-[13px]">Case No. {sc_code}</Text>}
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


                {/* Image Viewer Modal */}
                <Modal
                    visible={viewImagesModalVisible}
                    transparent={true}
                    onRequestClose={() => setViewImagesModalVisible(false)}
                >
                    <View className="flex-1 bg-black/90">
                        {/* Header with close button and file name */}
                        <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-between items-center">
                            <Text className="text-white text-lg font-medium w-[90%]">
                                {selectedImages[currentIndex]?.name || 'Document'}
                            </Text>
                            <TouchableOpacity onPress={() => setViewImagesModalVisible(false)}>
                                <X size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Main Image */}
                        <Pressable 
                            className="flex-1 justify-center items-center"
                            onPress={() => setViewImagesModalVisible(false)}
                        >
                            <Image
                                source={{ uri: selectedImages[currentIndex]?.url }}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        </Pressable>

                        {/* Pagination indicators */}
                        {selectedImages.length > 1 && (
                            <View className="absolute bottom-4 left-0 right-0 items-center">
                                <View className="flex-row bg-black/50 rounded-full px-3 py-1">
                                    {selectedImages.map((_, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => setCurrentIndex(index)}
                                            className="p-1"
                                        >
                                            <View className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Navigation arrows */}
                        {selectedImages.length > 1 && (
                            <>
                                {currentIndex > 0 && (
                                    <TouchableOpacity
                                        className="absolute left-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
                                        onPress={() => setCurrentIndex(prev => prev - 1)}
                                    >
                                        <ChevronLeft size={24} color="white" />
                                    </TouchableOpacity>
                                )}
                                {currentIndex < selectedImages.length - 1 && (
                                    <TouchableOpacity
                                        className="absolute right-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
                                        onPress={() => setCurrentIndex(prev => prev + 1)}
                                    >
                                        <ChevronRight size={24} color="white" />
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                </Modal>
                <LoadingModal visible={isForwardPending || isResolvePending}/>
            </PageLayout>
        </>
    )
}