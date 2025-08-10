import { View, Text } from "react-native";
import { useBusinessFormContext } from "@/contexts/BusinessFormContext";
import { useGetSitio } from "../_global_queries/Retrieve";
import React from "react";
import { formatSitio } from "@/helpers/formatSitio";
import { MediaItem } from "@/components/ui/media-picker";
import { Button } from "@/components/ui/button";
import { LoadingModal } from "@/components/ui/loading-modal";
import { useToastContext } from "@/components/ui/toast";
import { useAddBusinessModification } from "./queries/businessAddQueries";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import BusinessForm from "./BusinessForm";
import { router, useLocalSearchParams } from "expo-router";
import isEqual from 'lodash.isequal'

export default function EditBusiness() {
  // ----------------------- STATE INITIALIZATION -------------------------
  const params = useLocalSearchParams()
  const { toast } = useToastContext();
  const { control, trigger, getValues, setValue } = useBusinessFormContext();
  const { data: sitioList } = useGetSitio();
  const { mutateAsync: addBusinessModification } = useAddBusinessModification();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [showFeedback, setShowFeedback] = React.useState<boolean>(false); 
  const [status, setStatus] = React.useState<"success" | "failure" | "waiting" | "message">("success");
  const [selectedImages, setSelectedImages] = React.useState<MediaItem[]>([])
  const formattedSitio = React.useMemo(() => formatSitio(sitioList), [sitioList]);

  const business = React.useMemo(() => {
    try {
      return JSON.parse(params.business as string)
    } catch (error) {
      console.error("Error parsing business data:", error)
      return null
    } 
  }, [params.business])

  // ----------------------- SIDE EFFECTS -------------------------
  React.useEffect(() => {
    if(business) {
      setSelectedImages(business.files?.map((files: any) => {
        return {
          'id': files.bf_id,
          'name': files.bf_name,
          'type': files.bf_type
        }
      }) || [])

      const fields = [
        {key: 'bus_name', val: business.bus_name},
        {key: 'bus_gross_sales', val: business.bus_gross_sales},
        {key: 'sitio', val: business.sitio.toLowerCase()},
        {key: 'bus_street', val: business.bus_street},
      ]

      fields.map((f: any) => 
        setValue(f.key, String(f.val))
      )
    }
  }, [business])

  // ----------------------- HANDLERS -------------------------
  const submit = async () => {
    const formIsValid = await trigger(['bus_gross_sales', 'bus_name', 'bus_street', 'sitio']);

    if(!formIsValid) {
      return;
    };

    if(selectedImages.length === 0) {
      toast.error('Please submit a supporting document of your business.');
      return;
    }
    try {
      const initialVals = {
        bus_name: business.bus_name,
        bus_gross_sales: String(business.bus_gross_sales),
        sitio: business.sitio.toLowerCase(),
        bus_street: business.bus_street
      }
      const values = getValues();

      if(isEqual(values, initialVals)) {
        toast.info('No changes made')
        return;
      }
   
      setIsSubmitting(true);
      await addBusinessModification({
        bm_updated_name: values.bus_name,
        bm_updated_gs: values.bus_gross_sales,
        sitio: values.sitio,
        street: values.bus_street,
        bus: business.bus_id,
        files: selectedImages.map((img: any) => ({
          name: img.name,
          type: img.type,
          file: img.file
        }))
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

  // ----------------------- RENDER -------------------------
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
          <View className="flex-row gap-2">
            <Button variant={"outline"} className={`rounded-xl native:h-[45px]`}
              onPress={() => router.replace('/(auth)')}
            >
              <Text className="text-gray-900 text-base font-semibold">
                Cancel
              </Text>
            </Button>
            <Button className={`flex-1 bg-primaryBlue rounded-xl native:h-[45px]`}
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
    <>
      <BusinessForm
        header="Edit a Business"
        control={control}
        formattedSitio={formattedSitio}
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
        submit={submit}
      />
      <LoadingModal
        visible={isSubmitting}
        message="Submitting business registration..."
      />
    </>
  )
}