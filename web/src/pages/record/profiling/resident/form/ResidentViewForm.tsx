import React from "react";
import { Form } from "@/components/ui/form/form";
import PersonalInfoForm from "./PersonalInfoForm";
import { useResidentForm } from "./useResidentForm";
import { Type } from "../../ProfilingEnums";
import { useUpdateProfile } from "../../queries/profilingUpdateQueries";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table/data-table";
import {
  businessDetailsColumns,
  familyDetailsColumns,
  houseDetailsColumns,
} from "../ResidentColumns";
import {
  useFamilyMembers,
  useOwnedBusinesses,
  useOwnedHouses,
  usePersonalHistory,
  usePersonalInfo,
  useSitioList,
} from "../../queries/profilingFetchQueries";
import { formatSitio } from "../../ProfilingFormats";
import {
  useAddAddress,
  useAddPerAddress,
} from "../../queries/profilingAddQueries";
import { useLoading } from "@/context/LoadingContext";
import {
  Users,
  History,
  Clock,
  UsersRound,
  UserRound,
  Building,
  MoveRight,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SheetLayout } from "@/components/ui/sheet/sheet-layout";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router";
import { RenderHistory } from "../../ProfilingHistory";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSidebar } from "@/components/ui/card-sidebar";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge";
import {
  showErrorToast,
  showPlainToast,
  showSuccessToast,
} from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";

export default function ResidentViewForm({ params }: { params: any }) {
  // ============= STATE INITIALIZATION ===============
  const currentPath = location.pathname.split("/").pop() as string;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [formType, setFormType] = React.useState<Type>(params.type);
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false);
  const [addresses, setAddresses] = React.useState<Record<string, any>[]>([]);
  const [validAddresses, setValidAddresses] = React.useState<boolean[]>([]);
  const [selectedItem, setSelectedItem] = React.useState<string>(currentPath);
  const { mutateAsync: addAddress } = useAddAddress();
  const { mutateAsync: addPersonalAddress } = useAddPerAddress();
  const { data: personalInfo, isLoading: isLoadingPersonalInfo } =
    usePersonalInfo(params.data.residentId);
  const { data: familyMembers, isLoading: isLoadingFam } = useFamilyMembers(
    params.data.familyId
  );
  const { data: ownedBusinesses, isLoading: isLoadingBusinesses } =
    useOwnedBusinesses({
      rp: params.data.residentId,
    });

  const { data: sitioList, isLoading: isLoadingSitio } = useSitioList();
  const { data: personalHistory, isLoading: isLoadingPersonalHistory } =
    usePersonalHistory(personalInfo?.per_id);
  const { data: ownedHouses, isLoading: isLoadingOwnedHouses } = useOwnedHouses(
    params.data.residentId
  );

  const { form, checkDefaultValues, handleSubmitSuccess, handleSubmitError } =
    useResidentForm(personalInfo);
  const family = familyMembers?.results || [];
  const businesses = ownedBusinesses?.results || [];
  const formattedSitio = React.useMemo(
    () => formatSitio(sitioList) || [],
    [sitioList]
  );

  // ---- Registered By ----
  const registered_by = personalInfo?.registered_by?.split("-") || [];
  const staffId = registered_by.length > 0 && registered_by[0];
  const staffName = registered_by.length > 0 && registered_by[1];
  const staffType = registered_by.length > 0 && registered_by[2];
  const staffFam = registered_by.length > 0 && registered_by[3];

  const validator = React.useMemo(
    () =>
      addresses?.map(
        (address: any) =>
          address.add_province !== "" &&
          address.add_city !== "" &&
          address.add_barangay !== "" &&
          (address.add_barangay === "SAN ROQUE (CIUDAD)"
            ? address.sitio !== ""
            : address.add_external_sitio !== "") &&
          address.add_street !== ""
      ),
    [addresses]
  );

  // Initialize state params for each tab switch
  const state = {
    params: {
      type: "viewing",
      data: {
        residentId: params?.data.residentId,
        familyId: params?.data.familyId,
      },
    },
  };

  const MenuItems = [
    {
      id: "personal",
      label: "Personal",
      description: "Personal Information",
      icon: UserRound,
      route: "personal",
      state,
    },
    {
      id: "family",
      label: "Family",
      description: "Family Information",
      icon: UsersRound,
      route: "family",
      state,
    },
    ...((ownedHouses?.length > 0
      ? [
          {
            id: "house",
            label: "House",
            description: "House Information",
            icon: Building,
            route: "house",
            state,
          },
        ]
      : []) as any),
    ...((businesses?.length > 0
      ? [
          {
            id: "business",
            label: "Business",
            description: "Business Information",
            icon: Building,
            route: "business",
            state,
          },
        ]
      : []) as any),
  ];

  const isDeceased = form.watch("per_is_deceased") == "YES";
  const isVoter = personalInfo?.voter == "YES";

  // ================= SIDE EFFECTS ==================
  React.useEffect(() => {
    if (currentPath !== selectedItem) {
      setSelectedItem(currentPath);
    }
  }, [currentPath, selectedItem]);

  React.useEffect(() => {
    if (
      isLoadingFam ||
      isLoadingPersonalInfo ||
      isLoadingBusinesses ||
      isLoadingPersonalHistory ||
      isLoadingOwnedHouses
    )
      showLoading();
    else hideLoading();
  }, [
    isLoadingFam,
    isLoadingPersonalInfo,
    isLoadingBusinesses,
    isLoadingPersonalHistory,
    isLoadingOwnedHouses,
  ]);

  React.useEffect(() => {
    // Set the form values when the component mounts
    if (formType == Type.Viewing) {
      setIsReadOnly(true);
      form.reset();
      setAddresses(personalInfo?.per_addresses);
    }
    formType === Type.Editing && setIsReadOnly(false);
  }, [formType, personalInfo]);

  React.useEffect(() => {
    setAddresses(personalInfo?.per_addresses);
  }, [personalInfo]);

  // ==================== HANDLERS ====================
  const validateAddresses = React.useCallback(() => {
    setValidAddresses(validator);
    const isValidAll = validator.every((valid: any) => valid === true);
    return isValidAll;
  }, [addresses]);

  const submit = async () => {
    if (!(await form.trigger())) {
      handleSubmitError("Please fill out all required fields");
      return;
    }
    if (!validateAddresses()) {
      handleSubmitError("Please fill out all required fields");
      return;
    }
    try {
      setIsSubmitting(true);
      const isAddressAdded =
        personalInfo?.per_addresses?.length < addresses.length;
      const values = form.getValues();
      const {
        per_age,
        per_id,
        registered_by,
        rp_date_registered,
        fam_id,
        rp_id,
        ...personalInfoRest
      } = personalInfo;
      const { per_id: id, ...val } = values;

      if (
        checkDefaultValues(
          { ...val, per_addresses: addresses },
          personalInfoRest
        )
      ) {
        setIsSubmitting(false);
        setFormType(Type.Viewing);
        showPlainToast("No changes made");
        return;
      }

      const initialAddresses = addresses.slice(
        0,
        personalInfo?.per_addresses?.length
      );
      const addedAddress = addresses.slice(
        personalInfo?.per_addresses?.length,
        addresses.length
      );
      let new_addresses = [];
      // Add new address to the database
      if (isAddressAdded) {
        new_addresses = await addAddress(addedAddress);

        // Format the addresses to match the expected format
        const per_addresses = new_addresses.map((address: any) => {
          return {
            add: address.add_id,
            per: personalInfo?.per_id,
          };
        });

        const initial_per_addresses = initialAddresses.map((address: any) => ({
          add: address.add_id,
          per: personalInfo?.per_id,
          initial: true,
        }));

        // Link personal address
        await addPersonalAddress({
          data: [...per_addresses, ...initial_per_addresses],
          staff_id: user?.staff?.staff_id,
        });

        if (
          checkDefaultValues(
            { ...values, per_addresses: initialAddresses },
            personalInfoRest
          )
        ) {
          setIsSubmitting(false);
          setFormType(Type.Viewing);
          showSuccessToast("Profile updated successfully");
          return;
        }
      }

      // Update the profile and address if any changes were made
      await updateProfile(
        {
          personalId: personalInfo?.per_id,
          values: {
            ...values,
            per_is_deceased: values.per_is_deceased == "YES" ? true : false,
            per_addresses: [...new_addresses, ...initialAddresses],
            staff_id: user?.staff?.staff_id,
          },
        },
        {
          onSuccess: () => {
            handleSubmitSuccess("Profile updated successfully");
            setIsSubmitting(false);
            setFormType(Type.Viewing);
          },
        }
      );
    } catch (err) {
      showErrorToast("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHistoryItemClick = (index: number) => {
    navigate("/profiling/resident/history/view", {
      state: {
        params: {
          newData: personalHistory[index],
          oldData: personalHistory[index + 1],
        },
      },
    });
  };

  // ==================== RENDER HELPERS ====================
  // Render Family Card Content
  const renderFamilyContent = () => {
    if (isLoadingFam || isLoadingSitio) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500">Loading family members...</p>
        </div>
      );
    }
    if (!family || family.length === 0) {
      return (
        <EmptyState
          icon={Users}
          title="No family members found"
          description="This resident has no registered family members."
        />
      );
    }
    return (
      <div className="flex justify-center">
        <div className="w-full mt-5 border">
          <DataTable
            columns={familyDetailsColumns(
              params.data.residentId,
              params.data.familyId
            )}
            data={family}
            headerClassName="bg-transparent hover:bg-transparent"
            isLoading={false}
          />
        </div>
      </div>
    );
  };

  // Render House Card Content
  const renderHouseContent = () => {
    return (
      <div className="flex justify-center">
        <div className="w-full mt-5 border">
          <DataTable
            columns={houseDetailsColumns()}
            data={ownedHouses}
            headerClassName="bg-transparent hover:bg-transparent"
            isLoading={false}
          />
        </div>
      </div>
    );
  };

  // Render Business Card Content
  const renderBusinessContent = () => {
    return (
      <div className="flex justify-center">
        <div className="w-full mt-5 border">
          <DataTable
            columns={businessDetailsColumns()}
            data={businesses}
            headerClassName="bg-transparent hover:bg-transparent"
            isLoading={false}
          />
        </div>
      </div>
    );
  };

  // ==================== RENDER ====================
  return (
    <LayoutWithBack
      title={
        <div className="flex items-center gap-4">
          <p>Resident Details</p>
          <Badge className="bg-blue-600 hover:bg-blue-600">ID: {params.data.residentId}</Badge>
        </div>
      }
      description="Information is displayed in a clear, organized, and secure manner."
    >
      <div className="flex gap-4">
        <div className="w-1/6">
          <CardSidebar
            sidebarItems={MenuItems}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            header={
              <div className="flex flex-col px-5 py-3 bg-blue-100 font-semibold">
                <span className="text-sm text-black/80 font-normal">
                  Select a record to view
                </span>
              </div>
            }
          />
        </div>
        <div className="grid w-full max-h-[800px] overflow-y-auto">
          {currentPath == "personal" && (
            <React.Fragment>
              <Card className="w-full p-10">
                <div className="pb-4 flex justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-primary">
                        Personal Information
                      </h2>
                      <p className="text-sm text-black/50">
                        Fill out all necessary fields
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {formType == Type.Viewing && isDeceased && (
                        <Badge className="bg-red-100 border-red-300 rounded-full hover:bg-red-100">
                          <Label className="text-red-500">Deceased</Label>
                        </Badge>
                      )}
                      {formType == Type.Viewing && isVoter && (
                        <Badge className="bg-blue-100 border-blue-300 rounded-full hover:bg-blue-100">
                          <Label className="text-blue-500">Voter</Label>
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <SheetLayout
                      trigger={
                        <History
                          size={20}
                          className="text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                        />
                      }
                      content={
                        <RenderHistory
                          history={personalHistory}
                          isLoadingHistory={isLoadingPersonalHistory}
                          itemTitle="Personal Information Update"
                          handleHistoryItemClick={handleHistoryItemClick}
                        />
                      }
                      title={
                        <Label className="flex items-center gap-2 text-lg text-darkBlue1">
                          <Clock size={20} />
                          Update History
                        </Label>
                      }
                      description="View all changes made to this resident's information"
                    />
                  </div>
                </div>
                {isLoadingPersonalInfo ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Spinner size="lg" />
                    <p className="text-sm text-gray-500">
                      Loading personal information...
                    </p>
                  </div>
                ) : (
                  <>
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
                          addresses={addresses}
                          validAddresses={validAddresses}
                          setValidAddresses={setValidAddresses}
                          setAddresses={setAddresses}
                          form={form}
                          formType={formType}
                          isSubmitting={isSubmitting}
                          submit={submit}
                          isReadOnly={isReadOnly}
                          setFormType={setFormType}
                        />
                      </form>
                    </Form>
                  </>
                )}
              </Card>
              {registered_by.length > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <AlertCircle size={18} className="text-primary" />
                  <p className="text-sm text-primary">
                    This resident was registered by{" "}
                    <span
                      onClick={() => {
                        navigate("/profiling/resident/view/personal", {
                          state: {
                            params: {
                              type: "viewing",
                              data: {
                                residentId: staffId,
                                familyId: staffFam,
                              },
                            },
                          },
                        });
                      }}
                      className="cursor-pointer font-medium text-blue-600 hover:underline text-left"
                    >
                      {staffName || "N/A"}
                    </span>{" "}
                    ({staffId}) from{" "}
                    {staffType.toLowerCase() == "health staff"
                      ? "health"
                      : "barangay"}
                    .
                  </p>
                </div>
              )}

              {!personalInfo?.has_account && (
                <div className="flex items-center gap-2 mt-4">
                  <AlertCircle size={18} className="text-primary" />
                  <p className="text-sm text-primary">
                    This resident doesn't have an account for mobile app.{" "}
                    <span
                      onClick={() => {
                        navigate("/profiling/account/create", {
                          state: {
                            params: {
                              residentId: params.data.residentId,
                            },
                          },
                        });
                      }}
                      className="cursor-pointer font-medium text-blue-600 hover:underline text-left"
                    >
                      Create an Account
                    </span>{" "}
                  </p>
                </div>
              )}
            </React.Fragment>
          )}

          {currentPath == "family" && (
            <Card className="w-full p-10">
              <div className="flex justify-between border-b">
                <div className="pb-4">
                  <h2 className="text-lg font-semibold text-primary">Family</h2>
                  <p className="text-xs text-black/50">
                    Shows family members of this resident
                  </p>
                </div>
                {family.length > 0 && (
                  <Button
                    variant={"link"}
                    onClick={() => {
                      navigate("/profiling/family/view", {
                        state: {
                          params: {
                            fam_id: params.data.familyId,
                          },
                        },
                      });
                    }}
                  >
                    View full details <MoveRight />
                  </Button>
                )}
              </div>

              {personalInfo?.fam_id && (
                <div className="flex items-center gap-8 mt-8">
                  <Label className="text-gray-500">
                    Family Number:{" "}
                    <span className="text-primary">{personalInfo?.fam_id}</span>
                  </Label>
                  <Label className="text-gray-500">
                    Household Number:{" "}
                    <span className="text-primary">
                      {personalInfo?.household_no}
                    </span>
                  </Label>
                </div>
              )}

              {renderFamilyContent()}
            </Card>
          )}

          {currentPath == "house" &&
            !isLoadingOwnedHouses &&
            (!ownedHouses || ownedHouses.length > 0) && (
              <Card className="w-full p-10">
                <div className="pb-4">
                  <h2 className="text-lg font-semibold">House</h2>
                  <p className="text-xs text-black/50">
                    Shows owned houses of this resident
                  </p>
                </div>
                {renderHouseContent()}
              </Card>
            )}

          {currentPath == "business" &&
            !isLoadingBusinesses &&
            (!businesses || businesses.length > 0) && (
              <Card className="w-full p-10">
                <div className="pb-4">
                  <h2 className="text-lg font-semibold">Business</h2>
                  <p className="text-xs text-black/50">
                    Shows owned business of this resident
                  </p>
                </div>
                {renderBusinessContent()}
              </Card>
            )}
        </div>
      </div>
    </LayoutWithBack>
  );
}
