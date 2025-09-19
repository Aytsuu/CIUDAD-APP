import { useFieldArray, useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import { Plus, X, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useAllResidents } from "../api-operations/queries/complaintGetQueries";
import { ComboboxInput } from "@/components/ui/form/form-combobox-input";

type Resident = {
  rp_id: string;
  cpnt_name: string;
  cpnt_gender?: string;
  cpnt_age?: string;
  cpnt_number?: string;
  cpnt_relation_to_respondent?: string;
  cpnt_address?: string;
  [key: string]: any;
};

export const ComplainantInfo = () => {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "complainant",
  });
  const [activeTab, setActiveTab] = useState(0);
  const [selectedResident, setSelectedResident] = useState<any>(null);

  // Fetch all residents upfront
  const { data: allResidents = [], isLoading: isResidentsLoading } =
    useAllResidents();

  // Watch current complainant data
  const currentComplainant = watch(`complainant.${activeTab}`);
  const complainantType = currentComplainant?.type || "manual";

  const addComplainant = () => {
    const newIndex = fields.length;
    append({
      type: "manual",
      rp_id: null,
      cpnt_name: "",
      cpnt_gender: "",
      genderInput: "",
      cpnt_age: "",
      cpnt_relation_to_respondent: "",
      cpnt_number: "",
      cpnt_address: "",
      address: {
        street: "",
        barangay: "",
        city: "",
        province: "",
        sitio: "",
      },
    });
    setActiveTab(newIndex);
    setSelectedResident(null);
  };

  const removeComplainant = (index: any) => {
    if (fields.length === 1) return;
    remove(index);
    if (activeTab === index) {
      setActiveTab(index > 0 ? index - 1 : 0);
    } else if (activeTab > index) {
      setActiveTab(activeTab - 1);
    }
    setSelectedResident(null);
  };

  const selectResidentComplainant = (resident: any) => {
    setSelectedResident(resident);
    setValue(`complainant.${activeTab}.type`, "resident");
    setValue(`complainant.${activeTab}.rp_id`, resident.rp_id);
    setValue(`complainant.${activeTab}.cpnt_name`, resident.cpnt_name);
    setValue(`complainant.${activeTab}.cpnt_gender`, resident.cpnt_gender);
    setValue(`complainant.${activeTab}.genderInput`, resident.cpnt_gender);
    setValue(`complainant.${activeTab}.cpnt_age`, resident.cpnt_age);
    setValue(
      `complainant.${activeTab}.cpnt_number`,
      resident.cpnt_number || ""
    );
    setValue(
      `complainant.${activeTab}.cpnt_relation_to_respondent`,
      resident.cpnt_relation_to_respondent || ""
    );
    setValue(
      `complainant.${activeTab}.cpnt_address`,
      resident.cpnt_address || ""
    );

    // Parse address for display
    if (resident.cpnt_address) {
      const addressParts = resident.cpnt_address.split(", ");
      setValue(`complainant.${activeTab}.address`, {
        street: addressParts[0] || "",
        barangay: addressParts[1] || "",
        city: addressParts[2] || "",
        province: addressParts[3] || "",
        sitio: addressParts[4] || "",
      });
    }
  };

  const switchToManualEntry = () => {
    setSelectedResident(null);
    setValue(`complainant.${activeTab}.type`, "manual");
    setValue(`complainant.${activeTab}.rp_id`, null);
    setValue(`complainant.${activeTab}.cpnt_address`, "");
  };

  const selectedGender = watch(`complainant.${activeTab}.cpnt_gender`);

  const genderOptions = [
    { id: "Male", name: "Male" },
    { id: "Female", name: "Female" },
    { id: "Other", name: "Other" },
    { id: "Prefer not to say", name: "Prefer not to say" },
  ];

  useEffect(() => {
    if (fields.length === 0) {
      append({
        type: "manual",
        rp_id: null,
        cpnt_name: "",
        cpnt_gender: "",
        genderInput: "",
        cpnt_age: "",
        cpnt_relation_to_respondent: "",
        cpnt_number: "",
        cpnt_address: "",
        address: {
          street: "",
          barangay: "",
          city: "",
          province: "",
          sitio: "",
        },
      });
      setActiveTab(0);
    }
  }, [fields.length, append]);

  useEffect(() => {
    if (activeTab >= fields.length && fields.length > 0) {
      setActiveTab(fields.length - 1);
    }
  }, [fields.length, activeTab]);

  const getTabDisplayName = (index: any) => `Comp. ${index + 1}`;

  const validateAge = (value: any) => {
    if (!value) return "Age is required";
    const age = parseInt(value);
    if (isNaN(age)) return "Age must be a number";
    if (age < 1 || age > 150) return "Age must be between 1 and 150";
    return true;
  };

  const formattedResidents = allResidents.map((resident: Resident) => ({
    ...resident,
    displayName: `${resident.rp_id} - ${resident.cpnt_name}`,
  }));

  if (fields.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="bg-white border rounded-t-lg shadow-sm">
        <div className="flex items-center px-4 py-3 border-b">
          <div className="flex items-center space-x-2 flex-1 overflow-x-auto">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className={`flex items-center px-3 py-2 cursor-pointer rounded-md transition-colors whitespace-nowrap ${
                  activeTab === index
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-ashGray/40 text-black/50 hover:bg-gray-200"
                }`}
                onClick={() => {
                  setActiveTab(index);
                  setSelectedResident(null);
                }}
              >
                <span className="text-sm font-medium">
                  {getTabDisplayName(index)}
                </span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeComplainant(index);
                    }}
                    className={`ml-2 p-1 rounded-full transition-colors ${
                      activeTab === index
                        ? "hover:bg-blue-700 text-blue-100 hover:text-white"
                        : "hover:bg-red-100 text-gray-500 hover:text-red-600"
                    }`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            onClick={addComplainant}
            variant="outline"
            size="sm"
            className="ml-3 text-blue-600 border-blue-300 hover:bg-blue-50 whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Complainant
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div
        key={`tab-${activeTab}`}
        className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-6 shadow-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-semibold text-black/70">
            Complainant {activeTab + 1} Information
          </h3>
        </div>

        <div className="space-y-6">
          {/* Resident Selection - First in green wrapper */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-4">
              <FormLabel className="font-semibold text-green-700 whitespace-nowrap">
                Select Resident (Optional):
              </FormLabel>
              <div className="flex-1">
                <ComboboxInput
                  value={
                    selectedResident
                      ? `${selectedResident.rp_id} - ${selectedResident.cpnt_name}`
                      : ""
                  }
                  options={formattedResidents}
                  isLoading={isResidentsLoading}
                  placeholder="Search by ID or name..."
                  emptyText="No residents found."
                  onSelect={(displayValue, item) => {
                    if (item) {
                      selectResidentComplainant(item);
                    }
                  }}
                  displayKey="displayName"
                  valueKey="rp_id"
                  additionalDataKey="cpnt_number"
                  className="w-full"
                  label={""}
                />
              </div>
            </div>
          </div>

          {/* Show resident info if linked */}
          {complainantType === "resident" && currentComplainant?.rp_id && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-green-700">
                  <UserCheck className="h-4 w-4" />
                  <span className="font-medium">
                    Linked to Resident Profile
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={switchToManualEntry}
                  className="text-red-600 border-red-300 hover:bg-red-50 text-xs"
                >
                  Switch to Manual Entry
                </Button>
              </div>

              {/* Display resident information in a read-only format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Resident ID:
                  </span>
                  <p className="text-gray-900">{currentComplainant.rp_id}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Full Name:</span>
                  <p className="text-gray-900">
                    {currentComplainant.cpnt_name}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Age:</span>
                  <p className="text-gray-900">{currentComplainant.cpnt_age}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Gender:</span>
                  <p className="text-gray-900">
                    {currentComplainant.genderInput ||
                      currentComplainant.cpnt_gender}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Contact:</span>
                  <p className="text-gray-900">
                    {currentComplainant.cpnt_number}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Relationship:
                  </span>
                  <p className="text-gray-900">
                    {currentComplainant.cpnt_relation_to_respondent}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-900">
                    {currentComplainant.cpnt_address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hidden field for rp_id */}
          <input
            type="hidden"
            {...control.register(`complainant.${activeTab}.rp_id`)}
          />

          {/* For resident type, show only relationship field if needed */}
          {complainantType === "resident" && currentComplainant?.rp_id ? (
            <FormInput
              control={control}
              name={`complainant.${activeTab}.cpnt_relation_to_respondent`}
              label="Relationship to Respondent *"
              placeholder="e.g. Neighbor, Friend, Relative"
            />
          ) : (
            /* For manual entry, show all fields */
            <>
              <FormInput
                control={control}
                name={`complainant.${activeTab}.cpnt_name`}
                label="Full Name *"
                placeholder="Enter full name"
                className="max-w-full"
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name={`complainant.${activeTab}.cpnt_age`}
                  rules={{ validate: validateAge }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-black/50">
                        Age *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="150"
                          placeholder="Age"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^\d+$/.test(value)) {
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel className="font-semibold text-black/50">
                    Gender *
                  </FormLabel>
                  <div className="flex mt-2">
                    <div className="flex-shrink-0 w-32">
                      <FormField
                        control={control}
                        name={`complainant.${activeTab}.cpnt_gender`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <SelectLayout
                                placeholder="Select gender"
                                label=""
                                options={genderOptions}
                                value={field.value || ""}
                                onChange={(value) => {
                                  field.onChange(value);
                                  if (value === "Other") {
                                    setValue(
                                      `complainant.${activeTab}.genderInput`,
                                      ""
                                    );
                                  } else {
                                    setValue(
                                      `complainant.${activeTab}.genderInput`,
                                      value
                                    );
                                  }
                                }}
                                className="h-9"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex-1 ml-2">
                      <FormInput
                        control={control}
                        name={`complainant.${activeTab}.genderInput`}
                        placeholder={
                          selectedGender === "Other"
                            ? "Enter gender"
                            : "Auto-filled from selection"
                        }
                        readOnly={selectedGender !== "Other"}
                        className={`${
                          selectedGender !== "Other"
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <FormInput
                  control={control}
                  name={`complainant.${activeTab}.cpnt_number`}
                  label="Contact Number *"
                  placeholder="e.g. +63 912 345 6789"
                  type="tel"
                />
              </div>

              <FormInput
                control={control}
                name={`complainant.${activeTab}.cpnt_relation_to_respondent`}
                label="Relationship to Respondent *"
                placeholder="e.g. Neighbor, Friend, Relative"
              />

              {/* Address Section */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <FormLabel className="font-semibold text-black/50">
                    Complete Address (Street / Barangay / Municipality /
                    Province) *
                  </FormLabel>

                  <div className="flex flex-col md:flex-row items-stretch border-2 border-gray-300 rounded-lg p-2 bg-white gap-2 md:gap-0">
                    {[
                      { key: "street", placeholder: "Street/Sitio" },
                      { key: "barangay", placeholder: "Barangay" },
                      { key: "city", placeholder: "Municipality/City" },
                      { key: "province", placeholder: "Province" },
                    ].map(({ key, placeholder }, i) => (
                      <div key={key} className="flex-1 flex items-center">
                        <FormField
                          control={control}
                          name={`complainant.${activeTab}.address.${key}`}
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder={placeholder}
                                  className="border-none shadow-none px-2 h-10 md:h-8"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        {i < 3 && (
                          <span className="hidden md:inline mx-2 text-gray-400 font-medium">
                            /
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Address field validation messages */}
                  <div className="space-y-1">
                    {["street", "barangay", "city", "province"].map(
                      (fieldKey) => (
                        <FormField
                          key={fieldKey}
                          control={control}
                          name={`complainant.${activeTab}.address.${fieldKey}`}
                          render={() => <FormMessage />}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
