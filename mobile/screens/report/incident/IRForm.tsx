import React from "react"
import _ScreenLayout from "@/screens/_ScreenLayout"
import { Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { IncidentReportSchema } from "@/form-schema/incident-report-schema"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { FormTextArea } from "@/components/ui/form/form-text-area"
import { Button } from "@/components/ui/button"
import MediaPicker, { MediaItem } from "@/components/ui/media-picker"
import { useGetSitio } from "@/screens/_global_queries/Retrieve"
import { formatSitio } from "@/helpers/formatSitio"
import { Input } from "@/components/ui/input"
import { useAddIncidentReport } from "../queries/reportAdd"
import { useGetReportType } from "../queries/reportFetch"
import { formatReportType } from "@/helpers/formatReportType"
import { capitalize, capitalizeAllFields } from "@/helpers/capitalize"
import { useRouter } from "expo-router"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { X } from "@/lib/icons/X"
import { CheckCircle } from "@/lib/icons/CheckCircle"
import { AlertCircle } from "@/lib/icons/AlertCircle"
import { useAuth } from "@/contexts/AuthContext"

type IncidentReport = z.infer<typeof IncidentReportSchema>

export default function IRForm() {
  const router = useRouter()
  const { user } = useAuth();
  const defaultValues = generateDefaultValues(IncidentReportSchema)
  
  // Form state
  const [selectedImages, setSelectedImages] = React.useState<MediaItem[]>([])
  const [addReportType, setAddReportType] = React.useState<string>('')
  const [isOtherType, setIsOtherType] = React.useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({})

  // API hooks
  const { mutateAsync: addIncidentReport } = useAddIncidentReport()
  const { data: sitioList, isLoading: isLoadingSitioList, error: sitioError } = useGetSitio()
  const { data: irReportType, isLoading: isLoadingIRReportType, error: reportTypeError } = useGetReportType()

  // Form setup
  const { control, trigger, getValues, watch } = useForm<IncidentReport>({
    resolver: zodResolver(IncidentReportSchema),
    defaultValues,
  })

  const formattedSitio = React.useMemo(() => formatSitio(sitioList), [sitioList])
  const formattedRT = React.useMemo(() => formatReportType(irReportType), [irReportType])

  // Watch for report type changes
  React.useEffect(() => {
    const type = watch('ir_type')
    setIsOtherType(type === 'other')
    if (type !== 'other') {
      setAddReportType('')
    }
  }, [watch('ir_type')])

  // Clear media error when image is selected
  React.useEffect(() => {
    if (selectedImages.length > 0) {
      setFormErrors(prev => ({ ...prev, media: '' }))
    }
  }, [selectedImages])

  const validateForm = async () => {
    const errors: Record<string, string> = {}
    
    // Validate required fields
    const formIsValid = await trigger([
      'ir_add_details',
      'ir_street',
      'ir_type',
      'ir_sitio',
    ])

    // Validate media
    if (selectedImages.length === 0) {
      errors.media = "Please attach an image to support your report"
    }

    // Validate other type input
    if (isOtherType && !addReportType.trim()) {
      errors.otherType = "Please specify the type of incident"
    }

    setFormErrors(errors)
    return formIsValid && Object.keys(errors).length === 0
  }

  const submit = async () => {
    const isFormValid = await validateForm()

    if (!isFormValid) {
      return
    }
    
    try {
      setIsSubmitting(true)
      const values = getValues()

      const files = selectedImages.map((media: any) => ({
        name: media.name,
        type: media.type,
        file: media.file
      }))
      
      await addIncidentReport({
        ...capitalizeAllFields(values),
        'ir_other_type': capitalize(addReportType),
        'rp': user?.staff?.staff_id,
        'files': files
      })

      setIsSubmitting(false)
    } catch (error) {
      setIsSubmitting(false)
      console.error('Submission error:', error)
    }
  }

  const handleGoBack = () => {
    const hasUnsavedChanges = Object.values(getValues()).some(value => 
      value !== '' && value !== undefined && value !== null
    ) || selectedImages.length > 0

    if (hasUnsavedChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go Back", style: "destructive", onPress: () => router.back() }
        ]
      )
    } else {
      router.back()
    }
  }

  // Loading state
  if (isLoadingSitioList || isLoadingIRReportType) {
    return (
      <_ScreenLayout
        showBackButton={false}
        showExitButton={false}
      >
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </_ScreenLayout>
    )
  }

  // Error state
  if (sitioError || reportTypeError) {
    return (
      <_ScreenLayout
        showBackButton={false}
        showExitButton={false}
      >
        <View className="flex-1 justify-center items-center px-6">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <Text className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Form</Text>
          <Text className="text-gray-600 text-center mb-6">
            There was an error loading the form data. Please check your connection and try again.
          </Text>
          <Button onPress={() => router.back()} className="bg-gray-600">
            <Text className="text-white">Go Back</Text>
          </Button>
        </View>
      </_ScreenLayout>
    )
  }

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Incident Report</Text>}
      customRightAction={<View className="w-10 h-10"/>}
    >
      <View className="flex-1 px-5 py-4">
        <View>
          {/* Form fields */}
          <View className="space-y-4">
            <FormSelect 
              label="Incident Type" 
              control={control} 
              name="ir_type" 
              options={[
                ...formattedRT,
                { label: 'Other (specify below)', value: 'other' }
              ]}/>

            {isOtherType && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Specify Incident Type
                </Text>
                <Input 
                  value={addReportType} 
                  onChangeText={setAddReportType}
                  placeholder="Enter the type of incident"
                  className={`${formErrors.otherType ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.otherType && (
                  <Text className="text-red-500 text-xs mt-1">{formErrors.otherType}</Text>
                )}
              </View>
            )}

            <FormSelect 
              label="Sitio" 
              control={control} 
              name="ir_sitio" 
              options={formattedSitio}
            />

            <FormInput 
              label="Street Address" 
              control={control} 
              name="ir_street"
              placeholder="Enter the street address"/>

            <FormTextArea 
              label="Additional Details" 
              control={control} 
              name="ir_add_details"
              placeholder="Provide detailed information about the incident..."
            />

            {/* Media upload section */}
            <View className="mt-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Supporting Evidence
              </Text>
              <View className={`border border-dashed rounded-lg p-4 ${
                formErrors.media ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
              }`}>
                <Text className="text-sm text-gray-600 mb-3">
                  Please attach a photo to support your report
                </Text>
                <MediaPicker
                  selectedImages={selectedImages}
                  setSelectedImages={setSelectedImages}
                />
                {formErrors.media && (
                  <View className="flex-row items-center mt-2">
                    <AlertCircle size={16} className="text-red-500 mr-1" />
                    <Text className="text-red-500 text-xs">{formErrors.media}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
        <View className="pt-4 pb-8 bg-white border-t border-gray-100 mb-6 mt-4">
        <Button 
          onPress={submit} 
          className='min-h-[56px] bg-blue-600 flex-row items-center justify-center'
        >
          <CheckCircle size={20} className="text-white mr-2" />
          <Text className="text-white text-base font-semibold">Submit Report</Text>
        </Button>
        
        <Text className="text-xs text-gray-500 text-center mt-2 font-PoppinsRegular">
          Your report will be reviewed by our team
        </Text>
      </View>
      </View>
    </_ScreenLayout>
  )
}