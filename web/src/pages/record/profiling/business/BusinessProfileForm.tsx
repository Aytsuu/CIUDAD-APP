import React from "react"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { Label } from "@/components/ui/label"
import { MediaUpload, type MediaUploadType } from "@/components/ui/media-upload"
import { renderActionButton } from "../ProfilingActionConfig"
import { Type } from "../ProfilingEnums"
import {
  CheckCircle2,
  Plus,
  X,
} from "lucide-react"
import { Combobox } from "@/components/ui/combobox"
import { Link } from "react-router"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Separator } from "@/components/ui/separator"
import { MediaGallery } from "@/components/ui/media-gallery"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { capitalize } from "@/helpers/capitalize"

export default function BusinessProfileForm({
  addresses,
  validAddresses,
  isRegistrationTab,
  prefix = "",
  isModificationRequest,
  formattedResidents,
  formType,
  sitio,
  form,
  isSubmitting,
  isReadOnly,
  mediaFiles,
  activeVideoId,
  setAddresses,
  setValidAddresses,
  setFormType,
  setMediaFiles,
  setActiveVideoId,
  submit,
}: {
  addresses?: any[];
  validAddresses?: boolean[];
  isRegistrationTab: boolean
  prefix?: string
  isModificationRequest: boolean
  formattedResidents: any
  formType: Type
  sitio: any
  form: any
  isSubmitting: boolean
  isReadOnly: boolean
  mediaFiles: MediaUploadType
  activeVideoId: string
  url: string
  setAddresses?: React.Dispatch<React.SetStateAction<any[]>>;
  setValidAddresses?: React.Dispatch<React.SetStateAction<boolean[]>>;
  setFormType: React.Dispatch<React.SetStateAction<Type>>
  setMediaFiles: React.Dispatch<React.SetStateAction<MediaUploadType>>
  setActiveVideoId: React.Dispatch<React.SetStateAction<string>>
  submit: () => void,
}) {
  const watchedValues = form.watch()
  const residentSelected = watchedValues?.rp_id ? true : false;

  const handleSetAddress = (idx: number, field: string, value: string) => {
    setAddresses && setAddresses(prev => 
      prev.map((address, prevIdx) => {
        return (prevIdx === idx ? 
          {...address, [field]: field !== "sitio" ? capitalize(value) : value} 
          : address)
      })
    )
  }   

  const handleRemoveAddress = (idx: number) => {
    setValidAddresses && setValidAddresses(prev => prev.filter((_,removeIdx) => removeIdx !== idx));
    setAddresses && setAddresses(prev => prev.filter((_,removeIdx) => removeIdx !== idx));
  }

  const SectionHeader = ({
    title,
    description,
    isComplete = false,
    isRequired = true,
  }: {
    title: string
    description: string
    isComplete?: boolean
    isRequired?: boolean
  }) => (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Label className="text-xl font-semibold text-gray-800">{title}</Label>
            {isRequired && formType !== Type.Viewing && (
              <Badge variant="outline" className="text-xs">
                Required
              </Badge>
            )}
            {isComplete && formType !== Type.Viewing &&
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            }
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  )


  const InfoAlert = ({ children }: { children: React.ReactNode }) => (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <AlertDescription className="text-blue-800">{children}</AlertDescription>
    </Alert>
  )

  return (
    <div className="mx-auto">
      {!isRegistrationTab && formType == Type.Create && (
        <div className="bg-blue-600 p-10 shadow-sm rounded-t-md">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label className="text-xl font-semibold text-white">Respondent Information</Label>
                  <Badge variant="outline" className="text-xs text-white">
                    Required
                  </Badge>
                </div>
                <p className="text-sm text-white mt-1">Personal details of the person completing this business profile</p>
              </div>
            </div>
          </div>

          <InfoAlert>
            You can either select an existing registered resident or manually enter the respondent's information
            below for non-resident.
          </InfoAlert>

          <div className="space-y-6">
            {/* Resident Selection */}
            <div className="bg-white rounded-lg p-4 grid">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Registered Resident (Optional)
              </Label>
              <Combobox
                options={formattedResidents}
                value={form.watch("rp_id") as string}
                onChange={(value) => {
                  setAddresses && setAddresses([{
                    add_province: "",
                    add_city: "",
                    add_barangay: "",
                    sitio: "",
                    add_external_sitio: "",
                    add_street: "",
                  }])
                  setValidAddresses && setValidAddresses([])
                  form.clearErrors();
                  form.setValue("rp_id", value)
                }}
                placeholder="Search and select a registered resident..."
                emptyMessage={
                  <div className="flex gap-2 justify-center items-center py-2">
                    <Label className="font-normal text-[13px] text-gray-600">No resident found.</Label>
                    <Link
                      to="/resident/registration"
                      state={{
                        params: {
                          origin: "create",
                          title: "Resident Registration",
                          description: "Provide the necessary details, and complete the registration.",
                        },
                      }}
                      className="text-[13px] text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      Register New Resident
                    </Link>
                  </div>
                }
              />
            </div>

            {/* Personal Information Fields */}
            <div className={`space-y-4 bg-white rounded-lg p-5 ${residentSelected ? 'opacity-95' : 'opacity-100'}`}>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Fill out all required fields for Non-Resident respondent
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-1">
                  <FormInput
                    control={form.control}
                    name="respondent.per_lname"
                    label="Last Name"
                    placeholder="Enter last name"
                    readOnly={isReadOnly || residentSelected}
                  />
                </div>
                <div className="lg:col-span-1">
                  <FormInput
                    control={form.control}
                    name="respondent.per_fname"
                    label="First Name"
                    placeholder="Enter first name"
                    readOnly={isReadOnly || residentSelected}
                  />
                </div>
                <div className="lg:col-span-1">
                  <FormInput
                    control={form.control}
                    name="respondent.per_mname"
                    label="Middle Name"
                    placeholder="Enter middle name (optional)"
                    readOnly={isReadOnly || residentSelected}
                  />
                </div>
                <div>
                  <FormSelect
                    control={form.control}
                    name="respondent.per_sex"
                    label="Sex"
                    options={[
                      { id: "female", name: "Female" },
                      { id: "male", name: "Male" },
                    ]}
                    readOnly={isReadOnly || residentSelected}
                  />
                </div>
                <div>
                  <FormDateTimeInput
                    control={form.control}
                    name="respondent.per_dob"
                    label="Date of Birth"
                    type="date"
                    readOnly={isReadOnly || residentSelected}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-1">
                  <FormInput
                    control={form.control}
                    name="respondent.per_contact"
                    label="Contact Number"
                    placeholder="09XX-XXX-XXXX"
                    readOnly={isReadOnly || residentSelected}
                  />
                  <p className="text-xs text-gray-500 mt-1">Include area code (e.g., 09XX-XXX-XXXX)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {
                  addresses?.map((address, idx) => (
                    <div className="grid gap-3" key={idx}>
                      <Label className="text-black/70">Address {idx + 1}</Label>
                      <div className="flex items-center gap-3">
                        <div className="flex w-2/3 items-center justify-center border shadow-sm rounded-lg" >
                          <Input
                            placeholder="Province"
                            value={address.add_province}
                            onChange={(e) => handleSetAddress(idx, 'add_province', e.target.value)}
                            className="border-none shadow-none focus-visible:ring-0"
                            readOnly={isReadOnly}
                          /> <p className="opacity-40">/</p>
                          <Input
                            placeholder="City"
                            value={address.add_city}
                            onChange={(e) => handleSetAddress(idx, 'add_city', e.target.value)}
                            className="border-none shadow-none focus-visible:ring-0"
                            readOnly={isReadOnly}
                          /> <p className="opacity-40">/</p>
                          <Input
                            placeholder="Barangay"
                            value={address.add_barangay}
                            onChange={(e) => handleSetAddress(idx, 'add_barangay', e.target.value)}
                            className="border-none shadow-none focus-visible:ring-0"
                            readOnly={isReadOnly}
                          /> <p className="opacity-40">/</p>
        
                          {address.add_barangay === "San Roque" ? ( !isReadOnly  ? 
                            (<SelectLayout
                              className="border-none w-full"
                              placeholder="Sitio"
                              options={sitio}
                              value={address.sitio?.toLowerCase()}
                              onChange={(value) => handleSetAddress(idx, 'sitio', value)}
                              
                            />) : (
                              <Input 
                                className="border-none shadow-none focus-visible:ring-0" 
                                value={String(capitalize(address.sitio))} 
                                readOnly
                              />
                            )) : (<Input
                              placeholder="Sitio"
                              value={address.add_external_sitio}
                              onChange={(e) => handleSetAddress(idx, 'add_external_sitio', e.target.value)}
                              className="border-none shadow-none focus-visible:ring-0"
                              readOnly={isReadOnly}
                            />)
                          } 
                          
                          <p className="opacity-40">/</p>
                          <Input
                            placeholder="Street"
                            value={address.add_street}
                            onChange={(e) => handleSetAddress(idx, 'add_street', e.target.value)}
                            className="border-none shadow-none focus-visible:ring-0"
                            readOnly={isReadOnly}
                          />
                        </div>
                        {idx + 1 > 1 &&
                          <Button 
                            type={"button"}
                            variant={"outline"} 
                            className="border-none shadow-none"
                            onClick={() => handleRemoveAddress(idx)}
                          >
                            <X className="cursor-pointer  text-red-500"/>
                          </Button>
                        }
                      </div>
                      {
                        validAddresses 
                        && validAddresses.length > 0 
                        && validAddresses[idx] === false && (
                          <Label className="text-red-500 text-sm">
                            Complete address is required
                          </Label>
                        )
                      }
                    </div>
                  ))
                }
                <div>
                  <Button 
                    variant={"outline"} 
                    type="button"
                    className="bg-transparent border-none shadow-none text-black/60 hover:text-black/70"
                    onClick={() => setAddresses && setAddresses((prev) => [
                      ...prev, {
                        add_province: '',
                        add_city: '',
                        add_barangay: '',
                        sitio: '',
                        add_external_sitio: '',
                        add_street: ''
                      }
                    ])}
                  >
                    <Plus/> Add Address
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Information Section */}
      <div className={`p-10 ${isRegistrationTab && "border-t"}`}>
        <SectionHeader
          title="Business Information"
          description="Essential details about the business being profiled"
        />

        {(formType === Type.Create || formType === Type.Editing) &&  <InfoAlert>
          Provide accurate business information as this will be used for official records and tax assessment purposes.
        </InfoAlert>}

        {formType === Type.Request &&  <InfoAlert>
          Review business information and ensure they are accurate as this will be used for official records and tax assessment purposes.
        </InfoAlert>}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <FormInput
                control={form.control}
                name={`${prefix}bus_name`}
                label="Business Name"
                placeholder="Enter the official business name"
                readOnly={isReadOnly}
              />
              {formType !== Type.Viewing && 
                <p className="text-xs text-gray-500 mt-1">Use the exact name as registered with DTI or SEC</p>
              }
              
            </div>

            <div>
              <TooltipLayout 
                trigger={
                  <div>
                    <FormInput
                      control={form.control}
                      name={`${prefix}bus_gross_sales`}
                      label="Annual Gross Sales (₱)"
                      placeholder="0.00"
                      readOnly={isReadOnly}
                      type="number"
                    />
                  </div>
                }
                content={
                  <p className="max-w-xs">
                    Total revenue from all business activities before deducting expenses. This determines your
                    business tax classification.
                  </p>
                }
              />
              {formType !== Type.Viewing && 
               <p className="text-xs text-gray-500 mt-1">Enter amount without commas (e.g., 500000.00)</p>
              }
            </div>

            <div>
              <FormSelect
                control={form.control}
                name={`${prefix}sitio`}
                label="Sitio/Location"
                options={sitio}
                readOnly={isReadOnly}
              />
              {formType !== Type.Viewing && 
                <p className="text-xs text-gray-500 mt-1">Select the specific area where the business operates</p>
              }
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <FormInput
                control={form.control}
                name={`${prefix}bus_street`}
                label="Business Street Address"
                placeholder="Building name/number, street name, landmarks"
                readOnly={isReadOnly}
              />
              {formType !== Type.Viewing && 
                <p className="text-xs text-gray-500 mt-1">
                  Provide the complete street address where the business is located
                </p>
              }
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Supporting Documents Section */}
      <div className="p-10">
        <SectionHeader
          title="Supporting Documents"
          description={
            formType !== Type.Viewing
              ? "Upload documents that verify your reported business information"
              : "View uploaded supporting documents"
          }
          isRequired={false}
        />

        {formType == Type.Create || formType == Type.Editing ? (
          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800">
                <strong>Required Documents:</strong> Please upload a business permit to support the reported gross sales
                amount. This helps ensure accurate business classification.
              </AlertDescription>
            </Alert>


            <MediaUpload
              title=""
              description="Click to browse. Supported formats: JPG, PNG,"
              mediaFiles={mediaFiles}
              setMediaFiles={setMediaFiles}
              activeVideoId={activeVideoId}
              setActiveVideoId={setActiveVideoId}
              acceptableFiles="image"
            />
          </div>
        ) : (
          <div className="grid gap-4">
            <MediaGallery mediaFiles={mediaFiles} />
          </div>
        )}
      </div>
      <Separator />
      {/* Action Buttons */}
      {!isModificationRequest && !isRegistrationTab &&
        <div className="p-10">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {!isReadOnly && <p>Make sure all required information is complete before submitting.</p>}
            </div>
            <div className="flex gap-3">
              {renderActionButton({
                formType,
                origin: "defaultOrigin",
                isSubmitting,
                setFormType,
                submit,
              })}
            </div>
          </div>
        </div>
      }
    </div>
  )
}
