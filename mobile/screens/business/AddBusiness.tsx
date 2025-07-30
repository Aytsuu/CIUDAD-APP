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

export default function AddBusiness() {
  const { toast } = useToastContext();
  const { control, trigger, getValues } = useBusinessFormContext();
  const { data: sitioList, isLoading: isLoadingSitio } = useGetSitio();
  const { mutateAsync: addBusiness } = useAddBusiness();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
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
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000);

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
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
    }
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
          <FormInput control={control} name="bus_name" label="Business Name"/>
          <FormInput control={control} name="bus_gross_sales" label="Business Gross Sales" keyboardType="phone-pad"/>
          <FormSelect control={control} name="sitio" label="Sitio" options={formattedSitio}/>
          <FormInput control={control} name="bus_street" label="Business Street Address"/>

          <MediaPicker
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            multiple={true}
          />

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
      />
    </PageLayout>
  )
}