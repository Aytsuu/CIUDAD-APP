import React from "react"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import BusinessProfileForm from "./BusinessProfileForm"
import { Card, CardContent, CardHeader } from "@/components/ui/card/card"
import { useLocation } from "react-router"
import { formatResidents, formatSitio } from "../profilingFormats"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { businessFormSchema } from "@/form-schema/profiling-schema"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import {
  FileText,
  MapPin,
  User,
  Database,
  Store,
} from "lucide-react"
import { Form } from "@/components/ui/form/form"
import { Type } from "../profilingEnums"
import { useAuth } from "@/context/AuthContext"
import { useAddBusiness } from "../queries/profilingAddQueries"
import type { MediaUploadType } from "@/components/ui/media-upload"
import { useResidentsList, useSitioList } from "../queries/profilingFetchQueries"
import { useLoading } from "@/context/LoadingContext"
import { useInstantFileUpload } from "@/hooks/use-file-upload"
import { useUpdateBusiness } from "../queries/profilingUpdateQueries"
import { capitalize } from "@/helpers/capitalize"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { showErrorToast, showSuccessToast } from "@/components/ui/toast"

export default function BusinessFormLayout({ tab_params }: { tab_params?: Record<string, any> }) {
  // --------------------- STATE INITIALIZATION -----------------------
  const location = useLocation()
  const params = React.useMemo(() => location.state?.params || {}, [location.state])

  const { user } = useAuth()
  const { showLoading, hideLoading } = useLoading()

  const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>([]);
  const { deleteFile } = useInstantFileUpload({ mediaFiles });
  const [activeVideoId, setActiveVideoId] = React.useState<string>("")
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false)
  const [formType, setFormType] = React.useState<Type>(params.type)

  const form = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: generateDefaultValues(businessFormSchema),
  })

  const { mutateAsync: addBusiness } = useAddBusiness()
  const { mutateAsync: updateBusiness } = useUpdateBusiness()
  const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList();
  const { data: sitioList, isLoading: isLoadingSitio } = useSitioList()
  const formattedSitio = React.useMemo(() => formatSitio(sitioList) || [], [sitioList])
  const formattedResidents = React.useMemo(() =>
        formatResidents(residentsList) || [],
      [residentsList]
    );
  

  // --------------------- SIDE EFFECTS -----------------------
  React.useEffect(() => {
    if (isLoadingSitio || isLoadingResidents) showLoading()
    else hideLoading()
  }, [isLoadingSitio, isLoadingResidents, showLoading, hideLoading])

  React.useEffect(() => {
    if (formType === Type.Viewing) {
      setIsReadOnly(true)
      populateFields()
      setMediaFiles(params?.business?.files)
    } else {
      setIsReadOnly(false)
    }
  }, [formType])

  React.useEffect(() => {
    if (params?.business?.files) {
      setMediaFiles(params?.business?.files)
    }
  }, [params?.business?.files])

  // --------------------- HANDLERS -----------------------
  const populateFields = React.useCallback(() => {
    const businessInfo = params.business
    if (!businessInfo) return

    const fields = [
      { key: "bus_name", value: businessInfo.bus_name },
      { key: "bus_gross_sales", value: String(businessInfo.bus_gross_sales) },
      { key: "bus_province", value: businessInfo.bus_province },
      { key: "bus_city", value: businessInfo.bus_city },
      { key: "bus_barangay", value: businessInfo.bus_barangay },
      { key: "bus_street", value: businessInfo.bus_street },
      { key: "sitio", value: businessInfo.sitio },
    ]

    fields.forEach(({ key, value }) => {
      form.setValue(key as keyof z.infer<typeof businessFormSchema>, value || "")
    })

    setMediaFiles((prev) => [...prev])
  }, [params.business, form])

  // Function to handle form submission
  const submit = async () => {
    setIsSubmitting(true)

    try {
      const validateRespondent = form.watch('respondent.rp_id') ? 'respondent.rp_id' : 'respondent';
      const formIsValid = await form.trigger([
        'bus_name',
        'bus_gross_sales',
        'bus_street',
        'sitio',
        validateRespondent
      ])

      // Validate form
      if (!formIsValid) {
        showErrorToast("Please fill out all required fields")
        return
      }

      if (mediaFiles.length == 0) {
        showErrorToast("Please submit supporting documents")
        return
      }

      const { respondent, ...businessInfo} = form.getValues();
      const { rp_id, ...respondentData } = respondent
      const files = mediaFiles.map((media) => {
        return {
          bf_name: media.file.name,
          bf_type: media.type,
          bf_path: media.storagePath,
          bf_url: media.publicUrl,
        }
      })

      if (formType === Type.Editing) {
        await updateBusiness({
          data: {
            ...businessInfo,
            sitio: businessInfo.sitio.toLowerCase(),
            files: files,
            staff: user?.staff?.staff_id || "",
          },
          businessId: params?.business?.bus_id,
        })

        showSuccessToast("Business record updated successfully!")

        params.business = {
          ...businessInfo,
          bus_id: params?.business?.bus_id,
          sitio: capitalize(businessInfo.sitio),
        }
        params.business.files = mediaFiles
        setFormType(Type.Viewing)
      } else {
        await addBusiness({
          ...businessInfo,
          ...(!rp_id && {respondent: respondentData}),
          ...((rp_id || tab_params?.residentId) && {
            rp: tab_params?.residentId || rp_id?.split(" ")[0]
          }),
          staff: user?.staff?.staff_id,
          files: files,
        })

        showSuccessToast("Business registered successfully!")
        setMediaFiles([])
        form.reset()

        if (tab_params?.isRegistrationTab) {
          tab_params?.next?.()
        }
      }
    } catch (error) {
      console.error("Error with business operation:", error)
      showErrorToast("Failed to process business information. Please try again.")

      // Clean up uploaded files on error
      mediaFiles.map((media) => {
        if (formType === Type.Editing) {
          if (!media.storagePath) return
          if (params?.business?.files.find((file: any) => file.storagePath == media.storagePath)) return
          deleteFile(media.storagePath)
        } else {
          if (media.storagePath) deleteFile(media.storagePath)
        }
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // --------------------- RENDER HELPERS -----------------------

  const getFormTitle = () => {
    switch (formType) {
      case Type.Viewing:
        return "Business Profile"
      case Type.Editing:
        return "Edit Business Information"
      default:
        return "Business Registration"
    }
  }

  const getFormDescription = () => {
    switch (formType) {
      case Type.Viewing:
        return "View detailed business information and supporting documents"
      case Type.Editing:
        return "Update business information and upload new supporting documents"
      default:
        return "Register a new business by providing essential details and supporting documentation"
    }
  }

  const MainContent = (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="space-y-6"
      >
        <BusinessProfileForm
          isRegistrationTab={tab_params?.isRegistrationTab}
          formattedResidents={formattedResidents}
          formType={formType}
          sitio={formattedSitio}
          form={form}
          isSubmitting={isSubmitting}
          isReadOnly={isReadOnly}
          mediaFiles={mediaFiles}
          activeVideoId={activeVideoId}
          url={params.business?.bus_doc_url}
          setFormType={setFormType}
          setMediaFiles={setMediaFiles}
          setActiveVideoId={setActiveVideoId}
          submit={submit}
        />
      </form>
    </Form>
  )

  // --------------------- RENDER -----------------------
  const residentRegistrationForm = () => (
    <div className="w-full flex justify-center px-4">
      <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-orange-50/30">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getFormTitle()}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">{getFormDescription()}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
              <strong>Business Registration:</strong> Please ensure all business information is accurate and up-to-date.
              Supporting documents are required to complete the registration process.
            </AlertDescription>
          </Alert>

          {/* Document Requirements Alert */}
          {mediaFiles.length === 0 && formType !== Type.Viewing && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertDescription className="text-orange-800">
                <strong>Documents Required:</strong> Please upload supporting documents such as business permits,
                licenses, or registration certificates to complete your submission.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Form Content */}
          <div className="p-6">{MainContent}</div>

          {/* Security Notice */}
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              <strong>Data Security:</strong> All business information and documents are securely stored and encrypted.
              Access is restricted to authorized personnel only.
            </AlertDescription>
          </Alert>

          {/* Help Section */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">
              Need assistance with business registration? Contact your administrator for help.
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Store className="w-3 h-3" />
                Business Info
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Respondent Details
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Location
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Documentation
              </span>
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                Secure Storage
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const standardForm = () => (
    <LayoutWithBack
      title="Business Form"
      description="Register a new business by filling in essential details such as name, location, 
              and respondent information. Required fields must be completed to submit successfully."
    >
      <Card className="w-full">
        {MainContent}
      </Card>
    </LayoutWithBack>
  )

  // ==================== MAIN RENDER ======================
  return tab_params?.isRegistrationTab ? residentRegistrationForm() : standardForm()
}
