import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { useResidentForm } from "./useResidentForm";
import { useAuth } from "@/context/AuthContext";
import { Type } from "../../profilingEnums";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";
import { capitalizeAllFields } from "@/helpers/capitalize";
import { useAddAddress, useAddPerAddress, useAddResidentAndPersonal } from "../../queries/profilingAddQueries";
import { useResidentsList, useSitioList } from "../../queries/profilingFetchQueries";
import { formatResidents, formatSitio } from "../../profilingFormats";
import { useLoading } from "@/context/LoadingContext";

export default function ResidentCreateForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const { user } = useAuth();
  const {showLoading, hideLoading} = useLoading();
  const { form, defaultValues, handleSubmitSuccess, handleSubmitError, populateFields, checkDefaultValues } = useResidentForm('', params.origin);
  const [addresses, setAddresses] = React.useState<any[]>([
    { add_province: '', add_city: '', add_barangay: '', sitio: '', add_external_sitio: '', add_street: ''},
  ]);
  const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal();
  const { mutateAsync: addAddress } = useAddAddress();
  const { mutateAsync: addPersonalAddress} = useAddPerAddress();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = React.useState<boolean>(false);
  const [isAllowSubmit, setIsAllowSubmit] = React.useState<boolean>(false);
  const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList();
  const { data: sitioList, isLoading: isLoadingSitio } = useSitioList();

  const formattedSitio = React.useMemo(() => formatSitio(sitioList) || [], [sitioList]);
  const formattedResidents = React.useMemo(() => formatResidents(residentsList), [residentsList]);

  // ================== SIDE EFFECTS ==================
  React.useEffect(() => {
    if(isLoadingResidents || isLoadingSitio) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [origin, isLoadingResidents, isLoadingSitio])

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
    const formIsValid = await form.trigger();
    if (!formIsValid) {
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
          addAddress(addresses, {
            onSuccess: (new_addresses) => {
              const per_address = new_addresses?.map((address: any) => (
                {add: address.add_id, per: resident.per.per_id}
              ));

              addPersonalAddress(per_address, {
                onSuccess: () => {
                  handleSubmitSuccess(
                    "New record created successfully",  
                    `/resident/additional-registration`,
                    {params: {
                      residentId: resident.rp_id,
                    }}
                  );
          
                  setIsSubmitting(false);
                  form.reset(defaultValues);
                }
              })
            }
          });
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
              formattedSitio={formattedSitio}
              formattedResidents={formattedResidents}
              addresses={addresses}
              form={form}
              formType={Type.Create}
              isSubmitting={isSubmitting}
              submit={submit}
              origin={params.origin ? params.origin : ''}
              isReadOnly={false}
              isAllowSubmit={isAllowSubmit}
              setAddresses={setAddresses}
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
