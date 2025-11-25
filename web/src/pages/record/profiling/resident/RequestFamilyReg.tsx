import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftRight, Check, Info } from "lucide-react";
import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Label } from "@/components/ui/label";
import { formatDate, getDateTimeFormat } from "@/helpers/dateHelper";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { useApproveFamilyRegistration } from "../queries/profilingAddQueries";
import { useAuth } from "@/context/AuthContext";
import { useSafeNavigate } from "@/hooks/use-safe-navigate";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { zodResolver } from "@hookform/resolvers/zod";
import { Combobox } from "@/components/ui/combobox";
import { useHouseholdsList } from "../queries/profilingFetchQueries";
import { useLoading } from "@/context/LoadingContext";
import { formatAddresses, formatHouseholds } from "../ProfilingFormats";
import { FormSelect } from "@/components/ui/form/form-select";
import {
  demographicInfoSchema,
  householdFormSchema,
} from "@/form-schema/profiling-schema";
import { LoadButton } from "@/components/ui/button/load-button";
import { useDebounce } from "@/hooks/use-debounce";
import { calculateAge } from "@/helpers/ageCalculator";

export default function RequestFamilyReg() {
  // ----------------- STATE INITIALIZATION --------------------
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const registrationData = React.useMemo(() => params?.data, [params]);
  const { user } = useAuth();
  const { safeNavigate } = useSafeNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [selectedMember, setSelectedMember] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [invalidHousehold, setInvalidHousehold] =
    React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isSelectExistingHouse, setIsSelectExistingHouse] =
    React.useState<boolean>(true);
  const [addresses, setAddresses] = React.useState<any[]>([]);
  const [occupancyReadOnly, setOccupancyReadOnly] =
    React.useState<boolean>(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 50);
  const { mutateAsync: approveRequest } = useApproveFamilyRegistration();
  const { data: householdsList, isLoading: isLoadingHouseholds } =
    useHouseholdsList(debouncedSearchQuery);

  const currentMember = registrationData.compositions[selectedMember];
  const familyForm = useForm<z.infer<typeof demographicInfoSchema>>({
    resolver: zodResolver(demographicInfoSchema),
    defaultValues: generateDefaultValues(demographicInfoSchema),
  });

  const houseForm = useForm<z.infer<typeof householdFormSchema>>({
    resolver: zodResolver(householdFormSchema),
    defaultValues: generateDefaultValues(householdFormSchema),
  });

  const watchOwnerSelection = houseForm.watch("householdHead");

  // ----------------- FORMATTING --------------------

  const formattedHouseholds = formatHouseholds(householdsList) || [];
  const formattedAddresses = formatAddresses(addresses) || [];
  const formatMembers = (): { id: string; name: string }[] => {
    return registrationData?.compositions?.map(
      (member: Record<string, any>) => {
        const formattedName = `${member.per_fname}${
          member.per_mname && " " + member.per_mname
        } ${member.per_lname}`;

        return {
          id: `${member.per_id}`,
          name: formattedName,
        };
      }
    );
  };

  // ----------------- SIDE EFFECTS --------------------
  React.useEffect(() => {
    if (isLoadingHouseholds) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoadingHouseholds]);

  React.useEffect(() => {
    const ownerData = registrationData?.compositions?.find(
      (member: Record<string, any>) => member.per_id == watchOwnerSelection
    );
    if (ownerData) {
      setAddresses(ownerData?.per_addresses);
    } else {
      setAddresses([]);
    }
  }, [watchOwnerSelection]);

  // ----------------- HANDLERS --------------------
  const HandleAddressDisplay = (address: any) => {
    const parts = [
      address.add_street,
      address.sitio && `SITIO ${address.sitio}`,
      address.add_barangay && `BRGY. ${address.add_barangay}`,
      address.add_city,
      address.add_province,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const submit = async () => {
    const householdId = familyForm.getValues("householdNo");

    // Validation for selecting existing house
    if (
      isSelectExistingHouse &&
      !(await familyForm.trigger()) &&
      !householdId
    ) {
      if (!householdId) setInvalidHousehold(true);
      showErrorToast("Please fill out all required fields");
      return;
    }

    // Validation for new house registration
    if (
      !isSelectExistingHouse &&
      !(await familyForm.trigger(["building", "indigenous"])) &&
      !(await houseForm.trigger())
    ) {
      showErrorToast("Please fill out all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const requestId = params?.data.req_id;
      const familyData = familyForm.getValues();
      const houseData = houseForm.getValues();
      await approveRequest({
        req_id: requestId,
        family: familyData,
        compositions: registrationData?.compositions,
        ...(!isSelectExistingHouse && { house: houseData }),
        ...(householdId != "" && { hh_id: householdId }),
        staff_id: user?.staff?.staff_id,
      });

      showSuccessToast("Request approved successfully!");
      safeNavigate.back();
    } catch (err) {
      showErrorToast("Failed to approve request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }

    // if (formIsValid && householdId) {
    //   try {
    //     const requestId = params?.data.req_id;
    //     const compositions = params?.data.compositions;
    //     const fc_data = [];

    //     const family = await addFamily({
    //       demographicInfo: familyForm.getValues(),
    //       staffId: user?.staff?.staff_id || "",
    //     });

    //     for (const comp of compositions) {
    //       const resident_profile = await addResidentAndPersonal({
    //         personalInfo: {
    //           per_id: comp.per_id,
    //         },
    //         staffId: user?.staff?.staff_id,
    //       });
    //       if (comp.acc) {
    //         await updateAccount({
    //           accNo: comp.acc,
    //           data: { rp: resident_profile.rp_id },
    //         });
    //       }

    //       fc_data.push({
    //         fam: family.fam_id,
    //         fc_role: comp.role,
    //         rp: resident_profile.rp_id,
    //       });
    //     }
    //     await deleteRequest(requestId);
    //     await addFamilyComposition(fc_data);
    //     showSuccessToast("Request Approved!");
    //     safeNavigate.back();
    //   } catch (error) {
    //     showErrorToast("Failed to process request");
    //     setIsSubmitting(false);
    //   }
    // } else {
    //   if (!householdId) setInvalidHousehold(true);
    //   showErrorToast("Please fill out all required fields");
    //   setIsSubmitting(false);
    // }
  };

  const handleHouseholdSelectSwitch = () => {
    if (isSelectExistingHouse) {
      setOccupancyReadOnly(true);
      familyForm.setValue("building", "OWNER");
    } else {
      setOccupancyReadOnly(false);
      familyForm.resetField("building");
    }
    setIsSelectExistingHouse(!isSelectExistingHouse);

    // Clear errors when switched
    setInvalidHousehold(false);
    houseForm.clearErrors();
    familyForm.clearErrors();
  };

  // ----------------- RENDER --------------------
  if (!registrationData) {
    return (
      <LayoutWithBack
        title="Family Registration"
        description="Loading registration details..."
      >
        <Card>
          <CardContent className="p-6">
            <p>Loading registration data...</p>
          </CardContent>
        </Card>
      </LayoutWithBack>
    );
  }

  return (
    <LayoutWithBack
      title="Family Registration Request"
      description="Review and verify family registration information submitted by residents"
    >
      {/* Registration Overview */}
      <Card className="shadow-none rounded-lg">
        <CardHeader className="mb-4">
          <CardTitle>
            <p className="text-[14px] font-medium opacity-80">
              Received on {getDateTimeFormat(registrationData?.req_created_at)}
            </p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Selected Member Details */}
            <div className="col-span-2">
              <Card className="border-gray-300 shadow-none rounded-lg">
                <CardHeader>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Select Family Member (
                      {registrationData.compositions.length})
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {registrationData?.compositions?.map(
                        (member: any, index: number) => (
                          <button
                            key={member.per_id}
                            className={`px-3 py-1.5 rounded-md border text-sm transition-all hover:shadow-sm ${
                              selectedMember === index
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
                            }`}
                            onClick={() => setSelectedMember(index)}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">
                                {member.per_lname} {member.per_fname[0]}.
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs px-1.5 py-0.5 ${
                                  selectedMember === index
                                    ? "bg-blue-400 text-white border-blue-400"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}
                              >
                                {member.role[0]}
                              </Badge>
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <CardTitle className="text-xl flex items-center gap-4">
                      {currentMember.per_fname}{" "}
                      {currentMember.per_mname && `${currentMember.per_mname} `}
                      {currentMember.per_lname} {currentMember.per_suffix}
                      <div className="">
                        <Badge variant={"outline"} className="text-blue-600">
                          {currentMember.role}
                        </Badge>
                      </div>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Complete personal profile and demographic information.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <Label className="text-gray-700 text-xs font-medium">
                          Date of Birth
                        </Label>
                        <p className="font-medium text-sm mt-1">
                          {formatDate(currentMember.per_dob)} (
                          {calculateAge(currentMember.per_dob, "long")})
                        </p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <Label className="text-gray-700 text-xs font-medium">
                          Gender
                        </Label>
                        <p className="font-medium text-sm mt-1">
                          {currentMember.per_sex}
                        </p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <Label className="text-gray-700 text-xs font-medium">
                          Civil Status
                        </Label>
                        <p className="font-medium text-sm mt-1">
                          {currentMember.per_status}
                        </p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <Label className="text-gray-700 text-xs font-medium">
                          Contact Number
                        </Label>
                        <p className="font-medium text-sm mt-1">
                          {currentMember.per_contact || "Not provided"}
                        </p>
                      </div>

                      {currentMember.per_edAttainment && (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <Label className="text-gray-700 text-xs font-medium">
                            Education
                          </Label>
                          <p className="font-medium text-sm mt-1">
                            {currentMember.per_edAttainment}
                          </p>
                        </div>
                      )}

                      {currentMember.per_religion && (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <Label className="text-gray-700 text-xs font-medium">
                            Religion
                          </Label>
                          <p className="font-medium text-sm mt-1">
                            {currentMember.per_religion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />

                  {/* Address Information */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                      Residential Addresses
                    </h4>
                    {currentMember?.per_addresses?.map(
                      (address: any, index: number) => (
                        <div
                          key={address.add_id || index}
                          className="p-4 bg-gray-50 rounded-lg border space-y-3"
                        >
                          <div>
                            <Label className="text-gray-700 text-xs font-medium">
                              Address {index + 1}
                            </Label>
                            <p className="text-gray-900 text-sm font-medium mt-1">
                              {HandleAddressDisplay(address)}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Family Registration Form */}
            <div className="flex flex-col">
              <Form {...familyForm}>
                <form className="space-y-6">
                  <Card className="bg-blue-500 border-none shadow-none rounded-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-white">
                          Family Details
                        </Label>
                      </div>
                    </CardHeader>
                    <CardContent className="bg-white rounded-b-lg ring-1 ring-gray-300 ring-inset">
                      <div className="space-y-4 pt-4">
                        {isSelectExistingHouse && (
                          <div className="grid">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium text-gray-700 block">
                                Household
                                <span className="ml-1 text-red-500">*</span>
                              </Label>
                              <Button
                                variant={"link"}
                                className="text-gray-500 hover:text-blue-600 hover:no-underline"
                                onClick={handleHouseholdSelectSwitch}
                              >
                                <ArrowLeftRight />
                                Register New
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              Choose the household this family belongs to. Each
                              household represents a group of families living in
                              the same area or compound.
                            </p>
                            <Combobox
                              options={formattedHouseholds}
                              value={familyForm.watch(`householdNo`)}
                              onChange={(value: any) =>
                                familyForm.setValue("householdNo", value)
                              }
                              onSearchChange={(value) => setSearchQuery(value)}
                              placeholder="Select a household"
                              contentClassName="w-full"
                              emptyMessage={
                                <div className="flex gap-2 justify-center items-center p-4">
                                  <Info className="h-4 w-4 text-gray-400" />
                                  <div className="text-center">
                                    <Label className="font-normal text-sm text-gray-600 block">
                                      No household found.
                                    </Label>
                                  </div>
                                </div>
                              }
                            />
                            {invalidHousehold && (
                              <Label className="text-[13px] text-red-500 mt-1 block">
                                Household selection is required for family
                                registration
                              </Label>
                            )}
                          </div>
                        )}

                        <div className="space-y-4">
                          {/* Building/Housing Status */}
                          <div>
                            <FormSelect
                              control={familyForm.control}
                              name="building"
                              label="Household Occupancy"
                              options={[
                                { id: "OWNER", name: "OWNER" },
                                { id: "RENTER", name: "RENTER" },
                                { id: "SHARER", name: "SHARER" },
                              ]}
                              readOnly={occupancyReadOnly}
                              required
                            />
                          </div>

                          {/* Indigenous People Classification */}
                          <div>
                            <FormSelect
                              control={familyForm.control}
                              name="indigenous"
                              label="Indigenous"
                              options={[
                                { id: "NO", name: "NO" },
                                { id: "YES", name: "YES" },
                              ]}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </Form>

              {/* Household Form Registration */}
              {!isSelectExistingHouse && (
                <Form {...houseForm}>
                  <form className="w-full max-w-lg grid gap-4 p-5 rounded-lg mt-4 ring-1 ring-gray-300 ring-inset">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">House Information</p>
                        <p className="text-sm text-gray-700">
                          Fill all required fields
                        </p>
                      </div>
                      <Button
                        variant={"link"}
                        className="text-gray-500 hover:text-blue-600 hover:no-underline"
                        onClick={handleHouseholdSelectSwitch}
                      >
                        <ArrowLeftRight />
                        Select from existing
                      </Button>
                    </div>

                    {/* House Owner */}
                    <FormSelect
                      control={houseForm.control}
                      name="householdHead"
                      label="House Owner"
                      options={formatMembers()}
                      required
                    />

                    {/* NHTS Status */}
                    <FormSelect
                      control={houseForm.control}
                      name="nhts"
                      label="Select NHTS Status"
                      options={[
                        { id: "no", name: "NO" },
                        { id: "yes", name: "YES" },
                      ]}
                      required
                    />

                    {/* Address Selection */}
                    <div className="space-y-3">
                      <FormSelect
                        control={houseForm.control}
                        name="address"
                        label="Select Address"
                        options={formattedAddresses}
                        required
                      />
                      <p className="text-xs text-gray-700">
                        For addresses list to display, select an owner first.
                      </p>
                    </div>
                  </form>
                </Form>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Registration Actions
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Review the information above and take appropriate action on
                  this registration request.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ConfirmationModal
                  trigger={
                    isSubmitting ? (
                      <LoadButton className="w-full">
                        Creating Record...
                      </LoadButton>
                    ) : (
                      <Button>
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )
                  }
                  title="Confirm Approval"
                  description={
                    "Please review and verify all the details provided before confirming the registration. Do you wish to proceed?"
                  }
                  onClick={submit}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </LayoutWithBack>
  );
}
