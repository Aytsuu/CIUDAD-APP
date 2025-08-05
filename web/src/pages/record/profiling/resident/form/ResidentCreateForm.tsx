"use client";

import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { useResidentForm } from "./useResidentForm";
import { useAuth } from "@/context/AuthContext";
import { Origin, Type } from "../../ProfilingEnums";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card, CardContent, CardHeader } from "@/components/ui/card/card";
import { capitalizeAllFields } from "@/helpers/capitalize";
import {
  useAddAddress,
  useAddPerAddress,
  useAddResidentAndPersonal,
} from "../../queries/profilingAddQueries";
import {
  useResidentsList,
  useSitioList,
} from "../../queries/profilingFetchQueries";
import {
  useResidentsListHealth,
  useSitioListHealth,
} from "../../../health-family-profiling/family-profling/queries/profilingFetchQueries";
import { formatResidents, formatSitio } from "../../ProfilingFormats";
import { useLoading } from "@/context/LoadingContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  User,
  FileText,
  Shield,
  UserRoundPlus,
} from "lucide-react";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export default function ResidentCreateForm({
  params,
}: {
  params: Record<string, any>;
}) {
  // ============= STATE INITIALIZATION ===============
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  const {
    form,
    defaultValues,
    populateFields,
    checkDefaultValues,
  } = useResidentForm("", params?.origin);

  const [addresses, setAddresses] = React.useState<any[]>([
    {
      add_province: "",
      add_city: "",
      add_barangay: "",
      sitio: "",
      add_external_sitio: "",
      add_street: "",
    },
  ]);

  const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal();
  const { mutateAsync: addAddress } = useAddAddress();
  const { mutateAsync: addPersonalAddress } = useAddPerAddress();

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isAssignmentOpen, setIsAssignmentOpen] =
    React.useState<boolean>(false);
  const [isAllowSubmit, setIsAllowSubmit] = React.useState<boolean>(false);
  const [validAddresses, setValidAddresses] = React.useState<boolean[]>([]);

  const { data: residentsList, isLoading: isLoadingResidents } =
    useResidentsList(params?.origin === Origin.Administration);
  const { data: residentsListHealth, isLoading: isLoadingResidentsHealth } =
    useResidentsListHealth();
  const { data: sitioList, isLoading: isLoadingSitio } = useSitioList();
  const { data: sitioListHealth, isLoading: isLoadingSitioHealth } =
    useSitioListHealth();

  // Formatted data - prioritize main database but fallback to health database
  const formattedSitio = React.useMemo(
    () => formatSitio(sitioList) || formatSitio(sitioListHealth) || [],
    [sitioList, sitioListHealth]
  );

  const formattedResidents = React.useMemo(
    () =>
      formatResidents(residentsList) ||
      formatResidents(residentsListHealth) ||
      [],
    [residentsList, residentsListHealth]
  );

  const isLoading =
    isLoadingResidents ||
    isLoadingSitio ||
    isLoadingResidentsHealth ||
    isLoadingSitioHealth;

  // ================== SIDE EFFECTS ==================
  React.useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      setIsAllowSubmit(!checkDefaultValues(value, defaultValues));
    });
    return () => subscription.unsubscribe();
  }, [form, checkDefaultValues, defaultValues]);

  // ==================== HANDLERS ====================
  const validateAddresses = React.useCallback(
    (addresses: any[]) => {
      const validity = addresses.map(
        (address: any) =>
          address.add_province !== "" &&
          address.add_city !== "" &&
          address.add_barangay !== "" &&
          (address.add_barangay === "San Roque"
            ? address.sitio !== ""
            : address.add_external_sitio !== "")
      );
      setValidAddresses(validity);
      const isValidAll = validity.every((valid: any) => valid === true);
      return isValidAll;
    },
    [setValidAddresses]
  );

  const handleComboboxChange = React.useCallback(() => {
    const selectedId = form.watch("per_id")?.split(" ")[0];
    if (!selectedId) {
      form.reset();
      return;
    }

    // Try to find data in main database first, then health database
    const mainData = residentsList?.find(
      (resident: any) => resident.rp_id === selectedId
    );
    const healthData = residentsListHealth?.find(
      (resident: any) => resident.rp_id === selectedId
    );

    // Use main database data if available, otherwise use health database data
    const dataToUse = mainData || healthData;

    if (dataToUse?.personal_info) {
      populateFields(dataToUse.personal_info);
      setAddresses(dataToUse.personal_info.per_addresses || addresses);
    }
  }, [form, residentsList, residentsListHealth, populateFields, addresses]);


  const submit = async () => {
    setIsSubmitting(true);

    if(params?.origin === Origin.Administration){
      if(!form.getValues('per_id')) {
        setIsSubmitting(false);
        showErrorToast('Please select a resident for the assignment');
        return;
      }
    }

    if (!(await form.trigger())) {
      setIsSubmitting(false);
      showErrorToast("Please fill out all required fields");
      return;
    }

    if (!validateAddresses(addresses)) {
      setIsSubmitting(false);
      showErrorToast("Please fill out all required fields");
      return;
    }

    try {
      const personalInfo = capitalizeAllFields(form.getValues());

      // Safely get staff_id with proper type checking
      const staffId = user?.staff?.staff_id;

      if (!staffId) {
        throw new Error("Staff information not available");
      }

      const resident = await addResidentAndPersonal({
        personalInfo: personalInfo,
        staffId: staffId
      });

      const new_addresses = await addAddress(addresses)

      await addPersonalAddress({
        data: new_addresses?.map((address: any) => ({
          add: address.add_id,
          per: resident.per.per_id,
        })),
        history_id: resident.per.history
      })
      
      showSuccessToast('Successfully registered new resident!')
      if (params?.isRegistrationTab) {
        params.setResidentId(resident.rp_id);
        params.setAddresses(new_addresses);
        params?.next();
      }
      setIsSubmitting(false);
      form.reset(defaultValues);

    } catch (err) {
      setIsSubmitting(false);
      showErrorToast(
        err instanceof Error ? err.message : "An error occurred"
      );
    }
  };

  // ==================== RENDER HELPERS ======================
  const MainContent = (
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
          formattedResidents={formattedResidents}
          addresses={addresses}
          validAddresses={validAddresses}
          form={form}
          formType={Type.Create}
          isSubmitting={isSubmitting}
          submit={submit}
          origin={params?.origin ? params.origin : ""}
          isReadOnly={params?.origin == Origin.Administration}
          isAllowSubmit={isAllowSubmit}
          setAddresses={setAddresses}
          setValidAddresses={setValidAddresses}
          onComboboxChange={handleComboboxChange}
          isAssignmentOpen={isAssignmentOpen}
          setIsAssignmentOpen={setIsAssignmentOpen}
        />
      </form>
    </Form>
  );

  const residentRegistrationForm = () => (
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
          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800 flex items-center gap-2">
              <strong>Resident Registration:</strong> Please ensure all
              information is accurate as this will be used for official records
              and identification purposes.
            </AlertDescription>
          </Alert>
          <Separator />

          {/* Form Content */}
          <div className="p-6">{MainContent}</div>

          {/* Database Info */}
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800 flex items-center gap-2">
              <strong>Data Security:</strong> All resident information is
              securely stored and encrypted. Access is restricted to authorized
              personnel only.
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

  const standardForm = () => (
    <LayoutWithBack title={params?.title} description={params?.description}>
      <Card className="w-full p-10">
        <div className="pb-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <p className="text-xs text-black/50">Fill out all necessary fields</p>
        </div>
        {MainContent}
      </Card>
    </LayoutWithBack>
  );

  // ==================== MAIN RENDER ======================
  return params?.isRegistrationTab
    ? residentRegistrationForm()
    : standardForm();
}
