import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { useResidentForm } from "./useResidentForm";
import { Type } from "../../profilingEnums";
import { useUpdateProfile } from "../../queries/profilingUpdateQueries";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { DataTable } from "@/components/ui/table/data-table";
import { additionalDetailsColumns } from "../ResidentColumns";
import { useFamilyData, useFamilyMembers, useSitioList } from "../../queries/profilingFetchQueries";
import { formatSitio } from "../../profilingFormats";
import { capitalizeAllFields } from "@/helpers/capitalize";
import { useAddAddress, useAddPerAddress } from "../../queries/profilingAddQueries";

export default function ResidentViewForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const data = React.useMemo(() => params.data?.personalInfo, [params.data]);
  const { form, checkDefaultValues, handleSubmitSuccess, handleSubmitError } =
    useResidentForm(data);
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [formType, setFormType] = React.useState<Type>(params.type);
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false);
  const [addresses, setAddresses] = React.useState<Record<string, any>[]>([])
  const { data: familyMembers, isLoading: isLoadingFam } = useFamilyMembers(params.data.familyId);
  const { data: sitioList, isLoading: isLoadingSitio } = useSitioList();
  const { mutateAsync: addAddress } = useAddAddress();
  const { mutateAsync: addPersonalAddress } = useAddPerAddress();

  const family = familyMembers?.results || [];
  const formattedSitio = React.useMemo(() => formatSitio(sitioList) || [], [sitioList]);
 
  // ================= SIDE EFFECTS ==================
  React.useEffect(() => {
    // Set the form values when the component mounts
    if(formType == Type.Viewing) {
      setIsReadOnly(true);
      setAddresses(data.per_addresses);
    }
    formType === Type.Editing && setIsReadOnly(false);
  }, [formType]);

  React.useEffect(() => {
    setAddresses(data.per_addresses);
  }, [data])

  // ==================== HANDLERS ====================
  const submit = async () => {
    setIsSubmitting(true);

    const isValid = await form.trigger();
    if (!isValid) {
      setIsSubmitting(false);
      handleSubmitError("Please fill out all required fields");
      return;
    }

    const isAddressAdded = data.per_addresses.length !== addresses.length;
    const values = form.getValues();

    if (checkDefaultValues({...values, per_addresses: addresses}, 
      {
        ...params.data.personalInfo, 
        per_addresses: data.per_addresses
      }
    )) {
      setIsSubmitting(false);
      setFormType(Type.Viewing);
      handleSubmitError("No changes made");
      return;
    }

    // Add new address to the database
    if (isAddressAdded) {
      addAddress(addresses.slice(
        data.per_addresses.length,
        addresses.length
      ), {
        onSuccess: (new_addresses) => {
          // Format the addresses to match the expected format
          const per_addresses = new_addresses.map((address: any) => {
            return {add: address.add_id, per: params.data.personalInfo.per_id}
          });

          // Link personal address
          addPersonalAddress(per_addresses);
        }}
      )
    }

    // Update the profile and address if any changes were made
    updateProfile({
        personalId: params.data.personalInfo.per_id,
        values: {...values, per_addresses: isAddressAdded ? 
          addresses.slice(0, data.per_addresses.length) : addresses
        },
      },{
        onSuccess: () => {
          handleSubmitSuccess("Profile updated successfully");
          setIsSubmitting(false);
          setFormType(Type.Viewing);
          params.data.personalInfo.per_addresses = addresses;
        },
      }
    );
  };

  return (
    // ==================== RENDER ====================
    <LayoutWithBack
      title="Resident Details"
      description="Information is displayed in a clear, organized, and secure manner."
    >
      <div className="grid gap-8">
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
                addresses={addresses}
                setAddresses={setAddresses}
                form={form}
                formType={formType}
                isSubmitting={isSubmitting}
                submit={submit}
                isReadOnly={isReadOnly}
                setFormType={setFormType}
              />
            </form>
          </Form>
        </Card>
        <Card className="w-full p-10 mb-10">
          <div className="pb-4">
            <h2 className="text-lg font-semibold">Family Details</h2>
            <p className="text-xs text-black/50">Shows additional family details of this resident</p>
            <div className="flex justify-center">
              <div className="w-4/5 mt-5 border rounded-2xl">
                <DataTable 
                  columns={additionalDetailsColumns(params.data.residentId, params.data.familyId)} 
                  data={family}
                  headerClassName="bg-transparent hover:bg-transparent"
                  isLoading={isLoadingFam || isLoadingSitio}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </LayoutWithBack>
  );
}
