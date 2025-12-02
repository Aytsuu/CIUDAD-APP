import PageLayout from "@/screens/_PageLayout"
import { LoadingState } from "@/components/ui/loading-state"
import { TouchableOpacity, View, Text, ScrollView, Modal, Image, Pressable, Alert, RefreshControl } from "react-native"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { ChevronRight} from "@/lib/icons/ChevronRight" 
import { X } from "@/lib/icons/X" 
import { useRouter, useLocalSearchParams } from "expo-router"
import { ComplaintRecordForSummon } from "../complaint-record"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Users, User, FileText, Calendar, Paperclip, Eye } from "lucide-react-native"
import { useGetSummonCaseDetails } from "../queries/summonFetchQueries"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { formatDate } from "@/helpers/dateHelpers"
import { formatTime } from "@/helpers/timeFormatter"

export default function SummonRemarkDetails(){
    const router = useRouter()
    const params = useLocalSearchParams()
    const [activeTab, setActiveTab] = useState<"details" | "schedule" | "complaint">("details")
    const [viewImagesModalVisible, setViewImagesModalVisible] = useState(false);
    const [selectedImages, setSelectedImages] = useState<{url: string, name: string}[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { sc_id, incident_type, hasResident, comp_names, acc_names, sc_code, sc_mediation_status} = params

    const {data: details, isLoading, refetch} = useGetSummonCaseDetails(String(sc_id))

    // Refresh function
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    };

    // Parse array data from comma-separated strings
    const complainantNames = comp_names ? (comp_names as string).split(',') : []
    const accusedNames = acc_names ? (acc_names as string).split(',') : []

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

    const handleAddRemarks = (hs_id: string, st_id: string, sc_id: string, schedCount: number) => {
        router.push ({
            pathname: "/(summon)/add-remarks", 
            params: {
                sc_id,
                hs_id,
                st_id,
                schedCount
            }
        })
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

   
    if(isLoading && !isRefreshing){
        return (
            <View className="flex-1 justify-center items-center">
                <LoadingState/>
            </View>    
        )
    }
  

    // Case Details Tab Content
    const CaseDetailsTab = () => (
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
            <View className="p-6">
                {/* Case Information */}
                <Card className="border-2 border-gray-200 shadow-sm bg-white mb-3">
                    <CardHeader className="flex flex-row gap-3 items-center">
                        <Text className="text-md font-bold text-gray-900">Case Information </Text>
                        {hasResident && (
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
                            <View className="py-2">
                                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                                    <Text className="text-sm font-medium text-gray-600">Date Marked</Text>
                                    <Text className="text-sm font-semibold text-gray-900">
                                        {formatTimestamp(details.sc_date_marked)}
                                    </Text>
                                </View>
                                {details.staff_name && (
                                    <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                                        <Text className="text-sm font-medium text-gray-600">Marked By</Text>
                                        <Text className="text-sm font-semibold text-gray-900">
                                            {details.staff_name}
                                        </Text>
                                    </View>
                                )}
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
    const HearingScheduleTab = () => {
            const hearingSchedules = details?.hearing_schedules || [];

            if (hearingSchedules.length === 0) {
                return (
                    <ScrollView 
                        className="flex-1"
                        contentContainerStyle={{ flexGrow: 1 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                colors={['#00a8f0']}
                                tintColor="#00a8f0"
                            />
                        }
                    >
                        <View className="flex-1 justify-center items-center p-6">
                            <Calendar size={48} className="text-gray-300 mb-4" />
                            <Text className="text-gray-500 text-center text-md font-medium mb-2">
                                No Hearing Schedules
                            </Text>
                            <Text className="text-gray-400 text-center text-sm">
                                No hearing schedules have been created for this case yet.
                            </Text>
                        </View>
                    </ScrollView>
                );
            }

            return (
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
                    <View className="p-6">
                        {hearingSchedules.map((schedule: any, index: number) => (
                            <Card key={schedule.hs_id || index} className="border-2 border-gray-200 shadow-sm bg-white mb-3">
                                <CardContent className="p-4">
                                    {/* Header with Hearing Level and Status */}
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="flex flex-row items-center gap-3">
                                            <Text className="text-md font-bold text-gray-900">
                                                {schedule.hs_level}
                                            </Text>
                                            <View className="flex-row items-center space-x-2">
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
                                    </View>

                                    {/* Hearing Date and Time */}
                                    <View className="space-y-2 mb-3">
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-sm font-medium text-gray-600">Hearing Date & Time</Text>
                                            <Text className="text-sm font-semibold text-gray-900">
                                                {formatDate(schedule.summon_date?.sd_date, "long")},  {formatTime(schedule.summon_time?.st_start_time)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Remarks Section */}
                                    <View className="border-t border-gray-100 pt-3">
                                        {schedule.remark && schedule.remark.rem_id ? (
                                            <View className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                                <View className="mb-2">
                                                    <Text className="text-sm font-semibold text-blue-800 mb-1">
                                                        Remarks
                                                    </Text>
                                                    <Text className="text-xs text-blue-600 italic">
                                                        by{schedule.remark.staff_name ? ` ${schedule.remark.staff_name}` : ' Unknown'}, on {formatTimestamp(schedule.remark.rem_date)}
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
                                                <View className="flex-row items-center space-x-2">
                                                    <Text className="text-sm font-semibold text-red-800">
                                                        No Remarks Available
                                                    </Text>
                                                </View>
                                                <Text className="text-xs text-red-600 mt-1">
                                                    Add remarks to close this hearing schedule
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Action Button */}
                                    {!schedule.remark && (
                                        <TouchableOpacity 
                                            className="mt-3 bg-blue-600 py-2 px-4 rounded-lg"
                                            onPress={() => handleAddRemarks(schedule.hs_id, schedule.summon_time.st_id, details?.sc_id || '', hearingSchedules.length)}
                                        >
                                            <Text className="text-white text-sm font-semibold text-center">
                                                Add Remarks
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </View>
                </ScrollView>
            );
        };

    // Complaint Record Tab Content
    const ComplaintRecordTab = () => (
        <View className="flex-1">
            {details?.comp_id ? (
                <ComplaintRecordForSummon comp_id={details.comp_id as string} />
            ) : (
                <ScrollView 
                    className="flex-1"
                    contentContainerStyle={{ flexGrow: 1 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={['#00a8f0']}
                            tintColor="#00a8f0"
                        />
                    }
                >
                    <View className="flex-1 justify-center items-center p-6">
                        <FileText size={48} className="text-gray-300 mb-4" />
                        <Text className="text-gray-500 text-center text-md font-medium mb-2">
                            No Case ID Available
                        </Text>
                        <Text className="text-gray-400 text-center text-sm">
                            Unable to load complaint record without case ID
                        </Text>
                    </View>
                </ScrollView>
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
            </PageLayout>
        </>
    )
}