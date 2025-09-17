import { View, Text } from "react-native";
import { useBusinessFormContext } from "@/contexts/BusinessFormContext";
import { useGetSitio } from "../_global_queries/Retrieve";
import React from "react";
import { formatSitio } from "@/helpers/formatSitio";
import { MediaItem } from "@/components/ui/media-picker";
import { Button } from "@/components/ui/button/button";
import { LoadingModal } from "@/components/ui/loading-modal";
import { useToastContext } from "@/components/ui/toast";
import { useAddBusiness } from "./queries/businessAddQueries";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import BusinessForm from "./BusinessForm";

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
        ...values,
        br: 5,
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
    <>
      <BusinessForm
        header="Add a Business"
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