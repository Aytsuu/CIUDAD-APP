import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { useResidentForm } from "./useResidentForm";
import { Type } from "../../profilingEnums";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";
import { useAddResidentProfile } from "../../queries/profilingAddQueries";
import { useAuth } from "@/context/AuthContext";

export default function ResidentRequestForm({ params }: { params: any }) {
  const { user } = useAuth(); 
  const { mutateAsync: addResidentProfile, isPending: isCreating } = useAddResidentProfile(params);
  const { form, handleSubmitError, handleSubmitSuccess } = useResidentForm(
    params.data?.per
  );
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const reject = async () => {
    handleSubmitError("Rejected");
  }

  const submit = async () => {
    setIsSubmitting(true);
    const isValid = await form.trigger();
    if (!isValid) {
      setIsSubmitting(false);
      handleSubmitError("Please fill out all required fields");
      return;
    }

    await addResidentProfile({
      personalId: params.data?.per.per_id,
      staffId: user?.staff.staff_id,
    });

    if (!isCreating) {
      handleSubmitSuccess(
        "New record created successfully"
      );
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
          <div className="flex flex-col gap-4">
            <PersonalInfoForm
              form={form}
              formType={Type.Request}
              isSubmitting={isSubmitting}
              submit={submit}
              isReadOnly={false}
              reject={reject}
            />
          </div>
        </Form>
      </Card>
    </LayoutWithBack>
  );
}
