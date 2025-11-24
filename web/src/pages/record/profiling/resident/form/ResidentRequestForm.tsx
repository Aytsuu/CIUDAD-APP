import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { Type } from "../../ProfilingEnums";
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import { MoveRight, UserRoundPlus } from "lucide-react";
import { useSitioList } from "../../queries/profilingFetchQueries";
import { formatSitio } from "../../ProfilingFormats";
import { showErrorToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button/button";

export default function ResidentRequestForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const { data: sitioList } = useSitioList();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [addresses, setAddresses] = React.useState<any[]>([])

  const formattedSitio = React.useMemo(
    () => formatSitio(sitioList) || [], 
    [sitioList]
  );

  console.log(params.data)

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
        { key: "personalSchema.per_disability", value: resident?.per_disability || "" },  
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
        </CardContent>
      </Card>
    </div>
  );
}
