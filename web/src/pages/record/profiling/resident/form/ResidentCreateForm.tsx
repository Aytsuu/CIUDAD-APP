import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { useResidentForm } from "./useResidentForm";
import {
  useAddPersonal,
  useAddResidentProfile,
} from "../../queries/profilingAddQueries";
import { useAuth } from "@/context/AuthContext";
import { Type } from "../../profilingEnums";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";

export default function ResidentCreateForm({ params }: { params: any }) {
  const { user } = useAuth();
  const { form, defaultValues, handleSubmitSuccess, handleSubmitError } = useResidentForm();
  const { mutateAsync: addPersonal } = useAddPersonal();
  const { mutateAsync: addResidentProfile, isPending: isCreating } = useAddResidentProfile(params);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const submit = async () => {
    setIsSubmitting(true);
    const isValid = await form.trigger();
    if (!isValid) {
      setIsSubmitting(false);
      handleSubmitError("Please fill out all required fields");
      return;
    }

    const personalId = await addPersonal(form.getValues());
    const resident = await addResidentProfile({
      personalId,
      staffId: user?.staff.staff_id,
    });

    if (!isCreating) {
      handleSubmitSuccess(
        "New record created successfully",
        `/account/create`,
        {params: {residentId: resident.rp_id}}
      );

      setIsSubmitting(false);
      form.reset(defaultValues);
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
              formType={Type.Create}
              isSubmitting={isSubmitting}
              submit={submit}
              isReadOnly={false}
            />
          </form>
        </Form>
      </Card>
    </LayoutWithBack>
  );
}
