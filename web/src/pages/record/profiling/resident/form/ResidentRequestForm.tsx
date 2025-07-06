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
import { ImageModal } from "@/components/image-modal";
import { MediaUploadType } from "@/components/ui/media-upload";
import { useAddResidentAndPersonal } from "../../queries/profilingAddQueries";
import { useUpdateAccount } from "../../queries/profilingUpdateQueries";
import { useSitioList } from "../../queries/profilingFetchQueries";
import { formatSitio } from "../../profilingFormats";

export default function ResidentRequestForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal();
  const { mutateAsync: deleteRequest } = useDeleteRequest();
  const { mutateAsync: updateAccount } = useUpdateAccount();
  const { data: sitioList, isLoading: isLoadingSitio } = useSitioList();
  const { form, handleSubmitError, handleSubmitSuccess } = useResidentForm(
    params.data
  );
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [selectedImage, setSelectedImage] = React.useState<
    MediaUploadType[number] | null
  >();
  const files = params.data?.files || [];

  const formattedSitio = React.useMemo(
    () => formatSitio(sitioList) || [],
    [sitioList]
  );

  // ============= EXPIRATION CALCULATION ===============
  const calculateRemainingTime = React.useMemo(() => {
  if (!params.data?.req_date) return { days: 7, hours: 0 }; // Default to 7 days if no creation date
  
  const createdDate = new Date(params.data.req_date);
  const currentDate = new Date();
  const expirationDate = new Date(createdDate);
  expirationDate.setDate(createdDate.getDate() + 7); // Add 7 days to creation date
  
  const timeDiff = expirationDate.getTime() - currentDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  const hoursDiff = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
  
  return {
    days: Math.max(0, daysDiff),
    hours: Math.max(0, hoursDiff),
    isExpired: timeDiff <= 0
  };
}, [params.data?.req_date]);

const getExpirationMessage = React.useMemo(() => {
  const { days, hours, isExpired } = calculateRemainingTime;
  
  if (isExpired) {
    return "This request has expired and will be archived.";
  }
  
  if (days < 1) {
    if (hours === 1) {
      return "This request will automatically expire and be archived after 1 hour if not approved.";
    } else if (hours === 0) {
      return "This request will expire very soon if not approved.";
    } else {
      return `This request will automatically expire and be archived after ${hours} hours if not approved.`;
    }
  } else if (days === 1) {
    return "This request will automatically expire and be archived after 1 day if not approved.";
  } else {
    return `This request will automatically expire and be archived after ${days} days if not approved.`;
  }
}, [calculateRemainingTime]);

const getExpirationColor = React.useMemo(() => {
  const { days, hours, isExpired } = calculateRemainingTime;
  
  if (isExpired || (days < 1 && hours <= 2)) {
    return {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-500",
      title: "text-red-800",
      text: "text-red-700"
    };
  } else if (days < 1 || days === 1) {
    return {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "text-orange-500",
      title: "text-orange-800",
      text: "text-orange-700"
    };
  } else if (days <= 3) {
    return {
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: "text-amber-500",
      title: "text-amber-800",
      text: "text-amber-700"
    };
  } else {
    return {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-500",
      title: "text-blue-800",
      text: "text-blue-700"
    };
  }
}, [calculateRemainingTime]);

// Update the status display in the JSX
const getStatusDisplay = React.useMemo(() => {
  const { days, hours, isExpired } = calculateRemainingTime;
  
  if (isExpired) {
    return "EXPIRED";
  } else if (days < 1) {
    if (hours === 0) {
      return "EXPIRES VERY SOON";
    } else if (hours === 1) {
      return "EXPIRES IN 1 HOUR";
    } else {
      return `EXPIRES IN ${hours} HOURS`;
    }
  } else if (days === 1) {
    return "EXPIRES TODAY";
  } else {
    return null; // Don't show status for longer periods
  }
}, [calculateRemainingTime]);

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
        <div className={`${getExpirationColor.bg} border ${getExpirationColor.border} rounded-lg p-4`}>
          <div className="flex items-start gap-3">
            <CircleAlert
              size={20}
              className={`${getExpirationColor.icon} mt-0.5 flex-shrink-0`}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${getExpirationColor.title}`}>
                  Request Expiration
                  {getStatusDisplay && (
                    <span className="ml-2 text-xs font-normal">
                      ({getStatusDisplay})
                    </span>
                  )}
                </p>
              </div>
              <p className={`text-sm ${getExpirationColor.text} mt-1`}>
                {getExpirationMessage}
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
                formattedSitio={formattedSitio}
                addresses={params?.data?.addresses}
                form={form}
                formType={Type.Request}
                isSubmitting={isSubmitting}
                submit={submit}
                isReadOnly={false}
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