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
import { useFamilyData, useFamilyMembers } from "../../queries/profilingFetchQueries";

export default function ResidentViewForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const { form, checkDefaultValues, handleSubmitSuccess, handleSubmitError } =
    useResidentForm(params.data.personalInfo);
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [formType, setFormType] = React.useState<Type>(params.type);
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false);
  const [addresses, setAddresses] = React.useState<Record<string, any>[]>(
    params.data.personalInfo.per_addresses
  )
  const { data: familyMembers, isLoading } = useFamilyMembers(params.data.familyId);

  const family = familyMembers?.results || [];

  // ================= SIDE EFFECTS ==================
  React.useEffect(() => {
    formType === Type.Viewing && setIsReadOnly(true);
    formType === Type.Editing && setIsReadOnly(false);
  }, [formType]);

  // ==================== HANDLERS ====================
  const submit = async () => {
    setIsSubmitting(true);

    const isValid = await form.trigger();
    if (!isValid) {
      setIsSubmitting(false);
      handleSubmitError("Please fill out all required fields");
      return;
    }

    const values = form.getValues();
    if (checkDefaultValues(values, params.data)) {
      setIsSubmitting(false);
      setFormType(Type.Viewing);
      handleSubmitError("No changes made");
      return;
    }

    await updateProfile(
      {
        personalId: params.data.per_id,
        values: values,
      },
      {
        onSuccess: () => {
          handleSubmitSuccess("Profile updated successfully");
          setIsSubmitting(false);
          setFormType(Type.Viewing);
          params.data = values;
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
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </LayoutWithBack>
  );
}
