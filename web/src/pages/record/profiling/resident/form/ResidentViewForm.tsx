import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { useResidentForm } from "./useResidentForm";
import { Type } from "../../profilingEnums";
import { useUpdateProfile } from "../../queries/profilingUpdateQueries";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";

export default function ResidentViewForm({ params }: { params: any }) {
  const { form, checkDefaultValues, handleSubmitSuccess, handleSubmitError } =
    useResidentForm(params.data?.per);
  const { mutateAsync: updateProfile, isPending: isUpdating } =
    useUpdateProfile();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [formType, setFormType] = React.useState<Type>(params.type);
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false);

  React.useEffect(() => {
    formType === Type.Viewing && setIsReadOnly(true);
    formType === Type.Editing && setIsReadOnly(false);
  }, [formType]);

  const submit = async () => {
    setIsSubmitting(true);

    const isValid = await form.trigger();
    if (!isValid) {
      setIsSubmitting(false);
      handleSubmitError("Please fill out all required fields");
      return;
    }

    const values = form.getValues();
    if (checkDefaultValues(values, params.data?.per)) {
      setIsSubmitting(false);
      setFormType(Type.Viewing);
      handleSubmitError("No changes made");
      return;
    }

    await updateProfile({
      personalId: params.data.per.per_id,
      values: values,
    });

    if (!isUpdating) {
      handleSubmitSuccess("Profile updated successfully");
      setIsSubmitting(false);
      setFormType(Type.Viewing);
      params.data.per = values;
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
            onSubmit={form.handleSubmit(submit)}
            className="flex flex-col gap-4"
          >
            <PersonalInfoForm
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
    </LayoutWithBack>
  );
}
