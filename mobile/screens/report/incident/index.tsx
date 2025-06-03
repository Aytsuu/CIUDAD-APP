import React from "react"
import _ScreenLayout from "@/screens/_ScreenLayout"
import { ScrollView, Text, View, KeyboardAvoidingView, Platform } from "react-native"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { IncidentReportSchema } from "@/form-schema/incident-report-schema"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { FormTextArea } from "@/components/ui/form/form-text-area"
import { FormTimeInput } from "@/components/ui/form/form-time-input"
import { Button } from "@/components/ui/button"
import MediaPicker from "@/components/ui/media-picker";
import { useGetSitio } from "@/screens/_global_queries/Retrieve"
import { formatSitio } from "@/helpers/formatSitio"

type IncidentReport = z.infer<typeof IncidentReportSchema>

export default () => {
  const defaultValues = generateDefaultValues(IncidentReportSchema);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const { data: sitioList, isLoading } = useGetSitio();
  const { control, trigger, getValues } = useForm<IncidentReport>({
    resolver: zodResolver(IncidentReportSchema),
    defaultValues
  });

  const formattedSitio = React.useMemo(() => formatSitio(sitioList), [sitioList]);

  const submit = async () => {
    const formIsValid = await trigger([
      'ir_add_details',
      'ir_street',
      'ir_time',
      'ir_type',
      'sitio',
    ]);

    if (!formIsValid) {
      console.log(formIsValid);
      return;
    }

    try {
      const values = getValues();
      console.log(values)
    } catch (err) {
      throw err;
    }
    console.log(formIsValid);
  }

  if(isLoading) return;

  return (
    <_ScreenLayout
      header={'Incident Report'}
      description={''}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
          >
            <FormSelect label="Type" control={control} name="ir_type" options={[]} />
            <FormSelect label="Sitio" control={control} name="sitio" options={formattedSitio} />
            <FormInput label="Street" control={control} name="ir_street" />
            <FormTimeInput label="Time " control={control} name='ir_time' mode="12h" />
            <FormTextArea 
              label="Additional Details" 
              control={control} 
              name="ir_add_details" 
            />
            <View className="mt-8 border border-dashed border-gray-300 p-5 rounded-lg bg-white flex-1 gap-7">
              <Text>Please provide an image to support your report</Text>
              <MediaPicker 
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
              />
            </View>
          </ScrollView>
          <View className="absolute left-0 right-0 bottom-0 bg-white p-4">
            <Button onPress={submit} className="min-h-[56px] bg-primaryBlue">
              <Text className="text-white text-center text-base font-semibold">Submit</Text>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </_ScreenLayout>
  )
}