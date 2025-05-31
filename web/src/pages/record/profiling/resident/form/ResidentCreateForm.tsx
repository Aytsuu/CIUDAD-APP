import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { useResidentForm } from "./useResidentForm";
import { useAuth } from "@/context/AuthContext";
import { Type } from "../../profilingEnums";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";
import { capitalizeAllFields } from "@/helpers/capitalize";
import { useAddResidentAndPersonal } from "../../queries/profilingAddQueries";
import { useResidentsList } from "../../queries/profilingFetchQueries";
import { formatResidents } from "../../profilingFormats";
import { useLoading } from "@/context/LoadingContext";

export default function ResidentCreateForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const { user } = useAuth();
  const {showLoading, hideLoading} = useLoading();
  const { form, defaultValues, handleSubmitSuccess, handleSubmitError, populateFields, checkDefaultValues } = useResidentForm('', params.origin);
  const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = React.useState<boolean>(false);
  const [isAllowSubmit, setIsAllowSubmit] = React.useState<boolean>(false);
  const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList();
  const formattedResidents = React.useMemo(() => formatResidents(residentsList), [residentsList]);
  
    React.useEffect(() => {
      if(isLoadingResidents) {
        showLoading();
      } else {
        hideLoading();
      }
    }, [origin, isLoadingResidents])

  // ================== SIDE EFFECTS ==================
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      setIsAllowSubmit(!checkDefaultValues(value, defaultValues));
    });
    return () => subscription.unsubscribe();
  }, []);

  // ==================== HANDLERS ====================
  const handleComboboxChange = React.useCallback(() => { 
    const data = residentsList.find(
      (resident: any) => resident.rp_id === form.watch("per_id").split(" ")[0]
    );

    populateFields(data?.personal_info);
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
      addResidentAndPersonal({
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
    <LayoutWithBack title={params.title} description={params.description} >
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
              formattedResidents={formattedResidents}
              form={form}
              formType={Type.Create}
              isSubmitting={isSubmitting}
              submit={submit}
              origin={params.origin ? params.origin : ''}
              isReadOnly={false}
              isAllowSubmit={isAllowSubmit}
              onComboboxChange={handleComboboxChange}
              isAssignmentOpen={isAssignmentOpen}
              setIsAssignmentOpen={setIsAssignmentOpen}
            />
          </form>
        </Form>
      </Card>
    </LayoutWithBack>
  );
}
