import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { useResidentForm } from "./useResidentForm";
import { Origin, Type } from "../../ProfilingEnums";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useResidentsList,
  useSitioList,
} from "../../queries/profilingFetchQueries";
import { useLoading } from "@/context/LoadingContext";
import {
  UserRoundPlus,
  MoveRight,
} from "lucide-react";
import { showErrorToast } from "@/components/ui/toast";
import { formatResidents, formatSitio } from "../../ProfilingFormats";
import { Button } from "@/components/ui/button/button";
import { useDebounce } from "@/hooks/use-debounce";

const DEFAULT_ADDRESS = [
  {
    add_province: "",
    add_city: "",
    add_barangay: "",
    sitio: "",
    add_external_sitio: "",
    add_street: "",
  },
]

export default function ResidentCreateForm({ params }: {
  params: Record<string, any>
}) {
  // ============= STATE INITIALIZATION ===============
  const { showLoading, hideLoading } = useLoading();
  const {
    form,
    defaultValues,
    populateFields,
  } = useResidentForm("", params?.origin);
   const [addresses, setAddresses] = React.useState<any[]>(DEFAULT_ADDRESS);
  const [isSubmitting] = React.useState<boolean>(false);
  const [isAssignmentOpen, setIsAssignmentOpen] =
    React.useState<boolean>(false);
  const [isAllowSubmit, setIsAllowSubmit] = React.useState<boolean>(false);
  const [validAddresses, setValidAddresses] = React.useState<boolean[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const { data: residentsList, isLoading: isLoadingResidents } =
    useResidentsList(
      params?.origin === Origin.Administration, // is _staff
      false, // exclude independent
      true, // is search only
      debouncedSearchQuery, // search query
      false // disable query
    );

  const { data: sitioList, isLoading: isLoadingSitio } = useSitioList();

  // Formatted data - prioritize main database but fallback to health database
  const formattedSitio = React.useMemo(
    () => formatSitio(sitioList) || [],
    [sitioList]
  );

  const formattedResidents = React.useMemo(
    () =>
      formatResidents(residentsList) || [],
    [residentsList]
  );

  const isLoading = isLoadingResidents || isLoadingSitio

  // ==================== CALLBACKS ====================
  const validateForm = React.useCallback(async () => {
    const isFormValid = await form.trigger();
    const areAddressesValid = validateAddresses(addresses);
    setIsAllowSubmit(isFormValid && areAddressesValid);
    form.clearErrors();
    setValidAddresses([true, true, true, true, true]);
  }, [form, addresses]);

  const validateAddresses = React.useCallback(
    (addresses: any[]) => {
      const validity = addresses.map(
        (address: any) =>
          address.add_province !== "" &&
          address.add_city !== "" &&
          address.add_barangay !== "" &&
          (address.add_barangay === "SAN ROQUE (CIUDAD)"
            ? address.sitio !== ""
            : address.add_external_sitio !== "")
      );
      setValidAddresses(validity);
      const isValidAll = validity.every((valid: any) => valid === true);
      return isValidAll;
    }, [setValidAddresses]
  );

  const handleComboboxChange = React.useCallback(() => {
    const selectedId = form.watch("per_id")?.split(" ")[0];
    if (!selectedId || selectedId == "undefined") {
      form.reset(defaultValues);
      setAddresses(DEFAULT_ADDRESS)
      return;
    }

    const data = residentsList?.find(
      (resident: any) => resident.rp_id === selectedId
    );

    if (data?.personal_info) {
      populateFields(data.personal_info);
      setAddresses(data.personal_info.per_addresses || addresses);
    }
  }, [form, residentsList, populateFields, addresses]);

  // ================== SIDE EFFECTS ==================
  React.useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  React.useEffect(() => {
    const subscription = form.watch(() => validateForm());
    return () => subscription.unsubscribe();
  }, [form, validateForm]);

  // Also validate when addresses change
  React.useEffect(() => {
    validateForm();
  }, [addresses, validateForm]);


  React.useEffect(() => {
    const per_addresses = params?.form?.getValues().personalSchema.per_addresses
    if(per_addresses?.length > 0) setAddresses(per_addresses)
  }, [params?.form])

  // ==================== HANDLERS ====================
  // Continue for complete resident profiling
  const handleContinue = async () => {
    params?.form.setValue("personalSchema.per_addresses", addresses)
    if (!(await params?.form.trigger(["personalSchema"]))) {
      showErrorToast("Please fill out all required fields");
      return;
    }

    if (!validateAddresses(addresses)) {
      showErrorToast("Please fill out all required fields");
      return;
    }

    params?.next(true)
  }

  // Submit for individual resident profiling (e.g., direct staff assignment)
  const submit = async () => {
    // Validations
    if (!(await form.trigger())) {
      showErrorToast("Please fill out all required fields");
      return;
    }

    if (!validateAddresses(addresses)) {
      showErrorToast("Please fill out all required fields");
      return;
    }
  };

  // ==================== RENDER HELPERS ======================
  const MainContent = (
    <Form {...(params?.isRegistrationTab ? params?.form : form)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-4"
      >
        <PersonalInfoForm
          prefix={params?.isRegistrationTab ? "personalSchema." : ""}
          formattedSitio={formattedSitio}
          formattedResidents={formattedResidents}
          addresses={addresses}
          validAddresses={validAddresses}
          form={params?.isRegistrationTab ? params?.form : form}
          formType={Type.Create}
          isSubmitting={isSubmitting}
          submit={submit}
          origin={params?.origin ? params.origin : ""}
          isReadOnly={false}
          isAllowSubmit={isAllowSubmit}
          buttonIsVisible={!params?.isRegistrationTab}
          setAddresses={setAddresses}
          setValidAddresses={setValidAddresses}
          onComboboxChange={handleComboboxChange}
          isAssignmentOpen={isAssignmentOpen}
          setIsAssignmentOpen={setIsAssignmentOpen}
          setSearchQuery={setSearchQuery}
        />
      </form>
    </Form>
  );

  const residentRegistrationForm = () => (
    <div className="w-full flex justify-center px-4">
      <Card className="w-full shadow-none max-h-[700px] overflow-y-auto">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserRoundPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            Resident Registration
          </h2>
          <p className="mx-auto leading-relaxed">
            Create a comprehensive profile for a new resident. This includes
            personal information, contact details, and address information.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Form Content */}
          <div className="p-6">
            {MainContent}
            <div className="flex justify-end">
              <Button onClick={handleContinue}>
                Continue <MoveRight/>
              </Button>
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