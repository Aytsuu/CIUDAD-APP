import React from "react"
import _ScreenLayout from "@/screens/_ScreenLayout"
import { Text, View, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { IncidentReportSchema } from "@/form-schema/report-schema"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { FormTextArea } from "@/components/ui/form/form-text-area"
import { Button } from "@/components/ui/button"
import MediaPicker, { type MediaItem } from "@/components/ui/image-picker"
import { Input } from "@/components/ui/input"
import { useAddIncidentReport } from "../queries/reportAdd"
import { useGetReportType } from "../queries/reportFetch"
import { formatReportType } from "@/helpers/formatReportType"
import { useRouter } from "expo-router"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
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
  severity?: string
}

// Severity level options with colors
const SEVERITY_LEVELS = [
  { 
    value: "low", 
    label: "Low", 
    description: "Minor issues, no immediate danger",
    color: "#22C55E", // Green
  },
  { 
    value: "medium", 
    label: "Medium", 
    description: "Moderate concern, requires attention",
    color: "#F59E0B", // Amber
  },
  { 
    value: "high", 
    label: "High", 
    description: "Serious issue, needs urgent response",
    color: "#EF4444", // Red
  }
]

export default function IncidentReportForm() {
  // ================= STATE INITIALIZATION =================
  const router = useRouter()
  const { user } = useAuth();
  const { toast } = useToastContext()

  // Form state
  const [selectedImages, setSelectedImages] = React.useState<MediaItem[]>([])
  const [customIncidentType, setCustomIncidentType] = React.useState<string>("")
  const [severityLevel, setSeverityLevel] = React.useState<string>("")
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

  // ================= SIDE EFFECTS =================
  React.useEffect(() => {
    if (!isOtherTypeSelected) {
      setCustomIncidentType("")
      setFormErrors((prev) => ({ ...prev, otherType: undefined }))
    }
  }, [isOtherTypeSelected])

  React.useEffect(() => {
    if (selectedImages?.length > 0) {
      setFormErrors((prev) => ({ ...prev, media: undefined }))
    }
  }, [selectedImages])

  React.useEffect(() => {
    if (severityLevel) {
      setFormErrors((prev) => ({ ...prev, severity: undefined }))
    }
  }, [severityLevel])

  // ================= VALIDATION =================
  const validateCustomFields = (): FormErrors => {
    const errors: FormErrors = {}

    // Validate media requirement
    if (selectedImages?.length === 0) {
      errors.media = "Attach at least one image to support your report"
    }

    // Validate custom incident type
    if (isOtherTypeSelected && !customIncidentType.trim()) {
      errors.otherType = "Specify the type of incident"
    }

    // Validate severity level
    if (!severityLevel) {
      errors.severity = "Select a severity level"
    }

    return errors
  }

  const validateForm = async (): Promise<boolean> => {
    // Validate react-hook-form fields
    const isFormValid = await trigger(["ir_add_details", "ir_date", "ir_type", "ir_time", "ir_area"])

    // Validate custom fields
    const customErrors = validateCustomFields()
    setFormErrors(customErrors)

    return isFormValid && Object.keys(customErrors)?.length === 0
  }

  // ================= HANDLERS =================
  const handleSubmit = async () => {
    const isValid = await validateForm()
    if (!isValid) return

    try {
      setIsSubmitting(true)
      const formData = getValues()
      const { ir_time, ir_involved, ...restData } = formData

      const files = selectedImages?.map((media) => ({
        name: media.name,
        type: media.type,
        file: media.file,
      }))

      const submissionData: Record<string, any> = {
        ...restData,
        ir_involved: Number(ir_involved) || 0,
        ir_time,
        ir_severity: severityLevel,
        rp: user?.rp,
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
      setSeverityLevel("")
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
    router.back()
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

  const renderSeverityLevelSection = () => (
    <View className="mt-2 pt-4 border-t border-gray-200">
      <Text className="text-md font-medium text-gray-700 mb-2">Severity Level</Text>
      <Text className="text-sm text-gray-600 mb-4">
        Please select the severity level that best describes this incident
      </Text>
      
      <View className="space-y-3">
        {SEVERITY_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.value}
            onPress={() => setSeverityLevel(level.value)}
            className={`flex-row items-center p-4 rounded-lg `}
            accessibilityLabel={`Select ${level.label} severity`}
            accessibilityRole="radio"
            accessibilityState={{ selected: severityLevel === level.value }}
          >
            {/* Warning Icon with dynamic color */}
            <View className="mr-3">
              
            </View>

            {/* Content */}
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text 
                  className="text-base font-semibold"
                  style={{ 
                    color: severityLevel === level.value ? level.color : '#374151' 
                  }}
                >
                  {level.label}
                </Text>
              </View>
              <Text className="text-sm text-gray-600 mt-1">
                {level.description}
              </Text>
            </View>

            {/* Radio Button */}
            <View className="ml-3">
              <View 
                className={`
                  w-5 h-5 rounded-full border-2 items-center justify-center
                  ${severityLevel === level.value ? 'border-transparent' : 'border-gray-300'}
                `}
                style={{
                  backgroundColor: severityLevel === level.value ? level.color : 'transparent',
                  borderColor: severityLevel === level.value ? level.color : '#d1d5db'
                }}
              >
                {severityLevel === level.value && (
                  <View className="w-2 h-2 rounded-full bg-white" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Error message */}
      {formErrors.severity && (
        <View className="flex-row items-center mt-2">
          <AlertCircle size={16} className="text-red-500 mr-1" />
          <Text className="text-red-500 text-xs">{formErrors.severity}</Text>
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
        <Text className="text-sm text-gray-600 mb-6">Please attach photos to support your report (up to 5 photos)</Text>
        <MediaPicker
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
          limit={5}
        />
        {formErrors.media && (
          <View className="flex-row items-center mt-2">
            <AlertCircle size={16} className="text-red-500 mr-1" />
            <Text className="text-red-500 text-xs">{formErrors.media}</Text>
          </View>
        )}
        {selectedImages?.length > 0 && (
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
      <View className="flex-1 px-6 py-2">
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
            placeholder="Provide additional details (Mag bigay ng iba pang mga detalye)"
          />

          {/* Severity Level Section */}
          {renderSeverityLevelSection()}

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
      </View>
      <LoadingModal 
        visible={isSubmitting}
      />
    </PageLayout>
  )
}