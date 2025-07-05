import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { useResidentForm } from "./useResidentForm";
import { Type } from "../../profilingEnums";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";
import { useAuth } from "@/context/AuthContext";
import { useDeleteRequest } from "../../queries/profilingDeleteQueries";
import { useNavigate } from "react-router";
import { CircleAlert, ImageIcon, User, ZoomIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageModal } from "@/components/image-modal";
import { MediaUploadType } from "@/components/ui/media-upload";
import { useAddResidentAndPersonal } from "../../queries/profilingAddQueries";
import { useUpdateAccount } from "../../queries/profilingUpdateQueries";

export default function ResidentRequestForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal();
  const { mutateAsync: deleteRequest } = useDeleteRequest();
  const { mutateAsync: updateAccount } = useUpdateAccount();
  const { form, handleSubmitError, handleSubmitSuccess } = useResidentForm(
    params.data
  );
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [selectedImage, setSelectedImage] = React.useState<
    MediaUploadType[number] | null
  >();
  const files = params.data?.files || [];

  // ==================== HANDLERS ====================

  const submit = async () => {
    setIsSubmitting(true);
    const formIsValid = await form.trigger();
    if (!formIsValid) {
      setIsSubmitting(false);
      handleSubmitError("Please fill out all required fields");
      return;
    }

    try {
      addResidentAndPersonal(
        {
          personalInfo: {
            per_id: params.data?.per,
          },
          staffId: user?.staff?.staff_id,
        },
        {
          onSuccess: (newData) => {
            updateAccount(
              {
                accNo: params.data.acc,
                data: { rp: newData.rp_id },
              },
              {
                onSuccess: () => {
                  deleteRequest(params.data.req_id);
                  navigate(-1);
                  handleSubmitSuccess("Request has been approved");
                },
              }
            );
          },
        }
      );
    } catch (error) {
      handleSubmitError("Failed to process request");
    }
  };

  return (
    // ==================== RENDER ====================
    <LayoutWithBack title={params.title} description={params.description}>
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CircleAlert
              size={20}
              className="text-amber-500 mt-0.5 flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-amber-800">
                  Request Expiration
                </p>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                This request will automatically expire and be archived after
                7 days if not approved.
              </p>
            </div>
          </div>
        </div>
        {/* Uploaded Documents */}
        {files.length > 0 && (
          <Card>
            <CardHeader className="mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg">Uploaded Documents</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((media: any, index: number) => (
                  <div key={index} className="group relative">
                    <div
                      className="relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => setSelectedImage(media as any)}
                    >
                      <img
                        src={media.publicUrl}
                        alt={`Supporting document ${index + 1}`}
                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
                        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <ZoomIn size={40} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-center">
                      <p className="text-xs text-gray-600 mt-2 text-center truncate">
                        Photo {index + 1}
                      </p>
                      {media.is_id ? media.id_type : "Face"}
                    </div>
                  </div>
                ))}
              </div>
              <ImageModal
                src={selectedImage?.publicUrl || ""}
                alt="Supporting document"
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
              />
            </CardContent>
          </Card>
        )}

        {/* Personal Information Form */}
        <Card className="w-full p-10">
          <div className="flex justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </div>
              <p className="text-sm text-gray-600">
                Review and verify the submitted information
              </p>
            </div>
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
                addresses={params?.data?.addresses}
                form={form}
                formType={Type.Request}
                isSubmitting={isSubmitting}
                submit={submit}
                isReadOnly={true}
                // setOpenRejectionDialog={setOpenRejectionDialog}
              />
            </form>
          </Form>
        </Card>
        <div className="flex items-center gap-2">
          <CircleAlert size={18} />
          <p className="text-sm">
            By approving this request, you confirm that all information has been
            reviewed and verified. This action will create a new resident record
            and remove the request from the pending list.
          </p>
        </div>
      </div>
    </LayoutWithBack>
  );
}
