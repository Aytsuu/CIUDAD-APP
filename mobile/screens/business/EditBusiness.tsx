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
      const fields = [
        {key: 'bus_name', val: business.bus_name},
        {key: 'bus_gross_sales', val: business.bus_gross_sales},
        {key: 'bus_location', val: business.bus_location},
      ]

      fields.map((f: any) => 
        setValue(f.key, String(f.val))
      )
    }
  }, [business])

  // ----------------------- HANDLERS -------------------------
  const submit = async () => {
    const formIsValid = await trigger(['bus_gross_sales', 'bus_name', 'bus_location']);

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
        bus_location: business.bus_location
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
        bm_updated_loc: values.bus_location,
        bus: business.bus_id,
        files: selectedImages.map((img: any) => ({
          name: img.name,
          type: img.type,
          file: img.file
        }))
      });

      router.back();
    } catch (err) {
      toast.error("Failed to submit request. Please try again.")
    } finally {
      setIsSubmitting(false);
    }
  }

  // ----------------------- RENDER -------------------------
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
      <LoadingModal visible={isSubmitting}/>
    </>
  )
}