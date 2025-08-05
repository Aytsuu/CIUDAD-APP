import { ScrollView, TouchableOpacity, View, Text } from "react-native";
import PageLayout from "../_PageLayout";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { router } from "expo-router";
import { useBusinessFormContext } from "@/contexts/BusinessFormContext";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { useGetSitio } from "../_global_queries/Retrieve";
import React from "react";
import { formatSitio } from "@/helpers/formatSitio";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import { Button } from "@/components/ui/button";
import { LoadingModal } from "@/components/ui/loading-modal";
import { useToastContext } from "@/components/ui/toast";
import { useAddBusiness } from "./queries/businessAddQueries";
import { FeedbackScreen } from "@/components/ui/feedback-screen";

export default function AddBusiness() {
  const { toast } = useToastContext();
  const { control, trigger, getValues, reset } = useBusinessFormContext();
  const { data: sitioList, isLoading: isLoadingSitio } = useGetSitio();
  const { mutateAsync: addBusiness } = useAddBusiness();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [showFeedback, setShowFeedback] = React.useState<boolean>(false); 
  const [status, setStatus] = React.useState<"success" | "failure" | "waiting" | "message">("success");
  const [selectedImages, setSelectedImages] = React.useState<MediaItem[]>([])
  const formattedSitio = React.useMemo(() => formatSitio(sitioList), [sitioList]);

  const submit = async () => {
    setIsSubmitting(true);
    const formIsValid = await trigger(['bus_gross_sales', 'bus_name', 'bus_street', 'sitio']);
    if(!formIsValid) {
      setIsSubmitting(false);
      return;
    };
    if(selectedImages.length === 0) {
      setIsSubmitting(false);
      toast.error('Please submit a supporting document of your business.');
      return;
    }
    try {
      const values = getValues();
      await addBusiness({
        data: {
          ...values,
          br: 5,
          files: selectedImages.map((img: any) => ({
            name: img.name,
            type: img.type,
            file: img.file
          }))
        },
      });

      setIsSubmitting(false);
      setStatus('success')
      setShowFeedback(true)
    } catch (err) {
      setIsSubmitting(false);
      setStatus('failure')
      setShowFeedback(true)
    }
  }

  const FeedbackContents: any = {
    success: {
      title: (
        <View className="flex">
          <Text className={`text-[18px] text-gray-800 font-PoppinsSemiBold text-center`}>
            Submitted Successfully
          </Text>
          <Text className={`text-[15px] text-gray-800 font-PoppinsRegular text-center`}>
            Your request has been delivered!
          </Text>
        </View>
      ),
      content: (
        <View className="flex-1 justify-end">
          <Button className={`bg-primaryBlue rounded-xl native:h-[45px]`}
            onPress={() => {
              setSelectedImages([]);
              reset();
              setShowFeedback(false)
            }}
          >
            <Text className="text-white text-base font-semibold">
              Ok, continue
            </Text>
          </Button>
        </View>
      )
    },
    failure: {
      content: (
        <View className="flex-1 justify-end">
          <View>
            <Button variant={"outline"} className={`rounded-xl native:h-[45px]`}
            >
              <Text className="text-white text-base font-semibold">
                Cancel
              </Text>
            </Button>
            <Button className={`bg-primaryBlue rounded-xl native:h-[45px]`}
              onPress={() => {
                setShowFeedback(false)
                setTimeout(() => {
                  submit();
                }, 0)
              }}
            >
              <Text className="text-white text-base font-semibold">
                Try Again
              </Text>
            </Button>
          </View>
        </View>
      )
    },
  }

  if(showFeedback) {
    return (
      <FeedbackScreen 
        status={status}
        title={FeedbackContents[status].title}
        content={FeedbackContents[status].content}
      />
    )
  }

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Add a Business</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-5">
          {/* Form Section Header */}
          <View className="mb-6">
            <Text className="text-sm font-PoppinsMedium text-gray-900">
              Please provide accurate information about your business
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-4">
            <FormInput control={control} name="bus_name" label="Business Name" placeholder="Enter your business name" returnKeyType="next" />
            <FormInput control={control} name="bus_gross_sales" label="Business Gross Sales (₱)" placeholder="0.00" keyboardType="numeric" returnKeyType="next"/>
            <FormSelect control={control} name="sitio" label="Sitio" options={formattedSitio} placeholder="Select your sitio" disabled={isLoadingSitio} />
            <FormInput  control={control}  name="bus_street"  label="Business Street Address" placeholder="Enter complete street address" returnKeyType="done"/>
          </View>

          {/* Document Upload Section */}
          <View className="mt-8 mb-6">
            <View className="mb-4">
              <Text className="text-base font-PoppinsSemiBold text-gray-900 mb-1">
                Supporting Documents *
              </Text>
              <Text className="text-sm font-PoppinsRegular text-gray-600">
                Upload  your business permit and DTI registration
              </Text>
            </View>
            
            <MediaPicker
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              multiple={true}
              maxImages={5}
            />
            
            {selectedImages.length < 2 && (
              <Text className="text-red-500 text-xs font-PoppinsRegular mt-2">
                At least two supporting document is required
              </Text>
            )}
          </View>

          <View className="pt-4 pb-8 bg-white border-t border-gray-100">
            <Button onPress={submit} className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg">
              <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
            </Button>
    
            <Text className="text-center text-xs text-gray-500 font-PoppinsRegular mt-3">
              All information will be kept secure and confidential
            </Text>
          </View>
        </View>
      </ScrollView>
      <LoadingModal
        visible={isSubmitting}
        message="Submitting business registration..."
      />
    </PageLayout>
  )
}