import "@/global.css";
import React from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { UsersRound, ArrowDownUp, Search } from "lucide-react-native";
import { FormSelect } from "@/components/ui/form/form-select";
import { SubmitButton } from "@/components/ui/button/submit-button";
import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { ResponsiveFormContainer, useResponsiveForm, FormContentWrapper } from "../../../../../../components/healthcomponents/ResponsiveFormContainer";

interface FamilyFormProps {
  form: UseFormReturn<any>;
  onNext: (stepId: number, isComplete: boolean) => void;
}

export default function FamilyForm({ form, onNext }: FamilyFormProps) {
  const [registrationType, setRegistrationType] = React.useState<"solo" | "family">("solo");
  const [selectOwnedHouses, setSelectOwnedHouses] = React.useState<boolean>(false);
  const [buildingReadOnly, setBuildingReadOnly] = React.useState<boolean>(false);
  const [householdSearch, setHouseholdSearch] = React.useState<string>("");
  const [familySearch, setFamilySearch] = React.useState<string>("");
  const [showHouseholdDropdown, setShowHouseholdDropdown] = React.useState<boolean>(false);
  const [showFamilyDropdown, setShowFamilyDropdown] = React.useState<boolean>(false);

  const {
    headingSize,
    bodyTextSize,
    smallTextSize,
    sectionMargin,
    cardPadding,
    iconSize,
    minButtonHeight,
    buttonPadding
  } = useResponsiveForm();

  const { control, setValue, watch, trigger, getValues } = form;

  const livingSoloValues = watch("livingSoloSchema");
  const familyValues = watch("familySchema");
  const ownedHouses = watch("houseSchema.list") || [];

  // Fetch households from API
  const { data: householdsData, isLoading: isLoadingHouseholds } = useQuery({
    queryKey: ["householdsList", householdSearch],
    queryFn: async () => {
      try {
        const res = await api2.get("health-profiling/household/list/", {
          params: {
            is_search: 'true',
            search: householdSearch || ""
          }
        });
        return res.data;
      } catch (err) {
        console.error("Error fetching households:", err);
        return [];
      }
    },
    enabled: !selectOwnedHouses && registrationType === "solo",
    staleTime: 5000,
  });

  // Fetch families from API  
  const { data: familiesData, isLoading: isLoadingFamilies } = useQuery({
    queryKey: ["familiesList", familySearch],
    queryFn: async () => {
      try {
        const res = await api2.get("health-profiling/family/list/table/", {
          params: {
            search: familySearch || "",
            page: 1,
            page_size: 50
          }
        });
        // The table endpoint returns { results: [...], count: number }
        return res.data.results || res.data;
      } catch (err) {
        console.error("Error fetching families:", err);
        return [];
      }
    },
    enabled: registrationType === "family",
    staleTime: 5000,
  });

  // Format owned houses for dropdown
  const formattedOwnedHouses = React.useMemo(() => {
    return ownedHouses.map((house: any, index: number) => {
      const sitio = house?.address.split("-")[1];
      const street = house?.address.split("-")[2];
      return {
        label: `House ${index + 1} - ${sitio}, ${street}`,
        value: index.toString() // Store index as string for backend
      };
    });
  }, [ownedHouses]);

  // Update building type to "Owner" when selecting from owned houses
  React.useEffect(() => {
    if (selectOwnedHouses) {
      setValue("livingSoloSchema.building", "owner");
      setBuildingReadOnly(true);
    } else {
      if (buildingReadOnly) {
        setValue("livingSoloSchema.building", "");
      }
      setBuildingReadOnly(false);
    }
  }, [selectOwnedHouses]);

  const validateAndNext = async () => {
    let isComplete = false;

    if (registrationType === "solo") {
      const formIsValid = await trigger([
        "livingSoloSchema.building",
        "livingSoloSchema.householdNo",
        "livingSoloSchema.indigenous",
      ]);

      if (!formIsValid) {
        return;
      }

      const { building, householdNo, indigenous } = livingSoloValues || {};
      isComplete = !!(building && householdNo && indigenous);
    } else {
      const formIsValid = await trigger([
        "familySchema.familyId",
        "familySchema.role",
      ]);

      if (!formIsValid) {
        return;
      }

      const { familyId, role } = familyValues || {};
      isComplete = !!(familyId && role);
    }

    onNext(4, isComplete);
  };

  const handleBack = () => {
    onNext(2, true); // Go back to HouseholdForm (step 3, index 2)
  };

  const handleTypeChange = (type: "solo" | "family") => {
    setRegistrationType(type);
    // Clear the other form's data
    if (type === "solo") {
      setValue("familySchema", { familyId: "", role: "" });
    } else {
      setValue("livingSoloSchema", { id: "", building: "", householdNo: "", indigenous: "" });
    }
  };

  const handleToggleHouseSelection = () => {
    setValue("livingSoloSchema.householdNo", "");
    setHouseholdSearch("");
    setShowHouseholdDropdown(false);
    setSelectOwnedHouses((prev) => !prev);
  };

  const handleSelectHousehold = (household: any) => {
    setValue("livingSoloSchema.householdNo", household.hh_id);
    setShowHouseholdDropdown(false);
    setHouseholdSearch("");
  };

  const handleSelectFamily = (family: any) => {
    setValue("familySchema.familyId", family.fam_id);
    setShowFamilyDropdown(false);
    setFamilySearch("");
  };

  return (
    <ResponsiveFormContainer>
      <FormContentWrapper>
        

        {/* Info Card */}
        <View 
          className="bg-blue-50 border border-blue-200 rounded-xl mb-6" 
          style={{ padding: cardPadding }}
        >
          <Text 
            className="text-blue-900 font-PoppinsSemiBold mb-1" 
            style={{ fontSize: headingSize }}
          >
            Independent Living Registration
          </Text>
          <Text 
            className="text-blue-700 font-PoppinsRegular leading-5" 
            style={{ fontSize: bodyTextSize }}
          >
            Register individuals who live independently within a household. This creates a family record for residents who maintain their own living arrangements.
          </Text>
        </View>

        {/* Registration Type Selection */}
        <View style={{ marginBottom: sectionMargin }}>
          <Text 
            className="text-gray-800 font-PoppinsSemiBold mb-3" 
            style={{ fontSize: headingSize }}
          >
            Registration Type
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => handleTypeChange("solo")}
              className={`flex-1 rounded-xl border-2 ${
                registrationType === "solo" 
                  ? "border-blue-600 bg-blue-50" 
                  : "border-gray-300 bg-white"
              }`}
              style={{ padding: cardPadding }}
            >
              <Text 
                className={`text-center font-PoppinsSemiBold ${
                  registrationType === "solo" ? "text-blue-600" : "text-gray-700"
                }`}
                style={{ fontSize: headingSize }}
              >
                Living Solo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleTypeChange("family")}
              className={`flex-1 rounded-xl border-2 ${
                registrationType === "family" 
                  ? "border-blue-600 bg-blue-50" 
                  : "border-gray-300 bg-white"
              }`}
              style={{ padding: cardPadding }}
            >
              <Text 
                className={`text-center font-PoppinsSemibold ${
                  registrationType === "family" ? "text-blue-600" : "text-gray-700"
                }`}
                style={{ fontSize: headingSize }}
              >
                Existing Family
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Living Solo Form */}
        {registrationType === "solo" && (
          <View 
            className="border border-gray-200 rounded-xl mb-6 bg-white" 
            style={{ padding: cardPadding + 4 }}
          >
            <View className="mb-5 pb-3 border-b border-gray-100">
              <Text 
                className="text-gray-800 font-PoppinsSemiBold" 
                style={{ fontSize: headingSize }}
              >
                Independent Living Details
              </Text>
              <Text 
                className="text-gray-600 font-PoppinsRegular" 
                style={{ fontSize: bodyTextSize }}
              >
                Fill all required fields
              </Text>
            </View>

            <View className="space-y-4">
              {/* Household Selection Toggle */}
              <View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text 
                    className="font-PoppinsMedium text-gray-700" 
                    style={{ fontSize: bodyTextSize }}
                  >
                    Household{" "}
                    <Text 
                      className="text-gray-500 font-PoppinsRegular" 
                      style={{ fontSize: smallTextSize }}
                    >
                      ({selectOwnedHouses ? "Owned" : "Existing"})
                    </Text>
                  </Text>
                  {ownedHouses.length > 0 && (
                    <TouchableOpacity
                      onPress={handleToggleHouseSelection}
                      className="flex-row items-center"
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <ArrowDownUp size={iconSize - 2} color="#6B7280" />
                      <Text 
                        className="text-gray-600 font-PoppinsRegular ml-1" 
                        style={{ fontSize: smallTextSize }}
                      >
                        {!selectOwnedHouses ? "Use owned house" : "Use existing"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {selectOwnedHouses ? (
                  <View>
                    <FormSelect
                      control={control}
                      name="livingSoloSchema.householdNo"
                      label=""
                      placeholder="Select a household"
                      options={formattedOwnedHouses}
                    />
                    <Text 
                      className="text-gray-500 font-PoppinsRegular mt-1 ml-1" 
                      style={{ fontSize: smallTextSize }}
                    >
                      Select from houses registered in step 3
                    </Text>
                  </View>
                ) : (
                  <View>
                    {/* Household Search Input */}
                    <TouchableOpacity
                      onPress={() => setShowHouseholdDropdown(true)}
                      className="border border-gray-300 rounded-xl bg-white"
                      style={{ paddingHorizontal: cardPadding, paddingVertical: cardPadding - 4 }}
                    >
                      <Text 
                        className={livingSoloValues?.householdNo ? "font-PoppinsRegular text-gray-900" : "font-PoppinsRegular text-gray-400"} 
                        style={{ fontSize: bodyTextSize }}
                      >
                        {livingSoloValues?.householdNo || "Select a household"}
                      </Text>
                    </TouchableOpacity>

                    {/* Household Dropdown */}
                    {showHouseholdDropdown && (
                      <View className="border border-gray-300 rounded-xl mt-2 bg-white max-h-80">
                        {/* Search Input */}
                        <View className="flex-row items-center border-b border-gray-200 px-3 py-2">
                          <Search size={18} color="#6B7280" />
                          <TextInput
                            value={householdSearch}
                            onChangeText={setHouseholdSearch}
                            placeholder="Search household..."
                            className="flex-1 ml-2 text-gray-900 font-PoppinsRegular"
                            autoFocus
                          />
                        </View>

                        {/* Household List */}
                        <ScrollView 
                          className="max-h-64"
                          nestedScrollEnabled={true}
                          showsVerticalScrollIndicator={true}
                        >
                          {isLoadingHouseholds ? (
                            <View className="py-8 items-center">
                              <ActivityIndicator size="small" color="#3B82F6" />
                              <Text className="text-gray-500 text-sm font-PoppinsRegular mt-2">Loading households...</Text>
                            </View>
                          ) : householdsData && householdsData.length > 0 ? (
                            householdsData.map((household: any) => (
                              <TouchableOpacity
                                key={household.hh_id}
                                onPress={() => handleSelectHousehold(household)}
                                className="px-4 py-3 border-b border-gray-100"
                              >
                                <View className="flex-row items-center">
                                  <View className="bg-green-100 px-3 py-1 rounded-full mr-3">
                                    <Text className="text-green-700 font-PoppinsSemiBold text-xs">
                                      {household.hh_id}
                                    </Text>
                                  </View>
                                  <View className="flex-1">
                                    <Text className="text-gray-900 font-PoppinsMedium">
                                      {household.head?.split("-")[1] || "N/A"}
                                    </Text>
                                    <Text className="text-gray-500 font-PoppinsRegular text-xs mt-0.5">
                                      {household.sitio}, {household.street}
                                    </Text>
                                  </View>
                                </View>
                              </TouchableOpacity>
                            ))
                          ) : (
                            <View className="py-8 items-center">
                              <Text className="text-gray-400 text-sm font-PoppinsRegular">
                                {householdSearch ? "No households found matching your search" : "No households found"}
                              </Text>
                            </View>
                          )}
                        </ScrollView>

                        {/* Close Button */}
                        <TouchableOpacity
                          onPress={() => setShowHouseholdDropdown(false)}
                          className="border-t border-gray-200 py-3 items-center"
                        >
                          <Text className="text-gray-600 font-PoppinsMedium">Close</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <Text className="text-xs text-gray-500 font-PoppinsRegular mt-1 ml-1">
                      Select from existing households in the system
                    </Text>
                  </View>
                )}
              </View>

              {/* Building Type / Household Occupancy */}
              <View>
                <FormSelect
                  control={control}
                  name="livingSoloSchema.building"
                  label="Household Occupancy"
                  options={[
                    { label: "OWNER", value: "owner" },
                    { label: "RENTER", value: "renter" },
                    { label: "SHARER", value: "sharer" },
                  ]}
                />
                {buildingReadOnly && (
                  <Text className="text-xs text-gray-500 font-PoppinsRegular mt-1 ml-1">
                    Automatically set to OWNER for owned houses
                  </Text>
                )}
              </View>

              {/* Indigenous */}
              <View>
                <FormSelect
                  control={control}
                  name="livingSoloSchema.indigenous"
                  label="Indigenous People"
                  options={[
                    { label: "NO", value: "no" },
                    { label: "YES", value: "yes" },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Existing Family Form */}
        {registrationType === "family" && (
          <View className="border border-gray-200 rounded-xl p-5 mb-6 bg-white">
            <View className="mb-5 pb-3 border-b border-gray-100">
              <Text className="text-base font-PoppinsSemiBold text-gray-800">Join Existing Family</Text>
              <Text className="text-sm text-gray-600 font-PoppinsRegular">Link to an existing family record</Text>
            </View>

            <View className="space-y-4">
              {/* Family ID */}
              <View>
                {/* Family Search Input */}
                <Text className="text-sm font-PoppinsMedium text-gray-700 mb-2">Family</Text>
                <TouchableOpacity
                  onPress={() => setShowFamilyDropdown(true)}
                  className="border border-gray-300 rounded-xl px-4 py-3 bg-white"
                >
                  <Text className={familyValues?.familyId ? "text-gray-900 font-PoppinsRegular" : "text-gray-400 font-PoppinsRegular"}>
                    {familyValues?.familyId || "Select a family"}
                  </Text>
                </TouchableOpacity>

                {/* Family Dropdown */}
                {showFamilyDropdown && (
                  <View className="border border-gray-300 rounded-xl mt-2 bg-white max-h-80">
                    {/* Search Input */}
                    <View className="flex-row items-center border-b border-gray-200 px-3 py-2">
                      <Search size={18} color="#6B7280" />
                      <TextInput
                        value={familySearch}
                        onChangeText={setFamilySearch}
                        placeholder="Search family..."
                        className="flex-1 ml-2 text-gray-900 font-PoppinsRegular"
                        autoFocus
                      />
                    </View>

                    {/* Family List */}
                    <ScrollView 
                      className="max-h-64"
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                    >
                      {isLoadingFamilies ? (
                        <View className="py-8 items-center">
                          <ActivityIndicator size="small" color="#3B82F6" />
                          <Text className="text-gray-500 text-sm font-PoppinsRegular mt-2">Loading families...</Text>
                        </View>
                      ) : familiesData && familiesData.length > 0 ? (
                        familiesData.map((family: any) => {
                          // Determine family head (priority: father > mother > guardian > independent)
                          const headName = family.father || family.mother || family.guardian || family.independent || "N/A";
                          const headRole = family.father ? "Father" : family.mother ? "Mother" : family.guardian ? "Guardian" : family.independent ? "Independent" : "";
                          
                          return (
                            <TouchableOpacity
                              key={family.fam_id}
                              onPress={() => handleSelectFamily(family)}
                              className="px-4 py-3 border-b border-gray-100"
                            >
                              <View className="flex-row items-center">
                                <View className="bg-blue-100 px-3 py-1 rounded-full mr-3">
                                  <Text className="text-blue-700 font-PoppinsSemiBold text-xs">
                                    {family.fam_id}
                                  </Text>
                                </View>
                                <View className="flex-1">
                                  <Text className="text-gray-900 font-PoppinsMedium">
                                    {headName}
                                  </Text>
                                  {headRole && (
                                    <Text className="text-gray-500 font-PoppinsRegular text-xs mt-0.5">
                                      {headRole} • {family.sitio}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            </TouchableOpacity>
                          );
                        })
                      ) : (
                        <View className="py-8 items-center">
                          <Text className="text-gray-400 text-sm font-PoppinsRegular">
                            {familySearch ? "No families found matching your search" : "No families found"}
                          </Text>
                        </View>
                      )}
                    </ScrollView>

                    {/* Close Button */}
                    <TouchableOpacity
                      onPress={() => setShowFamilyDropdown(false)}
                      className="border-t border-gray-200 py-3 items-center"
                    >
                      <Text className="text-gray-600 font-PoppinsMedium">Close</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <Text className="text-xs text-gray-500 font-PoppinsRegular mt-1 ml-1">
                  Select an existing family to join
                </Text>
              </View>

              {/* Role in Family */}
              <View>
                <FormSelect
                  control={control}
                  name="familySchema.role"
                  label="Role in Family"
                  options={[
                    { label: "FATHER", value: "Father" },
                    { label: "MOTHER", value: "Mother" },
                    { label: "SON", value: "Son" },
                    { label: "DAUGHTER", value: "Daughter" },
                    { label: "GUARDIAN", value: "Guardian" },
                    { label: "DEPENDENT", value: "Dependent" },
                    { label: "OTHER RELATIVE", value: "Other" },
                  ]}
                />
              </View>
            </View>

            {/* Info Note */}
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
              <Text className="text-amber-900 font-PoppinsSemiBold mb-1">Note</Text>
              <Text className="text-sm text-amber-700 font-PoppinsRegular leading-5">
                Make sure the Family ID exists in the system. This will link the resident to an existing family record.
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={handleBack}
            className="flex-1 items-center justify-center bg-gray-100 rounded-xl"
            style={{ paddingVertical: buttonPadding, minHeight: minButtonHeight }}
          >
            <Text 
              className="text-gray-700 font-PoppinsSemiBold" 
              style={{ fontSize: headingSize }}
            >
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={validateAndNext}
            className="flex-1 items-center justify-center bg-blue-600 rounded-xl"
            style={{ paddingVertical: buttonPadding, minHeight: minButtonHeight }}
          >
            <Text 
              className="text-white font-PoppinsSemiBold" 
              style={{ fontSize: headingSize }}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View className="pt-4 border-t border-gray-200">
          <Text 
            className="text-center text-gray-500 font-PoppinsRegular leading-5" 
            style={{ fontSize: smallTextSize }}
          >
            Need assistance with this form? Contact your administrator for help.
          </Text>
        </View>
      </FormContentWrapper>
    </ResponsiveFormContainer>
  );
}
