import React from "react"
import type { z } from "zod"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { Label } from "@/components/ui/label"
import type { UseFormReturn } from "react-hook-form"
import type { businessFormSchema } from "@/form-schema/profiling-schema"
import { MediaUpload, type MediaUploadType } from "@/components/ui/media-upload"
import { renderActionButton } from "../profilingActionConfig"
import { Type } from "../profilingEnums"
import {
  CheckCircle2,
} from "lucide-react"
import { Combobox } from "@/components/ui/combobox"
import { Link } from "react-router"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Separator } from "@/components/ui/separator"
import { MediaGallery } from "@/components/ui/media-gallery"

export default function BusinessProfileForm({
  isRegistrationTab,
  formattedResidents,
  formType,
  sitio,
  form,
  isSubmitting,
  isReadOnly,
  mediaFiles,
  activeVideoId,
  setFormType,
  setMediaFiles,
  setActiveVideoId,
  submit,
}: {
  isRegistrationTab: boolean
  formattedResidents: any
  formType: Type
  sitio: any
  form: UseFormReturn<z.infer<typeof businessFormSchema>>
  isSubmitting: boolean
  isReadOnly: boolean
  mediaFiles: MediaUploadType
  activeVideoId: string
  url: string
  setFormType: React.Dispatch<React.SetStateAction<Type>>
  setMediaFiles: React.Dispatch<React.SetStateAction<MediaUploadType>>
  setActiveVideoId: React.Dispatch<React.SetStateAction<string>>
  submit: () => void
}) {
  const watchedValues = form.watch()
  const residentSelected = watchedValues.respondent?.rp_id ? true : false;
  const hasBusinessInfo = watchedValues.bus_name && watchedValues.bus_gross_sales ? true : false
  const hasDocuments = mediaFiles && mediaFiles.length > 0 ? true : false

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
                  {residentSelected &&
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  }
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
            <div className="bg-gray-50 rounded-lg p-4 grid">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Registered Resident (Optional)
              </Label>
              <Combobox
                options={formattedResidents}
                value={form.watch("respondent.rp_id") as string}
                onChange={(value) => {
                  form.setValue("respondent.rp_id", value)
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
            <div className={`space-y-4 bg-gray-50 rounded-lg p-5 ${residentSelected ? 'opacity-95' : 'opacity-100'}`}>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Fill out all required fields for Non-Resident respondent
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-1">
                  <FormInput
                    control={form.control}
                    name="respondent.br_lname"
                    label="Last Name"
                    placeholder="Enter last name"
                    readOnly={isReadOnly || residentSelected}
                  />
                </div>
                <div className="lg:col-span-1">
                  <FormInput
                    control={form.control}
                    name="respondent.br_fname"
                    label="First Name"
                    placeholder="Enter first name"
                    readOnly={isReadOnly || residentSelected}
                  />
                </div>
                <div className="lg:col-span-1">
                  <FormInput
                    control={form.control}
                    name="respondent.br_mname"
                    label="Middle Name"
                    placeholder="Enter middle name (optional)"
                    readOnly={isReadOnly || residentSelected}
                  />
                </div>
                <div>
                  <FormSelect
                    control={form.control}
                    name="respondent.br_sex"
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
                    name="respondent.br_dob"
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
                    name="respondent.br_contact"
                    label="Contact Number"
                    placeholder="09XX-XXX-XXXX"
                    readOnly={isReadOnly || residentSelected}
                  />
                  <p className="text-xs text-gray-500 mt-1">Include area code (e.g., 09XX-XXX-XXXX)</p>
                </div>
                <div className="md:col-span-4">
                  <FormInput
                    control={form.control}
                    name="respondent.br_address"
                    label="Complete Address"
                    placeholder="House No., Street, Barangay, City, Province"
                    readOnly={isReadOnly || residentSelected}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include house number, street, barangay, city, and province
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Information Section */}
      <div className="p-10">
        <SectionHeader
          title="Business Information"
          description="Essential details about the business being profiled"
          isComplete={hasBusinessInfo}
        />

        {formType === Type.Create || formType === Type.Editing &&  <InfoAlert>
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
                name="bus_name"
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
                      name="bus_gross_sales"
                      label="Annual Gross Sales (₱)"
                      placeholder="0.00"
                      readOnly={isReadOnly}
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
                name="sitio"
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
                name="bus_street"
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
              : "Review uploaded supporting documents"
          }
          isComplete={hasDocuments}
          isRequired={false}
        />

        {formType == Type.Create || formType == Type.Editing ? (
          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800">
                <strong>Required Documents:</strong> Please upload documents that support your reported gross sales
                amount. This helps ensure accurate business classification and tax assessment.
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Acceptable Documents Include:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Official sales receipts or invoices from recent transactions</li>
                <li>• Bank statements showing business income and transactions</li>
                <li>• Annual tax returns (BIR Form 1701 or 1701A)</li>
                <li>• Business permits and licenses</li>
                <li>• Financial statements or income reports</li>
                <li>• DTI or SEC registration certificates</li>
              </ul>
            </div>

            <MediaUpload
              title=""
              description="Click to browse. Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)"
              mediaFiles={mediaFiles}
              setMediaFiles={setMediaFiles}
              activeVideoId={activeVideoId}
              setActiveVideoId={setActiveVideoId}
            />
          </div>
        ) : (
          <div className="grid gap-4">
            {hasDocuments && <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">
                {mediaFiles.length} supporting document{mediaFiles.length !== 1 ? "s" : ""} available
              </span>
            </div>}
            <MediaGallery mediaFiles={mediaFiles} />
          </div>
        )}
      </div>
      <Separator />
      {/* Action Buttons */}
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
    </div>
  )
}
