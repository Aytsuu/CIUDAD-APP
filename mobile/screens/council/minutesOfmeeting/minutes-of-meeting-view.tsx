import { View, Text, TouchableOpacity, ScrollView, Linking, Image, Modal, Pressable, Alert } from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter } from "expo-router";
import _ScreenLayout from '@/screens/_ScreenLayout';
import { useGetMinutesOfMeetingDetails, type MinutesOfMeetingRecords } from "./queries/MOMFetchQueries";
import { useLocalSearchParams } from "expo-router";
import { Calendar, FileText, Target, Paperclip, Edit3, Archive, X, ChevronRight, ArchiveRestore, Trash } from "lucide-react-native";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { useArchiveMinutesOfMeeting, useRestoreMinutesOfMeeting } from "./queries/MOMUpdateQueries";
import { useDeleteMinutesofMeeting } from "./queries/MOMDeleteQueries";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatAreaOfFocus } from "@/helpers/wordFormatter";


export default function MinutesOfMeetingView() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const mom_id = params.mom_id;
    const { data: momDetails, isLoading } = useGetMinutesOfMeetingDetails(String(mom_id));
    const { mutate: archiveData, isPending: archivePending } = useArchiveMinutesOfMeeting();
    const { mutate: deleteData, isPending: deletePending} = useDeleteMinutesofMeeting();
    const { mutate: restoreData, isPending: restorePending} = useRestoreMinutesOfMeeting();
    // State for image viewer modal
    const [viewImagesModalVisible, setViewImagesModalVisible] = useState(false);
    const [selectedImages, setSelectedImages] = useState<{momsp_url: string, momsp_name: string}[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleFileOpen = async (url: string) => {
        if (!url) {
            Alert.alert("Error", "No PDF file available");
            return;
        }
        Linking.openURL(url).catch(() =>
            Alert.alert('Cannot Open PDF', 'Please make sure you have a PDF reader app installed.')
        );
    };


    const handleViewImages = (images: {momsp_url: string, momsp_name: string}[], index = 0) => {
        setSelectedImages(images);
        setCurrentIndex(index);
        setViewImagesModalVisible(true);
    };

    const handleEdit = (item:any) => {
        router.push({
            pathname: '/(council)/minutes-of-meeting/mom-edit',
            params: {
                meetingTitle: item?.mom_title,
                meetingAgenda: item?.mom_agenda,
                meetingDate: item?.mom_date,
                meetingAreas: JSON.stringify(item.areas_of_focus),
                meetingFile: item.file_url || '',
                meetingSuppDocs: JSON.stringify(item.supporting_docs),
                mom_id: item?.mom_id,
                momf_id: item?.file_id
            }
        });
    };
    

    const handleArchive = (mom_id: string) => {
        archiveData(mom_id);
    };

    const handleRestore = (mom_id: string) => {
        restoreData(mom_id)
    }

    const handleDelete = (mom_id: string) => {
        deleteData(mom_id)
    }

    return (
        <_ScreenLayout
            customLeftAction={
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                    <ChevronLeft size={24} className="text-gray-700" />
                </TouchableOpacity>
            }
            headerBetweenAction={<Text className="text-[13px]">Minutes of Meeting Record</Text>}
            showExitButton={false}
            loading={isLoading || archivePending || deletePending || restorePending}
            loadingMessage={archivePending ? "Archiving meeting..." : deletePending? "Deleting meeting..." : restorePending? "Restoring Meeting": "Loading Details...."}
        >
            {momDetails && (
                <>
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        {/* Meeting Date Section */}

                         <View className="bg-white rounded-lg p-4 mb-4 mx-4 shadow-sm border border-gray-100">
                            <View className="flex-row items-center mb-3 gap-2">
                                <FileText size={20} color="gray"/>
                                <Text className="text-lg font-semibold text-gray-800">Title</Text>
                            </View>
                            <Text className="text-gray-700 text-base leading-6">
                                {momDetails.mom_title}
                            </Text>
                        </View>

                        <View className="bg-white rounded-lg p-4 mb-4 mx-4 shadow-sm border border-gray-100">
                            <View className="flex-row items-center mb-2 gap-2">
                                <Calendar size={20} color="gray" />
                                <Text className="text-lg font-semibold text-gray-800">Meeting Date</Text>
                            </View>
                            <Text className="text-gray-600 text-base ml-6">
                                {momDetails.mom_date}
                            </Text>
                        </View>

                        {/* Main Document Section */}
                        {momDetails.file_url && (
                            <View className="bg-white rounded-lg p-4 mb-4 mx-4 shadow-sm border border-gray-100">
                                <View className="flex-row items-center mb-3 gap-2">
                                    <FileText size={20}  color="gray"/>
                                    <Text className="text-lg font-semibold text-gray-800">Meeting Document</Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => momDetails?.file_url && handleFileOpen(momDetails?.file_url)} 
                                    className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex-row items-center justify-between"
                                >
                                    <View className="flex-row items-center flex-1">
                                        <FileText size={18} className="text-blue-600 mr-2" />
                                        <Text className="text-blue-700 font-medium flex-1">
                                            View Meeting Minutes
                                        </Text>
                                    </View>
                                    <Text className="text-blue-600 text-sm">Open</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Agenda Section */}
                        <View className="bg-white rounded-lg p-4 mb-4 mx-4 shadow-sm border border-gray-100">
                            <View className="flex-row items-center mb-3 gap-2">
                                <FileText size={20} color="gray"/>
                                <Text className="text-lg font-semibold text-gray-800">Agenda</Text>
                            </View>
                            <Text className="text-gray-700 text-base leading-6">
                                {momDetails.mom_agenda}
                            </Text>
                        </View>

                        {/* Areas of Focus Section */}
                        {momDetails.areas_of_focus && momDetails.areas_of_focus.length > 0 && (
                            <View className="bg-white rounded-lg p-4 mb-4 mx-4 shadow-sm border border-gray-100">
                                <View className="flex-row items-center mb-3 gap-2">
                                    <Target size={20} color="gray"/>
                                    <Text className="text-lg font-semibold text-gray-800">Areas of Focus</Text>
                                </View>
                                {momDetails.areas_of_focus.map((area, index) => (
                                    <View key={index} className="flex-row items-start mb-2">
                                        <View className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3" />
                                        <Text className="text-gray-700 text-base flex-1 leading-6">
                                            {formatAreaOfFocus(area)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Supporting Documents Section */}
                        {momDetails.supporting_docs && momDetails.supporting_docs.length > 0 && (
                            <View className="bg-white rounded-lg p-4 mb-4 mx-4 shadow-sm border border-gray-100">
                                <View className="flex-row items-center mb-3 gap-2">
                                    <Paperclip size={20} color="gray" />
                                    <Text className="text-lg font-semibold text-gray-800">
                                        Supporting Documents ({momDetails.supporting_docs.length})
                                    </Text>
                                </View>
                                {momDetails.supporting_docs.map((doc, index) => (
                                    <Pressable 
                                        key={doc.momsp_id} 
                                        onPress={() => (doc.momsp_type, doc.momsp_name) ? 
                                            handleViewImages(momDetails.supporting_docs, index) : 
                                            handleFileOpen(doc.momsp_url)}
                                        className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50"
                                    >
                                        {/* Document Header */}
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center flex-1">
                                                <FileText size={20} color="gray" />
                                                <View className="ml-3 flex-1">
                                                    <Text className="text-gray-800 font-medium text-base" numberOfLines={2}>
                                                        {doc.momsp_name}
                                                    </Text>
                                                    <Text className="text-gray-500 text-sm mt-1">
                                                        {doc.momsp_type.toUpperCase()}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text className="text-blue-600 text-sm font-medium">View</Text>
                                        </View>
                                        
                                        {/* Display Image Preview if it's an image file */}
                                        {(doc.momsp_type, doc.momsp_name) && (
                                            <View className="mt-3">
                                                <Image 
                                                    source={{ uri: doc.momsp_url }}
                                                    className="w-full h-48 rounded-lg"
                                                    resizeMode="cover"
                                                />
                                            </View>
                                        )}
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        {momDetails.mom_is_archive == false ? (
                            <View className="flex-row justify-center gap-3">
                                <Button className="bg-blue-50 p-2 rounded-lg" onPress={() => handleEdit(momDetails)}>
                                    <Text className='text-[#3b82f6] flex flex-row items-center gap-2'>
                                        <Edit3 size={16} color="#3b82f6" /> Edit
                                    </Text> 
                                </Button>

                                <ConfirmationModal
                                    trigger={
                                        <Button className="bg-red-50 p-2 rounded-lg">
                                            <Text className='text-red-600 flex flex-row items-center gap-2'>
                                                <Archive size={16} color="#dc2626" /> Archive
                                            </Text> 
                                        </Button>
                                    }
                                    title="Archive Confirmation"
                                    description="This record will be archived and removed from the active list. Do you wish to proceed?"
                                    actionLabel="Confirm"
                                    onPress={() => handleArchive(momDetails.mom_id)}
                                />
                            </View>
                        ) : (
                            <View className="flex-row justify-center gap-3">
                                 <ConfirmationModal
                                    trigger={
                                        <Button className="bg-green-50 p-2 rounded-lg">
                                            <Text className='text-[#10b981] flex flex-row items-center gap-2'>
                                                <ArchiveRestore size={16} color="#10b981" /> Restore
                                            </Text> 
                                        </Button>
                                    }
                                    title="Restore Archived Record"
                                    description="Would you like to restore this record from the archive and make it active again?"
                                    actionLabel="Confirm"
                                    onPress={() => handleRestore(momDetails.mom_id)}
                                />

                                <ConfirmationModal
                                    trigger={
                                        <Button className="bg-red-50 p-2 rounded-lg">
                                            <Text className='text-red-600 flex flex-row items-center gap-2'>
                                                <Trash size={16} color="#dc2626" /> Delete
                                            </Text> 
                                        </Button>
                                    }
                                    title="Delete Confirmation"
                                    description="This record will be permanently deleted and cannot be recovered. Do you wish to proceed?"
                                    actionLabel="Confirm"
                                    onPress={() => handleDelete(momDetails.mom_id)}
                                />
                            </View>
                        )}
                    </ScrollView>

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
                                    {selectedImages[currentIndex]?.momsp_name || 'Document'}
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
                                    source={{ uri: selectedImages[currentIndex]?.momsp_url }}
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
                </>
            )}
        </_ScreenLayout>
    )
}

