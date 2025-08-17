import { SafeAreaView, View, ActivityIndicator, Text, Pressable, Image, Modal, TouchableOpacity, ScrollView, Linking, Alert } from "react-native";
import { useGetBudgetPlanSuppDoc, type BudgetPlanSuppDoc } from "./queries/budgetPlanFetchQueries";
import { ChevronLeft, ChevronRight, X, Paperclip, FileText, Plus } from "lucide-react-native";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "expo-router";

export default function BudgetPlanSuppDocs({ plan_id }: { plan_id: string }) {
    const router = useRouter();
    const { data: suppDocs = [], isLoading } = useGetBudgetPlanSuppDoc(plan_id);
    const [viewImagesModalVisible, setViewImagesModalVisible] = useState(false);
    const [selectedImages, setSelectedImages] = useState<{bpf_url: string, bpf_name: string}[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleFileOpen = async (url: string) => {
        if (!url) {
            Alert.alert("Error", "No file available");
            return;
        }
        Linking.openURL(url).catch(() =>
            Alert.alert('Cannot Open File', 'Please make sure you have an appropriate app installed.')
        );
    };

    const handleViewImages = (images: BudgetPlanSuppDoc[], index = 0) => {
        const formattedImages = images.map(img => ({
            bpf_url: img.bpf_url,
            bpf_name: img.bpf_name
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

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#2a3a61" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white p-4 border-b border-gray-200">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <Paperclip size={20} color="gray" />
                        <Text className="text-lg font-semibold text-gray-800">
                            Supporting Documents ({suppDocs.length})
                        </Text>
                    </View>
                    <Button 
                        onPress={handleAddDocument}
                        className="bg-primaryBlue px-3 py-2 rounded-lg flex-row items-center"
                    >
                        <Plus size={16} color="white" />
                        <Text className="text-white ml-1">Add</Text>
                    </Button>
                </View>
            </View>

            {/* Scrollable content */}
            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {suppDocs.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <Text className="text-gray-500">No supporting documents found</Text>
                    </View>
                ) : (
                    <View className='pb-3'>
                        {suppDocs.map((doc, index) => {
                            const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(doc.bpf_name);
                            
                            return (
                                <Pressable 
                                    key={doc.bpf_id} 
                                    onPress={() => isImage ? 
                                        handleViewImages(suppDocs, index) : 
                                        handleFileOpen(doc.bpf_url)}
                                    className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50"
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center flex-1">
                                            <FileText size={20} color="gray" />
                                            <View className="ml-3 flex-1">
                                                <Text className="text-gray-800 font-medium text-base" numberOfLines={2}>
                                                    {doc.bpf_name}
                                                </Text>
                                                <Text className="text-gray-500 text-sm mt-1">
                                                    Uploaded: {doc.bpf_upload_date}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-blue-600 text-sm font-medium">View</Text>
                                    </View>
                                    
                                    {isImage && (
                                        <View className="mt-3">
                                            <Image 
                                                source={{ uri: doc.bpf_url }}
                                                className="w-full h-48 rounded-lg"
                                                resizeMode="cover"
                                            />
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })}
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
                            {selectedImages[currentIndex]?.bpf_name || 'Document'}
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
                            source={{ uri: selectedImages[currentIndex]?.bpf_url }}
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
        </SafeAreaView>
    );
}