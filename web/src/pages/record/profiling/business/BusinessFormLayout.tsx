import React from "react"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import BusinessProfileForm from "./BusinessProfileForm"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useLocation, useNavigate } from "react-router"
import { formatResidents, formatSitio } from "../ProfilingFormats"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { businessFormSchema } from "@/form-schema/profiling-schema"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { FileText, MapPin, User, Database, Store, Loader2, Clock, History, Check, MoveRight } from "lucide-react"
import { Form } from "@/components/ui/form/form"
import { Type } from "../ProfilingEnums"
import { useAuth } from "@/context/AuthContext"
import { useAddBusiness } from "../queries/profilingAddQueries"
import type { MediaUploadType } from "@/components/ui/media-upload"
import { useBusinessHistory, useBusinessInfo, useModificationRequests, useResidentsList, useSitioList } from "../queries/profilingFetchQueries"
import { useLoading } from "@/context/LoadingContext"
import { useUpdateBusiness } from "../queries/profilingUpdateQueries"
import { capitalizeAllFields } from "@/helpers/capitalize"
import { showErrorToast, showPlainToast, showSuccessToast } from "@/components/ui/toast"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button/button"
import { formatDate } from "@/helpers/dateHelper"
import { useSafeNavigate } from "@/hooks/use-safe-navigate"
import ModificationRequest from "./ModificationRequest"
import { SheetLayout } from "@/components/ui/sheet/sheet-layout"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { RenderHistory } from "../ProfilingHistory"
import _ from 'lodash'
import { useDebounce } from "@/hooks/use-debounce"

export default function BusinessFormLayout({ tab_params }: { tab_params?: Record<string, any> }) {
  // --------------------- STATE INITIALIZATION -----------------------
  const navigate = useNavigate();
  const location = useLocation()
  const params = React.useMemo(() => location.state?.params || {}, [location.state])
  const { user } = useAuth()
  const { safeNavigate } = useSafeNavigate();
  const { showLoading, hideLoading } = useLoading()
  const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>([])
  const [activeVideoId, setActiveVideoId] = React.useState<string>("")
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false)
  const [formType, setFormType] = React.useState<Type>(params?.type || tab_params?.type)
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const form = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: generateDefaultValues(businessFormSchema),
  })

  const { mutateAsync: addBusiness } = useAddBusiness()
  const { mutateAsync: updateBusiness } = useUpdateBusiness()

  const { data: modificationRequests, isLoading: isLoadingRequests } = useModificationRequests()
  const { data: businessInfo, isLoading: isLoadingBusInfo } = useBusinessInfo(params?.busId)
  const { data: businessHistory, isLoading: isLoadingHistory } = useBusinessHistory(params?.busId)
  const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList(
    false, // is staff
    false, // exclude independent
    true, // is search only
    debouncedSearchQuery, // search query
    false // disable query
  )
  const { data: sitioList, isLoading: isLoadingSitio } = useSitioList()

  const formattedSitio = formatSitio(sitioList)
  const formattedResidents = formatResidents(residentsList)
  const modRequest = React.useMemo(() => 
    modificationRequests?.find((req: any) => 
      req.current_details.bus_id == params?.busId
    )
  , [modificationRequests]);

  // Check if we need business info and if it's still loading
  const needsBusinessInfo = formType !== Type.Create
  const isBusinessInfoLoading = needsBusinessInfo && isLoadingBusInfo && !businessInfo
  const isFormDataLoading = isLoadingSitio || isLoadingResidents || isLoadingBusInfo || isLoadingRequests
  const showRespondent = formType !== Type.Create && 
              !tab_params?.isRegistrationTab && 
              (businessInfo?.br || businessInfo?.rp)

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
      if(formType == Type.Editing) setIsReadOnly(false);
      else setIsReadOnly(true);

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
  }, [businessInfo, formType])

  React.useEffect(() => {
    const files = tab_params?.form.getValues().businessSchema.files;
    if(files?.length > 0) {
      setMediaFiles(files)
    }
  }, [tab_params?.files])
  
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

  const handleHistoryItemClick = (index: number) => {
    navigate('/profiling/business/history/view', {
      state: {
        params: {
          newData: businessHistory[index],
          oldData: businessHistory[index + 1],
        }
      }
    })
  }

  const handleRespondentClick = () => {
    if(businessInfo?.br) {
      navigate("/profiling/business/record/respondent/details", {
        state: {
          params: {
            type: "viewing",
            data: {
              respondentId: businessInfo.br.br_id,
            },
          },
        },
      });
    } else {
      navigate("/profiling/resident/view/personal", {
        state: {
          params: {
            type: 'viewing',
            data: {
              residentId: businessInfo.rp.rp_id,
              familyId: businessInfo.rp.fam_id
            },
          }
        }
      });
    }
  }

  const fullName = (lname: string, fname: string, mname?: string) => {
    return `${lname}, ${fname}${mname ? ` ${mname}` : ""}`
  }
  
  const populateFields = React.useCallback(() => {
    if (!businessInfo) return

    const fields = [
      { key: "bus_name", value: businessInfo.bus_name },
      { key: "bus_gross_sales", value: String(businessInfo.bus_gross_sales) },
      { key: "bus_location", value: businessInfo.bus_location },
    ]

    fields.forEach(({ key, value }) => {
      form.setValue(key as keyof z.infer<typeof businessFormSchema>, value || "")
    })

    setMediaFiles((prev) => [...prev])
  }, [businessInfo, form])

  // Function to add business to db
  const create = async (
    per: Record<string, any>, 
    businessData: Record<string, any>, 
    rp_id: string,
    files: Record<string, any>
  ) => {
    try {
      const noPersonalInfo = isEmpty(per)
      await addBusiness({
        ...(!noPersonalInfo && {per: per}),
        ...(rp_id && {rp: rp_id}),
        ...businessData,
        bus_status: "Active",
        staff: user?.staff?.staff_id,
        create_files: files
      })

      setIsSubmitting(false);
      showSuccessToast("Business registered successfully!")
      setMediaFiles([])
      form.reset()
      if (tab_params?.isRegistrationTab) {
        tab_params?.next?.(true)
      }
    } catch (err) {
      setIsSubmitting(false);
      showErrorToast('Failed to register business')
    }
  } 

  // Function to update business data
  const update = async (
    businessData: Record<string, any>,
    files: Record<string, any>,
    initialFiles?: Record<string, any>
  ) => {
    try {
      await updateBusiness({
        data: {
          ...businessData,
          // Include if viewing pending 
          ...(formType === Type.Request && {
            bus_date_verified: formatDate(new Date()),
            bus_status: 'Active'
          }),
          // Exclude if viewing pending 
          ...((formType !== Type.Request && !_.isEqual(initialFiles, files)) && {
            edit_files: files
          }),
          staff: user?.staff?.staff_id || "",
        },
        businessId: params?.busId,
      })
      showSuccessToast("Business record updated successfully!")
      setIsSubmitting(false);
      if(formType === Type.Request) safeNavigate.back();
      setFormType(Type.Viewing)
    } catch (err) {
      setIsSubmitting(false);
      showErrorToast('Failed to update business')
    }
  }

  const handleFinish = async () => {
    if(!(await tab_params?.form.trigger(["businessSchema"]))) {
      showErrorToast("Please fill out all required fields.");
      return;
    }

    if (mediaFiles.length == 0) {
      showErrorToast("Please upload supporting documents")
      return
    }

    tab_params?.form.setValue("businessSchema.files", mediaFiles)
    tab_params?.next(true)
  }

  const isEmpty = (obj: Record<string, any>) => {
    if(!obj) return true;
    return Object.values(obj).every(val => val === "" || val?.length == 0 || val === null);
  }
    

  // Function to handle form submission
  const submit = async () => {
    const formIsValid = await form.trigger([
      "bus_name", 
      "bus_gross_sales", 
      "bus_location", 
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

    const { rp_id, respondent, ...businessData } = form.getValues()
    const initialFiles = businessInfo?.files.map((media: any) => ({
        name: media.name,
        type: media.type,
        file: media.file
      }))
  
    const files = mediaFiles.map((media) => {
      return {
        name: media.name,
        type: media.type,
        file: media.file
      }
    })

    setIsSubmitting(true)

    switch(formType) {
      case Type.Create:
        create(capitalizeAllFields(respondent), 
          capitalizeAllFields(businessData), 
          rp_id?.split(" ")[0] as string || tab_params?.residentId, 
          files
        );
        break;
      case Type.Editing:
        if (_.isEqual(businessData, {
          bus_name: businessInfo?.bus_name,
          bus_gross_sales: String(businessInfo?.bus_gross_sales),
          bus_street: businessInfo?.bus_street,
          sitio: businessInfo?.sitio
        }) && _.isEqual(initialFiles, files)) {
          showPlainToast('No changes made')
          return;
        }

        update(businessData, files, initialFiles)
        break;
      case Type.Request:
        update(businessData, files);
        break;
    }
  }

  const handleSkip = () => {
    tab_params?.next(false)
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

  const respondentView = () => (
    <Card className="bg-blue-600 rounded-b-none pl-6 pr-2  ">
      <CardHeader className="flex-row justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <Label className="text-xl font-semibold text-white">Respondent/Owner Information</Label>
          </div>
        </div>
        {formType === Type.Viewing && (
          <div>
            <SheetLayout 
              trigger={
                <div>
                  <TooltipLayout 
                    trigger={<History className="text-white"/>}
                    content="History"
                  />
                </div>
              }
              content={
                <RenderHistory 
                  history={businessHistory}
                  isLoadingHistory={isLoadingHistory}
                  itemTitle="Business Information Update"
                  handleHistoryItemClick={handleHistoryItemClick}
                />
              }
              title={
                <Label className="flex items-center gap-2 text-lg text-darkBlue1">
                  <Clock size={20}/>
                  Update History
                </Label>
              }
              description="View all changes made to this business information"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <Badge variant={"outline"} className="bg-white text-blue-900">
              ID: {businessInfo?.br ? businessInfo.br.br_id : params?.rpId}
            </Badge>
            {businessInfo?.br ? 
              (<Badge variant={"outline"} className=" text-white">Not a Resident</Badge>) :
              (<Badge variant={"outline"} className=" text-white">Resident</Badge>)
            }
          </div>
          <Label className="flex text-xl text-gray-100 items-center gap-4 cursor-pointer group"
            onClick={handleRespondentClick}
          >
            {businessInfo?.br ? 
              fullName(businessInfo?.br.br_lname, businessInfo?.br.br_fname, businessInfo?.br.br_mname) : 
              fullName(businessInfo?.rp.per_lname, businessInfo?.rp.per_fname, businessInfo?.rp.per_mname)
            }
            {formType == Type.Viewing && 
              <MoveRight size={20} className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300 ease-out"/>
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

  const MainContent = (
    <>
      {isBusinessInfoLoading ? (<BusinessInfoLoading />) : (
        <div className="flex gap-4">
          <div className="w-full">
            {showRespondent && respondentView()}
            <Card className={`w-full max-h-[750px] overflow-y-auto ${showRespondent ? "rounded-t-none border-t-0" : "rounded-lg border"}`}>
              <Form {...(tab_params?.isRegistrationTab ? tab_params?.form : form)}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    submit()
                  }}
                  className="space-y-6"
                >
                  <BusinessProfileForm
                    isRegistrationTab={tab_params?.isRegistrationTab}
                    prefix={tab_params?.isRegistrationTab ? "businessSchema." : ""}
                    isModificationRequest = {!!modRequest}
                    formattedResidents={formattedResidents}
                    formType={formType}
                    sitio={formattedSitio}
                    form={tab_params?.isRegistrationTab ? tab_params?.form : form}
                    isSubmitting={isSubmitting}
                    isReadOnly={isReadOnly}
                    mediaFiles={mediaFiles}
                    activeVideoId={activeVideoId}
                    url={params.business?.bus_doc_url}
                    setFormType={setFormType}
                    setMediaFiles={setMediaFiles}
                    setActiveVideoId={setActiveVideoId}
                    submit={submit}
                    setSearchQuery={setSearchQuery}
                  />
                </form>
              </Form>
            </Card>
          </div>
          {modRequest && (
            <ModificationRequest data={modRequest}/>
          )}
        </div>
      )}
    </>
  )

  const residentRegistrationForm = () => (
    <div className="w-full flex justify-center px-4">
      <Card className="w-full shadow-none max-h-[700px] overflow-y-auto">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{getFormTitle()}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">{getFormDescription()}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form Content */}
          <div className="p-6">
            {MainContent}
            <div className="flex justify-end mt-8">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1"  
                  onClick={handleSkip}
                  disabled={isSubmitting}
                >
                  Skip for Now
                </Button>
                <Button onClick={handleFinish}>
                  <Check/> Finish
                </Button>
              </div>
            </div>
          </div>

          {/* Help Section */}
          {!isBusinessInfoLoading && (
            <div className="text-center pt-4">
              <p className="text-xs text-gray-500 mb-2">
                All business information and documents are securely stored and
                encrypted. Access is restricted to authorized personnel only.
              </p>
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
      {MainContent}
    </LayoutWithBack>
  )

  // ==================== MAIN RENDER ======================
  return (
    tab_params?.isRegistrationTab ? residentRegistrationForm() : standardForm()
  )
}