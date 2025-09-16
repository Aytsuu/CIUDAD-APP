import React from "react"
import _ScreenLayout from "@/screens/_ScreenLayout"
import { Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { IncidentReportSchema } from "@/form-schema/incident-report-schema"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { FormTextArea } from "@/components/ui/form/form-text-area"
import { Button } from "@/components/ui/button/button"
import MediaPicker, { type MediaItem } from "@/components/ui/media-picker"
import { Input } from "@/components/ui/input"
import { useAddIncidentReport } from "../queries/reportAdd"
import { useGetReportType } from "../queries/reportFetch"
import { formatReportType } from "@/helpers/formatReportType"
import { useRouter } from "expo-router"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { CheckCircle } from "@/lib/icons/CheckCircle"
import { AlertCircle } from "@/lib/icons/AlertCircle"
import PageLayout from "@/screens/_PageLayout"
import { FormDateTimeInput } from "@/components/ui/form/form-date-or-time-input"
import { useToastContext } from "@/components/ui/toast"
import axios from "axios"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingState } from "@/components/ui/loading-state"
import { LoadingModal } from "@/components/ui/loading-modal"
import { SubmitButton } from "@/components/ui/button/submit-button"

type IncidentReport = z.infer<typeof IncidentReportSchema>

interface FormErrors {
  media?: string
  otherType?: string
}

export default function IncidentReportForm() {
  // ================= HOOKS & STATE =================
  const router = useRouter()
  const { user } = useAuth();
  const { toast } = useToastContext()

  // Form state
  const [selectedImages, setSelectedImages] = React.useState<MediaItem[]>([])
  const [customIncidentType, setCustomIncidentType] = React.useState<string>("")
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [formErrors, setFormErrors] = React.useState<FormErrors>({})

  // API hooks
  const { mutateAsync: addIncidentReport } = useAddIncidentReport()
  const { data: reportTypes, isLoading: isLoadingReportTypes, error: reportTypeError } = useGetReportType()

  // Form configuration
  const form = useForm<IncidentReport>({
    resolver: zodResolver(IncidentReportSchema),
    defaultValues: generateDefaultValues(IncidentReportSchema)
  })

  const {
    control,
    trigger,
    getValues,
    watch,
    reset
  } = form

  // ================= COMPUTED VALUES =================
  const formattedReportTypes = React.useMemo(() => formatReportType(reportTypes), [reportTypes])

  const selectedIncidentType = watch("ir_type")
  const isOtherTypeSelected = selectedIncidentType === "other"

  const hasUnsavedChanges = React.useMemo(() => {
    const values = getValues()
    return (
      Object.values(values).some((value) => value !== "" && value !== undefined && value !== null) ||
      selectedImages.length > 0
    )
  }, [getValues, selectedImages])

  // ================= EFFECTS =================
  React.useEffect(() => {
    if (!isOtherTypeSelected) {
      setCustomIncidentType("")
      setFormErrors((prev) => ({ ...prev, otherType: undefined }))
    }
  }, [isOtherTypeSelected])

  React.useEffect(() => {
    if (selectedImages.length > 0) {
      setFormErrors((prev) => ({ ...prev, media: undefined }))
    }
  }, [selectedImages])

  // ================= VALIDATION =================
  const validateCustomFields = (): FormErrors => {
    const errors: FormErrors = {}

    // Validate media requirement
    if (selectedImages.length === 0) {
      errors.media = "Please attach at least one image to support your report"
    }

    // Validate custom incident type
    if (isOtherTypeSelected && !customIncidentType.trim()) {
      errors.otherType = "Please specify the type of incident"
    }

    return errors
  }

  const validateForm = async (): Promise<boolean> => {
    // Validate react-hook-form fields
    const isFormValid = await trigger(["ir_add_details", "ir_date", "ir_type", "ir_time", "ir_area"])

    // Validate custom fields
    const customErrors = validateCustomFields()
    setFormErrors(customErrors)

    return isFormValid && Object.keys(customErrors).length === 0
  }

  // ================= HANDLERS =================
  const handleSubmit = async () => {
    const isValid = await validateForm()
    if (!isValid) return

    try {
      setIsSubmitting(true)
      const formData = getValues()
      const { ir_time, ir_involved, ...restData } = formData

      const files = selectedImages.map((media) => ({
        name: media.name,
        type: media.type,
        file: media.file,
      }))

      const submissionData: Record<string, any> = {
        ...restData,
        ir_involved: Number(ir_involved) || 0,
        ir_time,
        rp: user?.resident?.rp_id,
        files,
      }

      // Add custom incident type if specified
      if (customIncidentType.trim()) {
        submissionData.ir_other_type = customIncidentType.trim()
      }

      await addIncidentReport(submissionData)

      toast.success("Report submitted successfully")
      reset()
      setSelectedImages([])
    } catch (error) {
      console.error("Submission error:", error)

      let errorMessage = "Failed to submit report. Please try again."

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data
        if (responseData?.message) {
          errorMessage = responseData.message
        }
        console.error("API Error:", responseData)
      }

      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert("Unsaved Changes", "You have unsaved changes. Are you sure you want to go back?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard Changes",
          style: "destructive",
          onPress: () => router.back(),
        },
      ])
    } else {
      router.back()
    }
  }

  // ================= RENDER HELPERS =================
  const renderErrorState = () => (
    <PageLayout>
      <View className="flex-1 justify-center items-center px-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">Unable to Load Form</Text>
        <Text className="text-gray-600 text-center mb-6">
          There was an error loading the form data. Please check your connection and try again.
        </Text>
        <Button onPress={handleGoBack} className="bg-gray-600">
          <Text className="text-white font-medium">Go Back</Text>
        </Button>
      </View>
    </PageLayout>
  )

  const renderCustomIncidentTypeInput = () => (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-2">Specify Incident Type</Text>
      <Input
        value={customIncidentType}
        onChangeText={setCustomIncidentType}
        placeholder="Enter the type of incident"
        className={`${formErrors.otherType ? "border-red-500" : "border-gray-300"}`}
        accessibilityLabel="Custom incident type"
        accessibilityHint="Enter a custom incident type when 'Other' is selected"
      />
      {formErrors.otherType && (
        <View className="flex-row items-center mt-1">
          <AlertCircle size={14} className="text-red-500 mr-1" />
          <Text className="text-red-500 text-xs">{formErrors.otherType}</Text>
        </View>
      )}
    </View>
  )

  const renderMediaUploadSection = () => (
    <View className="mt-2 pt-4 border-t border-gray-200">
      <Text className="text-md font-medium text-gray-700 mb-2">Supporting Evidence</Text>
      <View
        className={`rounded-lg bg-white"
        }`}
      >
        <Text className="text-sm text-gray-600 mb-3">Please attach photos to support your report (up to 5 photos)</Text>
        <MediaPicker
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
          multiple={true}
          maxImages={5}
        />
        {formErrors.media && (
          <View className="flex-row items-center mt-2">
            <AlertCircle size={16} className="text-red-500 mr-1" />
            <Text className="text-red-500 text-xs">{formErrors.media}</Text>
          </View>
        )}
        {selectedImages.length > 0 && (
          <Text className="text-xs text-gray-500 mt-2">
            {selectedImages.length} image{selectedImages.length !== 1 ? "s" : ""} selected
          </Text>
        )}
      </View>
    </View>
  )

  // ================= MAIN RENDER =================
  if (isLoadingReportTypes) {
    return (
      <LoadingState/>
    )
  }
  if (reportTypeError) return renderErrorState()

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={handleGoBack}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-black text-[13px]">Report an Incident</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView
        className="flex-1 px-6 py-2"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
      >
        {/* Form Fields */}
        <View className="flex-1 gap-2">
          {/* Incident Type Selection */}
          <FormSelect
            label="Incident Type"
            control={control}
            name="ir_type"
            options={[...formattedReportTypes, { label: "Other (specify below)", value: "other" }]}
          />

          {/* Custom Incident Type Input */}
          {isOtherTypeSelected && renderCustomIncidentTypeInput()}

          {/* Date and Time */}
          <View className="flex-row gap-4 border-y border-gray-200 py-3 mb-3 mt-2">
            <View className="flex-1">
              <FormDateTimeInput control={control} name="ir_date" label="Date" type="date" maximumDate={new Date(Date.now())}/>
            </View>
            <View className="flex-1">
              <FormDateTimeInput control={control} name="ir_time" label="Time" type="time" restrictToCurrentAndPast={true}/>
            </View>
          </View>

          {/* Number of People Involved */}
          <FormInput
            control={control}
            name="ir_involved"
            label="Involved (optional)"
            placeholder="0"
            keyboardType="numeric"
          />

          {/* Location */}
          <FormInput
            label="Incident Location"
            control={control}
            name="ir_area"
            placeholder="Enter the exact location"
          />

          {/* Additional Details */}
          <FormTextArea
            label="Additional Details"
            control={control}
            name="ir_add_details"
            placeholder="Provide additional details (Mag bigay nang iba pang mga detalye)"
          />

          {/* Media Upload */}
          {renderMediaUploadSection()}
        </View>

        {/* Submit Section */}
        <View className="pt-6 pb-8 mt-6">
          <SubmitButton 
            buttonLabel="Submit Report"
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
          />

          <Text className="text-xs text-gray-500 text-center mt-3">
            Your report will be reviewed by our team within 24 hours
          </Text>
        </View>
      </ScrollView>
      <LoadingModal 
        visible={isSubmitting}
      />
    </PageLayout>
  )
}