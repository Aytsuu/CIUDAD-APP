import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { useResidentForm } from "./useResidentForm";
import { Type } from "../../ProfilingEnums";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";
import { useAuth } from "@/context/AuthContext";
import { useDeleteRequest } from "../../queries/profilingDeleteQueries";
import { CircleAlert, FileText, MapPin, MoveRight, Shield, User, UserRoundPlus } from "lucide-react";
import { useAddResidentAndPersonal } from "../../queries/profilingAddQueries";
import { useUpdateAccount } from "../../queries/profilingUpdateQueries";
import { useSitioList } from "../../queries/profilingFetchQueries";
import { formatSitio } from "../../ProfilingFormats";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRequestExpiration } from "../useRequestExpiration";
import { Button } from "@/components/ui/button/button";

export default function ResidentRequestForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const { user } = useAuth();
  const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal();
  const { mutateAsync: deleteRequest } = useDeleteRequest();
  const { mutateAsync: updateAccount } = useUpdateAccount();
  const { data: sitioList } = useSitioList();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [addresses, setAddresses] = React.useState<any[]>([])
  // const { 
  //   getExpirationColor,
  //   getExpirationMessage,
  //   getStatusDisplay 
  // } = useRequestExpiration(params.data?.req_date);

  const formattedSitio = React.useMemo(
    () => formatSitio(sitioList) || [], 
    [sitioList]
  );

  // ==================== SIDE EFFECTS ======================
  React.useEffect(() => {
    const per_addresses = params?.form?.getValues().personalSchema.per_addresses
    if(per_addresses?.length > 0) setAddresses(per_addresses)
  }, [params?.form])

  React.useEffect(() => {
      const resident = params?.data;
      const fields = [
        { key: "personalSchema.per_id", value: String(resident?.per_id) || ""},
        { key: "personalSchema.per_lname", value: resident?.per_lname || "" },
        { key: "personalSchema.per_fname", value: resident?.per_fname || "" },
        { key: "personalSchema.per_mname", value: resident?.per_mname || "" },
        { key: "personalSchema.per_suffix", value: resident?.per_suffix || "" },
        { key: "personalSchema.per_sex", value: resident?.per_sex || "" },
        { key: "personalSchema.per_dob", value: resident?.per_dob || "" },
        { key: "personalSchema.per_status", value: resident?.per_status|| ""  },
        { key: "personalSchema.per_religion", value: resident?.per_religion || "" },
        { key: "personalSchema.per_edAttainment", value: resident?.per_edAttainment || "" },
        { key: "personalSchema.per_contact", value: resident?.per_contact || "" },  
        { key: "personalSchema.per_addresses", value: resident?.per_addresses || [] },
      ];
  
      fields.map((f: any) => {
        params?.form.setValue(f.key , f.value);
      });
  
    },[params?.data]);

  // ==================== HANDLERS ====================
  const handleContinue = async () => {
    if (!(await params?.form.trigger(["personalSchema"]))) {
      setIsSubmitting(false);
      showErrorToast("Please fill out all required fields");
      return;
    }

    params?.next(true)

    // try {
    //   const resident = await addResidentAndPersonal({
    //     personalInfo: {
    //       per_id: params.data?.per_id,
    //     },
    //     staffId: user?.staff?.staff_id,
    //   });

    //   await updateAccount({
    //     accNo: params.data.acc,
    //     data: { rp: resident.rp_id },
    //   }, {
    //       onSuccess: () => {
    //         deleteRequest(params.data.req_id);
    //         showSuccessToast("Request Approved!");
    //         params?.setResidentId(resident.rp_id);
    //         params?.setAddresses(params?.data.addresses)
    //         params?.next();
    //       },
    //     }
    //   );
    // } catch (error) {
    //   showErrorToast("Failed to process request");
    //   setIsSubmitting(false);
    // }
  };

  return (
    // ==================== RENDER ====================
    <div className="w-full flex justify-center px-4">
      <Card className="w-full shadow-none max-h-[700px] overflow-y-auto">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserRoundPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Resident Registration
          </h2>
          <p className="mx-auto leading-relaxed">
            Create a comprehensive profile for a new resident. This includes
            personal information, contact details, and address information.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Form Content */}
          <div className="space-y-6">
            {/* <div className={`${getExpirationColor.bg} border ${getExpirationColor.border} rounded-lg p-4`}>
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
            </div> */}

            {/* Personal Information Form */}
            <div className="p-6">
              <Form {...params?.form}>
                <form className="flex flex-col gap-4">
                  <PersonalInfoForm
                    prefix="personalSchema."
                    formattedSitio={formattedSitio}
                    addresses={addresses}
                    form={params?.form}
                    formType={Type.Request}
                    isSubmitting={isSubmitting}
                    submit={handleContinue}
                    isReadOnly={true}
                    buttonIsVisible={false}
                  />
                </form>
              </Form>
              <div className="flex justify-end">
                <Button onClick={handleContinue}>
                  Continue <MoveRight/>
                </Button>
              </div>
            </div> 
          </div>

          {/* Database Info */}
          {/* <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800 flex items-center gap-2">
              By approving this request, you confirm that all information has been
              reviewed and verified. This action will create a new resident record
              and remove the request from the pending list.
            </AlertDescription>
          </Alert> */}

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
