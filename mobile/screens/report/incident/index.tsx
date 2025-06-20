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
import { Input } from "@/components/ui/input"
import { useAddIncidentReport } from "../queries/reportAdd"
import { useGetReportType } from "../queries/reportFetch"
import { formatReportType } from "@/helpers/formatReportType"
import { capitalizeAllFields } from "@/helpers/capitalize"

type IncidentReport = z.infer<typeof IncidentReportSchema>

export default () => {
  const defaultValues = generateDefaultValues(IncidentReportSchema);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [showMediaError, setShowMediaError] = React.useState<boolean>(false);
  const [addReportType, setAddReportType] = React.useState<string>('');
  const [isOtherType, setIsOtherType] = React.useState<boolean>(false);
  const { mutateAsync: addIncidentReport } = useAddIncidentReport();
  const { data: sitioList, isLoading: isLoadingSitioList } = useGetSitio();
  const { data: irReportType, isLoading: isLoadingIRReportType} = useGetReportType();
  const { control, trigger, getValues, watch } = useForm<IncidentReport>({
    resolver: zodResolver(IncidentReportSchema),
    defaultValues
  });

  const formattedSitio = React.useMemo(() => formatSitio(sitioList), [sitioList]);
  const formattedRT = React.useMemo(() => formatReportType(irReportType), [irReportType]);
  
  React.useEffect(() => {
    const type = watch('ir_type');
    if(type) {
      if(type === 'other') setIsOtherType(true);
      else setIsOtherType(false);
    } else {
      setIsOtherType(false);
    }

  }, [watch('ir_type')])

  const submit = async () => {
    const formIsValid = await trigger([
      'ir_add_details',
      'ir_street',
      'ir_type',
      'ir_sitio',
    ]);

    if (!selectedImage) {
      setShowMediaError(true);
      return;
    }

    if (!formIsValid) {
      console.log(formIsValid);
      return;
    }

    try {
      const values = getValues();
      addIncidentReport(capitalizeAllFields({
        ...values,
        'ir_other_type': addReportType,
        'rp': "00003250609",
      }), {
        onSuccess: () => {
          
        }
      })
    } catch (err) {
      throw err;
    }
    console.log(formIsValid);
  }

  if(isLoadingSitioList || isLoadingIRReportType) {
    return;
  }
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
            <FormSelect label="Type" control={control} name="ir_type" options={[
              ...formattedRT,
              {label: 'Other', value: 'other'}
            ]} />
            {isOtherType && 
              <View>
                <Input value={addReportType} onChangeText={(text) => setAddReportType(text)} />
              </View>
            }
            <FormSelect label="Sitio" control={control} name="ir_sitio" options={formattedSitio} />
            <FormInput label="Street" control={control} name="ir_street" />
            <FormTextArea 
              label="Additional Details" 
              control={control} 
              name="ir_add_details" 
            />
            <View className={`mt-8 border border-dashed ${showMediaError ? 'border-red-500' : 'border-gray-300'} p-5 rounded-lg bg-white flex-1 gap-7`}>
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