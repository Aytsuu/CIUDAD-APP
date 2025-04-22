import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { useResidentForm } from "./useResidentForm";
import { useAuth } from "@/context/AuthContext";
import { Type } from "../../profilingEnums";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";
import { formatResidents } from "../../profilingFormats";
import { capitalizeAllFields } from "@/helpers/capitalize";
import { useAddResidentAndPersonal } from "../../queries/profilingAddQueries";

export default function ResidentCreateForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const { user } = useAuth();
  const { form, defaultValues, handleSubmitSuccess, handleSubmitError, populateFields, checkDefaultValues } = useResidentForm('',params.origin);
  const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = React.useState<boolean>(false);
  const [isAllowSubmit, setIsAllowSubmit] = React.useState<boolean>(false);
  const formattedResidents = React.useMemo(() => {
    return formatResidents(params);
  }, [params.residents]);

  // ================== SIDE EFFECTS ==================
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      setIsAllowSubmit(!checkDefaultValues(value, defaultValues));
    });
    return () => subscription.unsubscribe();
  }, []);

  // ==================== HANDLERS ====================
  const handleComboboxChange = React.useCallback(() => { 
    const data = params.residents.find(
      (resident: any) => resident.rp_id === form.watch("per_id").split(" ")[0]
    );

    populateFields(data?.per);
  }, [form.watch("per_id")]);

  const submit = async () => {
    setIsSubmitting(true);
    const isValid = await form.trigger();
    if (!isValid) {
      setIsSubmitting(false);
      handleSubmitError("Please fill out all required fields");
      return;
    }

    try {
      const personalInfo = capitalizeAllFields(form.getValues());
      await addResidentAndPersonal({
        personalInfo: personalInfo,
        staffId: user?.staff.staff_id,
      }, {
        onSuccess: (resident) => {
          handleSubmitSuccess(
            "New record created successfully",
            `/account/create`,
            {params: {residentId: resident.rp_id}}
          );
  
          setIsSubmitting(false);
          form.reset(defaultValues);
        }
      });
    } catch (err) {
      throw err;
    }
  };

  return (
    // ==================== RENDER ====================
    <LayoutWithBack title={params.title} description={params.description}>
      <Card className="w-full p-10">
        <div className="pb-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <p className="text-xs text-black/50">Fill out all necessary fields</p>
        </div>
        <Form {...form}>
        <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-col gap-4"
          >
            <PersonalInfoForm
              formattedResidents={formattedResidents} // For combobox
              form={form}
              formType={Type.Create}
              isSubmitting={isSubmitting}
              submit={submit}
              isReadOnly={false}
              isAllowSubmit={isAllowSubmit}
              isAssignmentOpen={isAssignmentOpen} 
              setIsAssignmentOpen={setIsAssignmentOpen}
              origin={params.origin}
              onComboboxChange={handleComboboxChange}
            />
          </form>
        </Form>
      </Card>
    </LayoutWithBack>
  );
}
