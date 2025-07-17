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
import { CircleAlert, FileText, MapPin, Shield, User, UserRoundPlus } from "lucide-react";
import { useAddResidentAndPersonal } from "../../queries/profilingAddQueries";
import { useUpdateAccount } from "../../queries/profilingUpdateQueries";
import { useSitioList } from "../../queries/profilingFetchQueries";
import { formatSitio } from "../../profilingFormats";
import { useDispatch } from "react-redux";
import { accountCreated } from "@/redux/addRegSlice";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@radix-ui/react-separator";

export default function ResidentRequestForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal();
  const { mutateAsync: deleteRequest } = useDeleteRequest();
  const { mutateAsync: updateAccount } = useUpdateAccount();
  const { data: sitioList, isLoading: isLoadingSitio } = useSitioList();
  const { form } = useResidentForm(params.data);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

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
    const hoursDiff = Math.floor(
      (timeDiff % (1000 * 3600 * 24)) / (1000 * 3600)
    );

    return {
      days: Math.max(0, daysDiff),
      hours: Math.max(0, hoursDiff),
      isExpired: timeDiff <= 0,
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
        text: "text-red-700",
      };
    } else if (days < 1 || days === 1) {
      return {
        bg: "bg-orange-50",
        border: "border-orange-200",
        icon: "text-orange-500",
        title: "text-orange-800",
        text: "text-orange-700",
      };
    } else if (days <= 3) {
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: "text-amber-500",
        title: "text-amber-800",
        text: "text-amber-700",
      };
    } else {
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: "text-blue-500",
        title: "text-blue-800",
        text: "text-blue-700",
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
      showErrorToast("Please fill out all required fields");
      return;
    }

    try {
      addResidentAndPersonal({
        personalInfo: {
          per_id: params.data?.per_id,
        },
        staffId: user?.staff?.staff_id,
      }, {
        onSuccess: (newData) => {
          updateAccount({
            accNo: params.data.acc,
            data: { rp: newData.rp_id },
          }, {
              onSuccess: () => {
                deleteRequest(params.data.req_id);
                showSuccessToast("Request Approved!");
                params?.setResidentId(newData.rp_id);
                params?.setAddresses(params?.data.addresses)
                params?.next();
              },
            }
          );
        },
      });
    } catch (error) {
      showErrorToast("Failed to process request");
    }
  };

  return (
    // ==================== RENDER ====================
    <div className="w-full flex justify-center px-4">
          <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <UserRoundPlus className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Resident Registration
              </h2>
              <p className="max-w-2xl mx-auto leading-relaxed">
                Create a comprehensive profile for a new resident. This includes
                personal information, contact details, and address information.
              </p>
            </CardHeader>
    
            <CardContent className="space-y-6">
              {/* Form Content */}
              <div className="space-y-6">
                <div className={`${getExpirationColor.bg} border ${getExpirationColor.border} rounded-lg p-4`}>
                  <div className="flex items-start gap-3">
                    <CircleAlert
                      size={20}
                      className={`${getExpirationColor.icon} mt-0.5 flex-shrink-0`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${getExpirationColor.title}`}
                        >
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
                        isReadOnly={true}
                      />
                    </form>
                  </Form>
                </Card>
              </div>
    
              {/* Database Info */}
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800 flex items-center gap-2">
                  By approving this request, you confirm that all information has been
                  reviewed and verified. This action will create a new resident record
                  and remove the request from the pending list.
                </AlertDescription>
              </Alert>
    
              {/* Help Section */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">
                  Need assistance with resident registration? Contact your system
                  administrator for help.
                </p>
                <div className="flex justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Personal Info
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Address Details
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Documentation
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Secure Storage
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
  );
}
