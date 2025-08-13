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
import { FileText, MapPin, User, Database, Store, Loader2 } from "lucide-react"
import { Form } from "@/components/ui/form/form"
import { Type } from "../profilingEnums"
import { useAuth } from "@/context/AuthContext"
import { useAddBusiness } from "../queries/profilingAddQueries"
import type { MediaUploadType } from "@/components/ui/media-upload"
import { useBusinessInfo, useResidentsList, useSitioList } from "../queries/profilingFetchQueries"
import { useLoading } from "@/context/LoadingContext"
import { useInstantFileUpload } from "@/hooks/use-file-upload"
import { useUpdateBusiness } from "../queries/profilingUpdateQueries"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { showErrorToast, showSuccessToast } from "@/components/ui/toast"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button/button"
import { formatDate } from "@/helpers/dateHelper"
import { useSafeNavigate } from "@/hooks/use-safe-navigate"

export default function BusinessFormLayout({ tab_params }: { tab_params?: Record<string, any> }) {
  // --------------------- STATE INITIALIZATION -----------------------
  const location = useLocation()
  const params = React.useMemo(() => location.state?.params || {}, [location.state])
  const { user } = useAuth()
  const { safeNavigate } = useSafeNavigate();
  const { showLoading, hideLoading } = useLoading()
  const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>([])
  const { deleteFile } = useInstantFileUpload({ mediaFiles })
  const [activeVideoId, setActiveVideoId] = React.useState<string>("")
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false)
  const [formType, setFormType] = React.useState<Type>(params?.type)

  const form = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: generateDefaultValues(businessFormSchema),
  })

  const { mutateAsync: addBusiness } = useAddBusiness()
  const { mutateAsync: updateBusiness } = useUpdateBusiness()
  const { data: businessInfo, isLoading: isLoadingBusInfo } = useBusinessInfo(params?.busId)
  const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList()
  const { data: sitioList, isLoading: isLoadingSitio } = useSitioList()

  const formattedSitio = React.useMemo(() => formatSitio(sitioList) || [], [sitioList])
  const formattedResidents = React.useMemo(() => formatResidents(residentsList) || [], [residentsList])

  // Check if we need business info and if it's still loading
  const needsBusinessInfo = formType !== Type.Create
  const isBusinessInfoLoading = needsBusinessInfo && isLoadingBusInfo && !businessInfo
  const isFormDataLoading = isLoadingSitio || isLoadingResidents || isLoadingBusInfo

  // --------------------- SIDE EFFECTS -----------------------
  React.useEffect(() => {
    if (isFormDataLoading) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [isFormDataLoading, showLoading, hideLoading])

  React.useEffect(() => {
    if (formType !== Type.Create) {
      setIsReadOnly(true)

      // Only populate fields if business info is available
      if (businessInfo && !isLoadingBusInfo) {
        populateFields()
      }
    } else {
      setIsReadOnly(false)
    }
  }, [formType, businessInfo, isLoadingBusInfo])

  React.useEffect(() => {
    if (businessInfo?.files) {
      setMediaFiles(businessInfo?.files)
    }
  }, [businessInfo])

  // --------------------- HANDLERS -----------------------

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

  const fullName = (lname: string, fname: string, mname?: string) => {
    return `${lname}, ${fname}${mname ? ` ${mname}` : ""}`
  }
  
  const populateFields = React.useCallback(() => {
    if (!businessInfo) return

    // If respondent is a resident
    const resident = formattedResidents?.find((res: any) => res.id.split(" "[0] == params?.rpId));

    const fields = [
      ...(businessInfo.rp
        ? [{ key: "respondent.rp_id", value: resident?.id }]
        : [
          { key: "respondent.br_lname", value: businessInfo.br.br_lname },
          { key: "respondent.br_fname", value: businessInfo.br.br_fname },
          { key: "respondent.br_mname", value: businessInfo.br.br_mname },
          { key: "respondent.br_sex", value: businessInfo.br.br_sex },
          { key: "respondent.br_dob", value: businessInfo.br.br_dob },
          { key: "respondent.br_contact", value: businessInfo.br.br_contact },
          { key: "respondent.br_address", value: businessInfo.br.br_address },
        ]),
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
  }, [businessInfo, form])

  // Function to add business to db
  const create = async (
    respondentData: Record<string, any>, 
    rp_id: string,
    files: Record<string, any>
  ) => {
    await addBusiness({
      ...businessInfo,
      ...(!rp_id && { respondent: respondentData }),
      ...((rp_id || tab_params?.residentId) && {
        rp: tab_params?.residentId || rp_id?.split(" ")[0],
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

  // Function to update business data
  const update = async (
    businessInfo: Record<string, any>,
    files: Record<string, any>
  ) => {
    await updateBusiness({
      data: {
        ...businessInfo,
        // Include if viewing pending 
        ...(formType === Type.Request && {
          bus_date_verified: formatDate(new Date()),
          bus_status: 'Active'
        }),
        // Exclude if viewing pending 
        ...(formType !== Type.Request && {
          files: files
        }),
        sitio: businessInfo.sitio.toLowerCase(),
        staff: user?.staff?.staff_id || "",
      },
      businessId: params?.busId,
    })
    showSuccessToast("Business record updated successfully!")
    if(formType === Type.Request) safeNavigate.back();
    setFormType(Type.Viewing)
  }

  // Function to handle form submission
  const submit = async () => {
    setIsSubmitting(true)
    try {
      const validateRespondent = form.watch("respondent.rp_id") ? "respondent.rp_id" : "respondent";
      const formIsValid = await form.trigger([
        ...(formType !== Type.Request ? [validateRespondent] : []) as any,
        "bus_name", 
        "bus_gross_sales", 
        "bus_street", 
        "sitio"
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

      const { respondent, ...businessInfo } = form.getValues()
      const { rp_id, ...respondentData } = respondent

      const files = mediaFiles.map((media) => {
        return {
          bf_name: media.file.name,
          bf_type: media.type,
          bf_path: media.storagePath,
          bf_url: media.publicUrl,
        }
      })

      switch(formType) {
        case Type.Create:
          create(respondentData, rp_id as string, files);
          break;
        case Type.Editing:
          update(businessInfo, files);
          break;
        case Type.Request:
          update(businessInfo, files);
          break;
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

  // --------------------- RENDER -----------------------
  // Business info loading state
  const BusinessInfoLoading = () => (
    <Card className="w-full">
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Business Information</h3>
          <p className="text-sm text-gray-600">Please wait while we fetch the business details...</p>
        </div>
      </div>
    </Card>
  )

  const MainContent = React.useCallback(() => {
    // Show loading state if business info is needed but not loaded
    if (isBusinessInfoLoading) {
      return <BusinessInfoLoading />
    }

    return (
      <>
        {formType !== Type.Create && respondentView()}
        <Card className="w-full rounded-t-none border-t-0">
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
        </Card>
      </>
    )
  }, [form, formType, formattedResidents, formattedSitio, mediaFiles, activeVideoId, params, isSubmitting, isReadOnly, tab_params?.isRegistrationTab])

  const respondentView = () => (
    <Card className="bg-blue-600 rounded-b-none px-6  ">
      <CardHeader className="mb-4">
        <div className="flex items-center gap-3">
          <div>
            <Label className="text-xl font-semibold text-white">Respondent/Owner Information</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <Badge variant={"outline"} className="bg-white text-blue-900">
              ID: {businessInfo.br ? businessInfo.br.br_id : params?.rpId}
            </Badge>
            {businessInfo.br ? 
              (<Badge variant={"outline"} className=" text-white">Not a Resident</Badge>) :
              (<Badge variant={"outline"} className=" text-white">Resident</Badge>)
            }
          </div>
          <Label className="flex text-xl text-gray-100 items-center gap-4">
            {businessInfo.br ? 
              fullName(businessInfo.br.per_lname, businessInfo.br.per_fname, businessInfo.br.per_mname) : 
              fullName(businessInfo.rp.per_lname, businessInfo.rp.per_fname, businessInfo.rp.per_mname)
            }
            {formType == Type.Editing && <div>
              <Button className="shadow-none bg-green-500 hover:bg-green-500 h-5 px-2">
                Change
              </Button>
            </div>}
          </Label>
        </div>
      </CardContent>
    </Card>
  )

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
          {mediaFiles.length === 0 && formType !== Type.Viewing && !isBusinessInfoLoading && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertDescription className="text-orange-800">
                <strong>Documents Required:</strong> Please upload supporting documents such as business permits,
                licenses, or registration certificates to complete your submission.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Form Content */}
          <div className="p-6">
            <MainContent />
          </div>

          {/* Security Notice */}
          {!isBusinessInfoLoading && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                <strong>Data Security:</strong> All business information and documents are securely stored and
                encrypted. Access is restricted to authorized personnel only.
              </AlertDescription>
            </Alert>
          )}

          {/* Help Section */}
          {!isBusinessInfoLoading && (
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
          )}
        </CardContent>
      </Card>
    </div>
  )

  const standardForm = () => (
    <LayoutWithBack
      title={getFormTitle()}
      description={getFormDescription()}
    >
      <MainContent />
    </LayoutWithBack>
  )

  // ==================== MAIN RENDER ======================
  return tab_params?.isRegistrationTab ? residentRegistrationForm() : standardForm()
}