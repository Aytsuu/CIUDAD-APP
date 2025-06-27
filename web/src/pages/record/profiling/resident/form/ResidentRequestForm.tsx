import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { useResidentForm } from "./useResidentForm";
import { Type } from "../../profilingEnums";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card/card";
import { useAddResidentProfile } from "../../queries/profilingAddQueries";
import { useAuth } from "@/context/AuthContext";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Label } from "@/components/ui/label";
import { useDeleteRequest } from "../../queries/profilingDeleteQueries";
import { useNavigate } from "react-router";

export default function ResidentRequestForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const { mutateAsync: addResidentProfile } = useAddResidentProfile();
  const { mutateAsync: deleteRequest } = useDeleteRequest();
  const { form, handleSubmitError, handleSubmitSuccess } = useResidentForm(
    params.data?.per
  );
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const files = params.data?.files || [];

  // ==================== =HANDLERS ====================
  // const reject = async () > {
  //   handleSubmitError("Rejected");
  // }

  const submit = async () => {
    setIsSubmitting(true);
    const isValid = await form.trigger();
    if (!isValid) {
      setIsSubmitting(false);
      handleSubmitError("Please fill out all required fields");
      return;
    }

    addResidentProfile({
      personalId: params.data?.per.per_id,
      staffId: user?.staff?.staff_id,
    }, {
      onSuccess: () => {
        deleteRequest(params.data.req_id, {
          onSuccess: () => {
            navigate(-1);
            handleSubmitSuccess(
              "New record created successfully"
            );
          }
        });
      }
    });
  };

  return (
    // ==================== RENDER ====================
    <LayoutWithBack title={params.title} description={params.description}>
      <div className="flex flex-col gap-4">
        {/*Display the uploaded images*/}
        <Card className="w-full flex flex-col gap-4 p-5">
          <Label>Uploaded Image</Label>
          <div className="grid gap-4">
            {files.length > 0 && (
              files.map((file: any) => {
                const photoUrl = file.file.file_url;
                return (
                  <DialogLayout 
                    trigger={<img src={photoUrl} className="object-cover h-full w-20 cursor-pointer"/>}
                    mainContent={
                      <img src={photoUrl} className="object-cover h-full w-full" />
                    }
                  />
                )
              })
            )}
          </div>
        </Card>
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
                // reject={reject}
              />
            </div>
          </Form>
        </Card>
      </div>
    </LayoutWithBack>
  );
}
