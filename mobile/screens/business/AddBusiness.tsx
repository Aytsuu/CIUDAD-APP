import { useBusinessFormContext } from "@/contexts/BusinessFormContext";
import React from "react";
import { MediaItem } from "@/components/ui/media-picker";
import { LoadingModal } from "@/components/ui/loading-modal";
import { useToastContext } from "@/components/ui/toast";
import { useAddBusiness } from "./queries/businessAddQueries";
import BusinessForm from "./BusinessForm";
import { useAuth } from "@/contexts/AuthContext";

export default function AddBusiness() {
  const { toast } = useToastContext();
  const { user } = useAuth();
  const { control, trigger, getValues, reset } = useBusinessFormContext();
  const { mutateAsync: addBusiness } = useAddBusiness();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [selectedImages, setSelectedImages] = React.useState<MediaItem[]>([])

  const submit = async () => {
    setIsSubmitting(true);
    const formIsValid = await trigger(['bus_gross_sales', 'bus_name', 'bus_location']);
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
        ...(user?.rp ? { rp: user?.rp } : { br: user?.br }),
        create_files: selectedImages.map((img: any) => ({
          name: img.name,
          type: img.type,
          file: img.file
        }))
      });

     toast.success("Your request has been delivered.")
     reset();
     setSelectedImages([])
    } catch (err) {
      toast.error("Failed to register. Please try again.")
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <BusinessForm
        header="Add a Business"
        control={control}
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
        submit={submit}
      />
      <LoadingModal visible={isSubmitting}/>
    </>
  )
}