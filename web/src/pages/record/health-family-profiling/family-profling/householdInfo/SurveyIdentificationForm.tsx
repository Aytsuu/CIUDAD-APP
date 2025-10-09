import { useEffect, useImperativeHandle, forwardRef, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, CheckCircle2, ClipboardCheck, User } from "lucide-react"
import { Button } from "@/components/ui/button/button"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form"
import { Combobox } from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"
import SignatureCanvas from "@/components/ui/signature-canvas"

import { cn } from "@/lib/utils"
import { surveyFormSchema } from "@/form-schema/family-profiling-schema"
import type { SurveyFormData } from "@/form-schema/health-data-types"
import { useAuth } from "@/context/AuthContext"
import { useHealthStaffList } from "../../queries/administrationFetchQueries"
import { formatHealthStaff } from "../../HealthStaffFormats"

interface SurveyIdentificationFormProps {
  initialData?: Partial<SurveyFormData>
  respondentInfo?: {
    rp_id: string
    personal_info: {
      per_fname: string
      per_lname: string
      per_mname?: string
    }
  }
  familyMembers?: any[] // Add family members for manual selection
}

export interface SurveyIdentificationFormHandle {
  getFormData: () => SurveyFormData
  isFormValid: () => boolean
}

const SurveyIdentificationForm = forwardRef<SurveyIdentificationFormHandle, SurveyIdentificationFormProps>(
  ({ initialData, respondentInfo, familyMembers }, ref) => {
  
  const { user } = useAuth()

  // Fetch health staff data
  const { data: healthStaffList } = useHealthStaffList()
  
  // Format health staff for combobox
  const formattedHealthStaff = useMemo(() => formatHealthStaff(healthStaffList), [healthStaffList])

  // Format family members for resident selection
  const formattedFamilyMembers = useMemo(() => {
    if (!familyMembers || !Array.isArray(familyMembers)) return []
    
    return familyMembers.map((member: any) => {
      const rpId = member.rp_id || ""
      const firstName = member.per?.per_fname || member.personal_info?.per_fname || ""
      const lastName = member.per?.per_lname || member.personal_info?.per_lname || ""
      const middleName = member.per?.per_mname || member.personal_info?.per_mname || ""
      
      let fullName = `${firstName} ${lastName}`.trim()
      if (middleName) {
        fullName = `${firstName} ${middleName} ${lastName}`.trim()
      }
      
      return {
        id: `${rpId} - ${fullName}`.toUpperCase(),
        name: (
          <div className="flex gap-2 items-center">
            <span className="text-green-600 font-medium text-sm">
              #{rpId}
            </span>
            <span className="text-sm">{fullName.toUpperCase()}</span>
          </div>
        ),
      }
    })
  }, [familyMembers])

  // Debug logging
  useEffect(() => {
    console.log('SurveyIdentificationForm - User:', user);
    console.log('SurveyIdentificationForm - Staff:', user?.staff);
    console.log('SurveyIdentificationForm - Staff Keys:', user?.staff ? Object.keys(user.staff) : 'No staff');
    console.log('SurveyIdentificationForm - Respondent Info:', respondentInfo);
    console.log('SurveyIdentificationForm - Family Members:', familyMembers);
    console.log('SurveyIdentificationForm - Formatted Family Members:', formattedFamilyMembers);
    console.log('SurveyIdentificationForm - Health Staff List:', healthStaffList);
    console.log('SurveyIdentificationForm - Formatted Health Staff:', formattedHealthStaff);
  }, [user, respondentInfo, familyMembers, formattedFamilyMembers, healthStaffList, formattedHealthStaff])

  // Format respondent display name
  const getRespondentDisplayName = () => {
    if (!respondentInfo) return ""
    const { rp_id, personal_info } = respondentInfo
    const fullName = `${personal_info.per_fname} ${personal_info.per_lname}`
    return `${rp_id} - ${fullName}`
  }

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: initialData || {
      filledBy: "",
      informant: "",
      checkedBy: "",
      date: new Date(),
      signature: "",
    },
  })

  // Helper function to extract staff name from the selected value
  const extractStaffName = (selectedValue: string) => {
    if (!selectedValue) return ""
    // The format is "staff_id First Last", so we extract the name part
    const parts = selectedValue.split(" ")
    if (parts.length > 1) {
      return parts.slice(1).join(" ") // Get everything after the first space (the name)
    }
    return selectedValue
  }

  // Helper function to extract resident name from the selected value  
  const extractResidentName = (selectedValue: string) => {
    if (!selectedValue) return ""
    // The format is "resident_id - First Last", so we extract the part after the " - "
    const parts = selectedValue.split(" - ")
    if (parts.length > 1) {
      return parts[1] // Get the name part
    }
    return selectedValue
  }

  // Expose form data and validation to parent component
  useImperativeHandle(ref, () => ({
    getFormData: () => {
      const formValues = form.getValues()
      console.log('SurveyIdentificationForm - getFormData called, raw values:', formValues);
      
      const extractedData = {
        ...formValues,
        filledBy: extractStaffName(formValues.filledBy), // Extract staff name
        filledByName: formValues.filledBy, // Keep full value for display if needed
        informant: extractResidentName(formValues.informant), // Extract resident name  
        informantName: formValues.informant, // Keep full value for display if needed
        checkedBy: extractStaffName(formValues.checkedBy), // Extract staff name
        checkedByName: formValues.checkedBy // Keep full value for display if needed
      }
      
      console.log('SurveyIdentificationForm - extracted data:', extractedData);
      return extractedData;
    },
    isFormValid: () => {
      const formValues = form.getValues();
      const isValid = !!(
        formValues.filledBy &&
        formValues.informant &&
        formValues.checkedBy &&
        formValues.date &&
        formValues.signature
      );
      
      console.log('SurveyIdentificationForm - isFormValid check:', {
        filledBy: !!formValues.filledBy,
        informant: !!formValues.informant,
        checkedBy: !!formValues.checkedBy,
        date: !!formValues.date,
        signature: !!formValues.signature,
        isValid: isValid,
        formState: form.formState.isValid
      });
      
      return isValid;
    }
  }), [form])

  // Auto-populate informant with respondent info when component mounts or data changes
  useEffect(() => {
    // Auto-populate informant with respondent info if available
    const respondentDisplayName = getRespondentDisplayName()
    if (respondentDisplayName && !form.getValues("informant")) {
      form.setValue("informant", respondentDisplayName)
    }
  }, [respondentInfo, form])

  return (
    <div className="w-full mx-auto px-8 py-6">
      <h1 className="text-xl font-semibold text-left mb-4 text-black">V. Survey Identification</h1>
      <Separator className="mb-6" />

      <Form {...form}>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="filledBy"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">
                      Profiled by: <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Combobox
                          options={formattedHealthStaff}
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          placeholder="Select health staff"
                          contentClassName="w-[24rem] max-h-60"
                          triggerClassName="flex-1 h-10"
                          emptyMessage={
                            <div className="flex gap-2 justify-center items-center py-2">
                              <Label className="font-normal text-[13px]">No health staff found.</Label>
                            </div>
                          }
                        />
                      </FormControl>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">B/CHW</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="informant"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">
                      Informant/Conforme: <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="flex items-center space-x-2">
                      <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Combobox
                          options={formattedFamilyMembers}
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          placeholder="Select family member"
                          contentClassName="w-[24rem] max-h-60"
                          triggerClassName="flex-1 h-10"
                          emptyMessage={
                            <div className="flex gap-2 justify-center items-center">
                              <Label className="font-normal text-[13px]">No family member found.</Label>
                            </div>
                          }
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="checkedBy"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">
                      Checked by (RN/RM): <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Combobox
                          options={formattedHealthStaff}
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          placeholder="Select health staff"
                          contentClassName="w-[24rem] max-h-60"
                          triggerClassName="flex-1 h-10"
                          emptyMessage={
                            <div className="flex gap-2 justify-center items-center py-2">
                              <Label className="font-normal text-[13px]">No health staff found.</Label>
                            </div>
                          }
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">
                      Date: <span className="text-red-500">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Select date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="signature"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">
                      Signature: <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <SignatureCanvas
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        width={300}
                        height={150}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 bg-gray-50 rounded-md border text-sm">
                <p className="font-medium text-gray-700 mb-1">Household Definition</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  As defined by the Philippine Statistical Authority (PSA), a household is a social unit consisting of a
                  person living alone or a group of persons who sleep in the same housing unit and have a common
                  arrangement in the preparation and consumption of food.
                </p>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
})

SurveyIdentificationForm.displayName = "SurveyIdentificationForm"

export default SurveyIdentificationForm

