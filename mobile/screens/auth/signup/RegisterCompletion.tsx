import { Confirmation } from "@/components/ui/confirmation";
import { supabase } from "@/lib/supabase";
import { v4 as uuid4 } from "uuid";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import {
  useAddPersonal,
  useAddRequest,
  useAddFile,
  useAddRequestFile,
} from "./queries/signupAddQueries";
import React from "react";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import { useRouter } from "expo-router";

export default function RegisterCompletion({ photo, setPhoto }: {
  photo: Uint8Array,
  setPhoto: React.Dispatch<React.SetStateAction<Uint8Array | null>>
}) {
  const router = useRouter();
  const [showFeedback, setShowFeedback] = React.useState(false)
  const [status, setStatus] = React.useState<"success" | "failure">("success")
  const { getValues } = useRegistrationFormContext();
  const { mutateAsync: addPersonal } = useAddPersonal();
  const { mutateAsync: addRequest } = useAddRequest();
  const { mutateAsync: addFile } = useAddFile();
  const { mutateAsync: addRequestFile } = useAddRequestFile();

  const cancel = () => {
    setPhoto(null);
  };

  const submit = async () => {
    try {
      const fileName = `${uuid4()}.jpg`;
      const filePath = `uploads/${fileName}`;
      const { error } = await supabase.storage
        .from("image-bucket")
        .upload(filePath, photo as Uint8Array, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("image-bucket").getPublicUrl(filePath);

      console.log("Upload successful!", publicUrl);

      const values = getValues();
      const personal = await addPersonal(values);
      const request = await addRequest(personal.per_id);
      const file = await addFile({
        name: fileName,
        type: "image/jpeg",
        path: filePath,
        url: publicUrl,
      });
      const requestFile = await addRequestFile({
        requestId: request.req_id,
        fileId: file.file_id,
      });

      if (requestFile) {
        setStatus("success");
        setShowFeedback(true);
      }

    } catch (error) {
      setStatus("failure");
        setShowFeedback(true);
    }
  };

  if (showFeedback) {
    return (
      <FeedbackScreen
        status={status}
        onRetry={() => {
          // Simulate a retry that might succeed
          const willSucceed = Math.random() > 0.5
          setTimeout(() => {
            setStatus(willSucceed ? "success" : "failure")
          }, 1500)
        }}
        onOk={() => router.push('/')}
      />
    )
  }

  return (
    <Confirmation
      title="Are you sure you want to register?"
      description="Please confirm that all the information you provided is correct."
      onConfirm={submit}
      onCancel={cancel}
    />
  );
}
