import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormInput } from "@/components/ui/form/form-input";
import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateHealthRelatedDetails, useUpdateMotherHealthInfo, useUpdateDependentsUnderFive, useCreateDependentsUnderFive } from "./family-profling/queries/profilingUpdateQueries";
import { Loader2, User, Heart, Baby } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const editMemberHealthSchema = z.object({
  // Health Related Details (for non-under-five members)
  per_add_bloodType: z.string().optional(),
  per_add_philhealth_id: z.string().optional(),
  per_add_covid_vax_status: z.string().optional(),
  
  // Mother Health Info (optional, only for mothers)
  mhi_healthRisk_class: z.string().optional(),
  mhi_immun_status: z.string().optional(),
  mhi_famPlan_method: z.array(z.string()).optional(),
  mhi_famPlan_source: z.string().optional(),
  mhi_lmp_date: z.string().optional(),
  
  // Under Five Dependents Info (optional, only for dependents under 5)
  duf_fic: z.string().optional(),
  duf_nutritional_status: z.string().optional(),
  duf_exclusive_bf: z.string().optional(),
});

type EditMemberHealthFormData = z.infer<typeof editMemberHealthSchema>;

interface EditMemberHealthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: any;
}

export function EditMemberHealthModal({ open, onOpenChange, member }: EditMemberHealthModalProps) {
  const updateHealthDetails = useUpdateHealthRelatedDetails();
  const updateMotherHealth = useUpdateMotherHealthInfo();
  const updateUnderFive = useUpdateDependentsUnderFive();
  const createUnderFive = useCreateDependentsUnderFive();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate age to determine if under 5
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(member?.personal_info?.date_of_birth);
  const isDependent = member?.role?.toLowerCase() === "dependent";
  const isUnderFive = isDependent && age < 5;
  const isMother = member?.role?.toLowerCase() === "mother";
  const hasMotherHealthInfo = member?.mother_health_info && Object.keys(member.mother_health_info).length > 0;
  const hasUnderFiveData = member?.under_five && Object.keys(member.under_five).length > 0;

  const form = useForm<EditMemberHealthFormData>({
    resolver: zodResolver(editMemberHealthSchema),
    defaultValues: {
      per_add_bloodType: "",
      per_add_philhealth_id: "",
      per_add_covid_vax_status: "",
      mhi_healthRisk_class: "",
      mhi_immun_status: "",
      mhi_famPlan_method: [],
      mhi_famPlan_source: "",
      mhi_lmp_date: "",
      duf_fic: "",
      duf_nutritional_status: "",
      duf_exclusive_bf: "",
    },
  });

  // Populate form when member data changes
  useEffect(() => {
    if (member) {
      const healthDetails = member.per_additional_details || member.health_details || {};
      const motherHealth = member.mother_health_info || {};
      const underFiveData = member.under_five || {};

      // Parse family planning method if it's a string
      let famPlanMethods: string[] = [];
      if (motherHealth.family_planning_method) {
        try {
          // Try to parse if it's JSON string
          famPlanMethods = JSON.parse(motherHealth.family_planning_method);
        } catch {
          // If not JSON, treat as comma-separated string or single value
          if (motherHealth.family_planning_method.includes(',')) {
            famPlanMethods = motherHealth.family_planning_method.split(',').map((m: string) => m.trim());
          } else {
            famPlanMethods = [motherHealth.family_planning_method];
          }
        }
      }

      form.reset({
        per_add_bloodType: healthDetails.blood_type || healthDetails.per_add_bloodType || "",
        per_add_philhealth_id: healthDetails.philhealth_id || healthDetails.per_add_philhealth_id || "",
        per_add_covid_vax_status: healthDetails.covid_vax_status || healthDetails.per_add_covid_vax_status || "",
        mhi_healthRisk_class: motherHealth.health_risk_class || "",
        mhi_immun_status: motherHealth.immunization_status || "",
        mhi_famPlan_method: famPlanMethods,
        mhi_famPlan_source: motherHealth.family_planning_source || "",
        mhi_lmp_date: motherHealth.lmp_date || "",
        duf_fic: underFiveData.fic || "",
        duf_nutritional_status: underFiveData.nutritional_status || "",
        duf_exclusive_bf: underFiveData.exclusive_bf || "",
      });
    }
  }, [member, form]);

  const onSubmit = async (data: EditMemberHealthFormData) => {
    setIsSubmitting(true);
    try {
      console.log("=== Update Member Health Debug ===");
      console.log("Member:", member);
      console.log("Member.under_five:", member?.under_five);
      console.log("Member.mother_health_info:", member?.mother_health_info);
      console.log("Is Under Five:", isUnderFive);
      console.log("Has Under Five Data:", hasUnderFiveData);
      console.log("Is Mother:", isMother);
      console.log("Has Mother Health Info:", hasMotherHealthInfo);
      console.log("Form Data:", data);

      let updateCount = 0;

      // Update or create under-five health info for dependents under 5
      if (isUnderFive) {
        const underFivePayload = {
          duf_fic: data.duf_fic,
          duf_nutritional_status: data.duf_nutritional_status,
          duf_exclusive_bf: data.duf_exclusive_bf,
        };

        if (member.under_five && member.under_five.duf_id) {
          // Update existing record
          console.log("Updating under-five with payload:", underFivePayload);
          console.log("Under-five ID:", member.under_five.duf_id);

          const result = await updateUnderFive.mutateAsync({
            duf_id: member.under_five.duf_id,
            data: underFivePayload,
          });
          console.log("Under-five update result:", result);
          updateCount++;
        } else {
          // Create new record
          console.log("Creating new under-five record with payload:", underFivePayload);
          
          if (!member.family_composition_id || !member.resident_id) {
            console.error("Missing required IDs for creating under-five record:", member);
            toast.error("Cannot create under-five record: missing family composition or resident ID.");
          } else {
            const createPayload = {
              ...underFivePayload,
              fc: member.family_composition_id,
              rp: member.resident_id,
            };
            
            console.log("Create payload with IDs:", createPayload);
            const result = await createUnderFive.mutateAsync(createPayload);
            console.log("Under-five create result:", result);
            updateCount++;
          }
        }
      } else if (!isUnderFive) {
        console.log("Attempting health details update...");
        
        // Update health related details for non-under-five members
        const healthDetailsPayload = {
          per_add_bloodType: data.per_add_bloodType,
          per_add_philhealth_id: data.per_add_philhealth_id,
          per_add_covid_vax_status: data.per_add_covid_vax_status,
        };

        console.log("Updating health details with payload:", healthDetailsPayload);
        console.log("Resident ID:", member.resident_id);

        const result = await updateHealthDetails.mutateAsync({
          rp_id: member.resident_id,
          data: healthDetailsPayload,
        });
        console.log("Health details update result:", result);
        updateCount++;
      }

      // Update mother health info if applicable
      if (isMother && hasMotherHealthInfo) {
        console.log("Attempting mother health update...");
        
        if (member.mother_health_info && member.mother_health_info.mhi_id) {
          // Convert array to comma-separated string for backend
          const famPlanMethodString = data.mhi_famPlan_method?.join(', ') || '';
          
          const motherHealthPayload = {
            mhi_healthRisk_class: data.mhi_healthRisk_class,
            mhi_immun_status: data.mhi_immun_status,
            mhi_famPlan_method: famPlanMethodString,
            mhi_famPlan_source: data.mhi_famPlan_source,
            mhi_lmp_date: data.mhi_lmp_date,
          };

          console.log("Updating mother health with payload:", motherHealthPayload);
          console.log("Mother Health ID:", member.mother_health_info.mhi_id);

          const result = await updateMotherHealth.mutateAsync({
            mhi_id: member.mother_health_info.mhi_id,
            data: motherHealthPayload,
          });
          console.log("Mother health update result:", result);
          updateCount++;
        } else {
          console.error("Mother has no mhi_id! Member data:", member);
          toast.error("This mother doesn't have a health record ID. Please contact support.");
        }
      }

      console.log(`Successfully completed ${updateCount} update(s)`);
      
      if (updateCount === 0) {
        toast.warning("No updates were made. Please check if the member has editable health information.");
      } else {
        toast.success(`Successfully updated ${updateCount} health record(s)!`);
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating member health info:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message || "Failed to update health information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Watch family planning methods
  const selectedMethods = form.watch("mhi_famPlan_method") || [];
  const noFamilyPlanningSelected = selectedMethods.includes("No Family Planning");
  const showFamilyPlanningSource = selectedMethods.length > 0 && !noFamilyPlanningSelected;

  // Clear source when "No Family Planning" is selected
  useEffect(() => {
    if (noFamilyPlanningSelected) {
      form.setValue("mhi_famPlan_source", "");
    }
  }, [noFamilyPlanningSelected, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            Edit Health Information
          </DialogTitle>
          <DialogDescription>
            Update health details for {member?.personal_info?.first_name} {member?.personal_info?.last_name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Under-Five Dependents Health Section */}
            {isUnderFive ? (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Baby className="h-4 w-4" />
                  Under-Five Dependent Health Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormSelect
                    control={form.control}
                    name="duf_fic"
                    label="Fully Immunized Child (FIC)"
                    options={[
                      { id: "Yes", name: "Yes" },
                      { id: "No", name: "No" },
                    ]}
                  />
                  <FormInput
                    control={form.control}
                    name="duf_nutritional_status"
                    label="Nutritional Status"
                    placeholder="Enter nutritional status"
                  />
                  <FormSelect
                    control={form.control}
                    name="duf_exclusive_bf"
                    label="Exclusive Breastfeeding"
                    options={[
                      { id: "Yes", name: "Yes" },
                      { id: "No", name: "No" },
                    ]}
                  />
                </div>
              </div>
            ) : (
              /* Health Related Details Section (for non-under-five members) */
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Health Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormSelect
                    control={form.control}
                    name="per_add_bloodType"
                    label="Blood Type"
                    options={[
                      { id: "A+", name: "A+" },
                      { id: "A-", name: "A-" },
                      { id: "B+", name: "B+" },
                      { id: "B-", name: "B-" },
                      { id: "AB+", name: "AB+" },
                      { id: "AB-", name: "AB-" },
                      { id: "O+", name: "O+" },
                      { id: "O-", name: "O-" },
                      { id: "unknown", name: "Unknown" },
                    ]}
                  />
                  <FormInput
                    control={form.control}
                    name="per_add_philhealth_id"
                    label="PhilHealth ID"
                    placeholder="Enter PhilHealth ID"
                  />
                  <FormSelect
                    control={form.control}
                    name="per_add_covid_vax_status"
                    label="COVID Vaccination Status"
                    options={[
                      { id: "Not Vaccinated", name: "Not Vaccinated" },
                      { id: "1st Dose", name: "1st Dose" },
                      { id: "2nd Dose", name: "2nd Dose" },
                      { id: "Booster Shot", name: "Booster Shot" },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Mother Health Info Section (only for mothers) */}
            {isMother && hasMotherHealthInfo && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Mother Health Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormSelect
                      control={form.control}
                      name="mhi_healthRisk_class"
                      label="Health Risk Class"
                      options={[
                        { id: "Pregnant", name: "Pregnant" },
                        { id: "Adolescent Pregnant", name: "Adolescent Pregnant" },
                        { id: "Post Partum", name: "Post Partum" },
                      ]}
                    />
                    <FormSelect
                      control={form.control}
                      name="mhi_immun_status"
                      label="Immunization Status"
                      options={[
                        { id: "TT1", name: "TT1" },
                        { id: "TT2", name: "TT2" },
                        { id: "TT3", name: "TT3" },
                        { id: "TT4", name: "TT4" },
                        { id: "TT5", name: "TT5" },
                        { id: "FIM", name: "FIM" },
                      ]}
                    />
                    <FormDateTimeInput
                      control={form.control}
                      name="mhi_lmp_date"
                      label="Last Menstrual Period (LMP)"
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <FormComboCheckbox
                      control={form.control}
                      name="mhi_famPlan_method"
                      label="Family Planning Method"
                      placeholder="Select Method"
                      maxDisplayValues={5}
                      exclusiveOptionId="No Family Planning"
                      options={[
                        { id: "Pills", name: "Pills" },
                        { id: "DMPA", name: "DMPA" },
                        { id: "Condom", name: "Condom" },
                        { id: "IUD-I", name: "IUD-I" },
                        { id: "IUD-PP", name: "IUD-PP" },
                        { id: "Implant", name: "Implant" },
                        { id: "Cervical Mucus Method", name: "Cervical Mucus Method" },
                        { id: "Basal Body Temp", name: "Basal Body Temp" },
                        { id: "Vasectomy", name: "Vasectomy" },
                        { id: "No Family Planning", name: "No Family Planning" },
                      ]}
                    />
                    {showFamilyPlanningSource && (
                      <FormSelect
                        control={form.control}
                        name="mhi_famPlan_source"
                        label="Family Planning Source"
                        options={[
                          { id: "Health Center", name: "Health Center" },
                          { id: "Hospital", name: "Hospital" },
                          { id: "Pharmacy", name: "Pharmacy" },
                          { id: "Others", name: "Others" },
                        ]}
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
