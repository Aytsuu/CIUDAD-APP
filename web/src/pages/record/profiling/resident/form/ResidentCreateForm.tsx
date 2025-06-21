import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { useResidentForm } from "./useResidentForm";
import { useAuth } from "@/context/AuthContext";
import { Origin, Type } from "../../profilingEnums";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";
import { capitalizeAllFields } from "@/helpers/capitalize";
import {
  useAddAddress,
  useAddPerAddress,
  useAddResidentAndPersonal,
} from "../../queries/profilingAddQueries";
import {
  useResidentsList,
  useSitioList,
} from "../../queries/profilingFetchQueries";
import { formatResidents, formatSitio } from "../../profilingFormats";
import { useLoading } from "@/context/LoadingContext";

export default function ResidentCreateForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const {
    form,
    defaultValues,
    handleSubmitSuccess,
    handleSubmitError,
    populateFields,
    checkDefaultValues,
  } = useResidentForm("", params.origin);
  const [addresses, setAddresses] = React.useState<any[]>([
    {
      add_province: "",
      add_city: "",
      add_barangay: "",
      sitio: "",
      add_external_sitio: "",
      add_street: "",
    },
  ]);
  const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal();
  const { mutateAsync: addAddress } = useAddAddress();
  const { mutateAsync: addPersonalAddress } = useAddPerAddress();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isAssignmentOpen, setIsAssignmentOpen] =
    React.useState<boolean>(false);
  const [isAllowSubmit, setIsAllowSubmit] = React.useState<boolean>(false);
  const [validAddresses, setValidAddresses] = React.useState<boolean[]>([]);
  const { data: residentsList, isLoading: isLoadingResidents } =
    useResidentsList();
  const { data: sitioList, isLoading: isLoadingSitio } = useSitioList();

  const formattedSitio = React.useMemo(
    () => formatSitio(sitioList) || [],
    [sitioList]
  );
  const formattedResidents = React.useMemo(
    () => formatResidents(residentsList),
    [residentsList]
  );

  // ================== SIDE EFFECTS ==================
  React.useEffect(() => {
    if (isLoadingResidents || isLoadingSitio) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoadingResidents, isLoadingSitio]);

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      setIsAllowSubmit(!checkDefaultValues(value, defaultValues));
    });
    return () => subscription.unsubscribe();
  }, []);

  // ==================== HANDLERS ====================
  const validateAddresses = React.useCallback(
    (addresses: any) => {
      const validity = addresses.map(
        (address: any) =>
          address.add_province !== "" &&
          address.add_city !== "" &&
          address.add_barangay !== "" &&
          (address.add_barangay === "San Roque"
            ? address.sitio !== ""
            : address.add_external_sitio !== "")
      );

      setValidAddresses(validity);
      const isValidAll = validity.every((valid: any) => valid === true);
      return isValidAll;
    },
    [addresses]
  );

  const handleComboboxChange = React.useCallback(() => {
    const data = residentsList.find(
      (resident: any) => resident.rp_id === form.watch("per_id").split(" ")[0]
    );

    populateFields(data?.personal_info);
    setAddresses(data?.personal_info.per_addresses)
  }, [form.watch("per_id")]);

  const submit = async () => {
    setIsSubmitting(true);

    if (!(await form.trigger())) {
      setIsSubmitting(false);
      handleSubmitError("Please fill out all required fields");
      return;
    }

    if (!validateAddresses(addresses)) {
      setIsSubmitting(false);
      handleSubmitError("Please fill out all required fields");
      return;
    }

    try {
      const personalInfo = capitalizeAllFields(form.getValues());
      
      // // Safely get staff_id with proper type checking
      const staffId = user?.djangoUser?.resident_profile?.staff?.staff_id;
      
      if (!staffId) {
        throw new Error("Staff information not available");
      }

      addResidentAndPersonal(
        {
          personalInfo: personalInfo,
          staffId: staffId,
        },
        {
          onSuccess: (resident) => {
            addAddress(addresses, {
              onSuccess: (new_addresses) => {
                const per_address = new_addresses?.map((address: any) => ({
                  add: address.add_id,
                  per: resident.per.per_id,
                }));

                addPersonalAddress(per_address, {
                  onSuccess: () => {
                    handleSubmitSuccess(
                      "New record created successfully",
                      `/resident/additional-registration`,
                      {
                        params: {
                          residentId: resident.rp_id,
                        },
                      }
                    );

                    setIsSubmitting(false);
                    form.reset(defaultValues);
                  },
                });
              },
            });
          },
        }
      );
    } catch (err) {
      setIsSubmitting(false);
      handleSubmitError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
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
              formattedSitio={formattedSitio}
              formattedResidents={formattedResidents}
              addresses={addresses}
              validAddresses={validAddresses}
              form={form}
              formType={Type.Create}
              isSubmitting={isSubmitting}
              submit={submit}
              origin={params.origin ? params.origin : ""}
              isReadOnly={form.watch("per_id") && params.origin == Origin.Administration 
                ? true : false
              }
              isAllowSubmit={isAllowSubmit}
              setAddresses={setAddresses}
              setValidAddresses={setValidAddresses}
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