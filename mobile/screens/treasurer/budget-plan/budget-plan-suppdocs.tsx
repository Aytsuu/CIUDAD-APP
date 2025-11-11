import { SafeAreaView, View, Text, Pressable, Image, Modal, TouchableOpacity, ScrollView } from "react-native";
import { useGetBudgetPlanSuppDoc, type BudgetPlanSuppDoc } from "./queries/budgetPlanFetchQueries";
import { ChevronLeft, ChevronRight, X, Paperclip, Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { useDeleteBudgetPlanFile } from "./queries/budgetPlanDeleteQueries";
import { LoadingState } from "@/components/ui/loading-state";
import { ImageIcon } from "lucide-react-native";

export default function BudgetPlanSuppDocs({ plan_id, isArchive }: { plan_id: string, isArchive: boolean }) {
    const router = useRouter();
    const { data: suppDocs = [], isLoading } = useGetBudgetPlanSuppDoc(plan_id);
    const [viewImagesModalVisible, setViewImagesModalVisible] = useState(false);
    const [selectedImages, setSelectedImages] = useState<{bpf_url: string, bpf_name: string, bpf_description: string | null}[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const {mutate: deleteFile} = useDeleteBudgetPlanFile();

    const handleViewImages = (images: BudgetPlanSuppDoc[], index = 0) => {
        const formattedImages = images.filter(img => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(img.bpf_name)).map(img => ({
            bpf_url: img.bpf_url,
            bpf_name: img.bpf_name,
            bpf_description: img.bpf_description
        }));
        setSelectedImages(formattedImages);
        setCurrentIndex(index);
        setViewImagesModalVisible(true);
    };

    const handleAddDocument = () => {
        router.push({
            pathname: '/(treasurer)/budgetPlan/budget-plan-suppdoc-create',
            params: {
                plan_id: plan_id
            }
        });
    };

    const handleDeleteDocument = (bpf_id: number) => {
        deleteFile(bpf_id)
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 pt-10">
                <LoadingState />
            </View>
        );
    }

    const imageDocs = suppDocs.filter(doc => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(doc.bpf_name));

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="bg-white p-6 border-b border-gray-200">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <Paperclip size={20} color="#4B5563" />
                        <Text className="text-lg font-semibold text-gray-900 font-sans">
                            Supporting Images ({imageDocs.length})
                        </Text>
                    </View>
                    
                    {!isArchive && (
                        <Button onPress={handleAddDocument} className="bg-blue-600 px-3 py-2 rounded-md flex-row items-center">
                            <Plus size={16} color="#FFFFFF" />
                            <Text className="text-white text-sm font-medium ml-1 font-sans">Add Image</Text>
                        </Button>
                    )}
                </View>
            </View>

            {/* Scrollable content */}
            <View className="flex-1">
                {imageDocs.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-16 px-6">
                        <View className="bg-white rounded-xl p-8 items-center border border-gray-200 shadow-sm">
                            <ImageIcon size={48} className="text-gray-300 mb-4" />
                            <Text className="text-gray-500 text-center text-md font-medium mb-2">
                                No Supporting Images
                            </Text>
                            <Text className="text-gray-400 text-center text-sm">
                                No supporting images have been added to this budget plan yet.
                            </Text>
                        </View>
                    </View>
                ) : (
                    <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                        <View className="pb-3">
                            {/* Image Gallery */}
                            <View className="mb-6">
                                <View className="flex-row flex-wrap justify-between">
                                    {imageDocs.map((doc, index) => (
                                        <View key={doc.bpf_id} className="w-[48%] mb-3">
                                            <Pressable 
                                                onPress={() => handleViewImages(imageDocs, index)}
                                                className="relative bg-white border border-gray-200 rounded-lg overflow-hidden"
                                            >
                                                <Image 
                                                    source={{ uri: doc.bpf_url }}
                                                    className="w-full h-32"
                                                    resizeMode="cover"
                                                />
                                                <View className="p-2">
                                                    <Text className="text-gray-900 font-medium text-xs font-sans" numberOfLines={1}>
                                                        {doc.bpf_name}
                                                    </Text>
                                                    <Text className="text-gray-500 text-xs mt-1 font-sans">
                                                        {formatTimestamp(doc.bpf_upload_date)}
                                                    </Text>
                                                    <Text className="text-gray-600 text-xs mt-1 font-sans" numberOfLines={2}>
                                                        {doc.bpf_description || 'No description available'}
                                                    </Text>
                                                </View>
                                                <ConfirmationModal
                                                    trigger={
                                                        <TouchableOpacity
                                                            className="absolute top-2 right-2 bg-gray-900/80 rounded-full p-1"
                                                        >
                                                            <Trash2 size={16} color="#FFFFFF" />
                                                        </TouchableOpacity>
                                                    }
                                                    title="Confirm Delete"
                                                    description={`Are you sure you want to delete ${doc.bpf_name}?`}
                                                    actionLabel="Confirm"
                                                    onPress={() => handleDeleteDocument(doc.bpf_id)}
                                                />
                                            </Pressable>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                )}
            </View>

            {/* Image Viewer Modal */}
            <Modal
                visible={viewImagesModalVisible}
                transparent={true}
                onRequestClose={() => setViewImagesModalVisible(false)}
            >
                <View className="flex-1 bg-gray-900">
                    {/* Header with close button, file name, and description */}
                    <View className="absolute top-0 left-0 right-0 z-10 bg-gray-900/80 p-4">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1 pr-8">
                                <Text className="text-white text-base font-medium font-sans" numberOfLines={1}>
                                    {selectedImages[currentIndex]?.bpf_name || 'Document'}
                                </Text>
                                <Text className="text-gray-300 text-xs mt-1 font-sans" numberOfLines={2}>
                                    {selectedImages[currentIndex]?.bpf_description || 'No description available'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setViewImagesModalVisible(false)}>
                                <X size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Main Image */}
                    <Pressable 
                        className="flex-1 justify-center items-center"
                        onPress={() => setViewImagesModalVisible(false)}
                    >
                        <Image
                            source={{ uri: selectedImages[currentIndex]?.bpf_url }}
                            className="w-full h-full"
                            resizeMode="contain"
                        />
                    </Pressable>

                    {/* Pagination indicators */}
                    {selectedImages.length > 1 && (
                        <View className="absolute bottom-4 left-0 right-0 items-center">
                            <View className="flex-row bg-gray-900/80 rounded-full px-3 py-1">
                                {selectedImages.map((_, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => setCurrentIndex(index)}
                                        className="p-1"
                                    >
                                        <View className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-400'}`} />
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
                                    className="absolute left-4 top-1/2 -mt-6 bg-gray-900/80 rounded-full p-2"
                                    onPress={() => setCurrentIndex(prev => prev - 1)}
                                >
                                    <ChevronLeft size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            )}
                            {currentIndex < selectedImages.length - 1 && (
                                <TouchableOpacity
                                    className="absolute right-4 top-1/2 -mt-6 bg-gray-900/80 rounded-full p-2"
                                    onPress={() => setCurrentIndex(prev => prev + 1)}
                                >
                                    <ChevronRight size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}