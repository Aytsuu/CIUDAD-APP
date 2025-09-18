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
          {/* Resident Selection - Improved design */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700 text-sm flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Quick Select from Resident Database
              </h4>
              <div className="max-w-md">
                <ComboboxInput
                  value={
                    selectedResident
                      ? `${selectedResident.rp_id} - ${selectedResident.cpnt_name}`
                      : ""
                  }
                  options={formattedResidents}
                  isLoading={isResidentsLoading}
                  placeholder="Search by Resident ID or Name..."
                  emptyText="No residents found matching your search."
                  onSelect={(displayValue, item) => {
                    if (item) {
                      selectResidentComplainant(item);
                    }
                  }}
                  displayKey="displayName"
                  valueKey="rp_id"
                  additionalDataKey="cpnt_number"
                  className="w-full"
                  label=""
                />
              </div>
              <p className="text-xs text-green-600">
                💡 Start typing to search existing residents, or leave blank to enter information manually.
              </p>
            </div>
          </div>

          {/* Show resident info if linked - Improved layout */}
          {complainantType === "resident" && currentComplainant?.rp_id && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <UserCheck className="h-5 w-5" />
                  <span className="font-semibold text-base">
                    Linked to Resident Profile #{currentComplainant.rp_id}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={switchToManualEntry}
                  className="text-red-600 border-red-300 hover:bg-red-50 text-xs font-medium"
                >
                  Switch to Manual Entry
                </Button>
              </div>

              {/* Display resident information in a clean grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded border">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Resident ID
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {currentComplainant.rp_id}
                  </p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Full Name
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {currentComplainant.cpnt_name}
                  </p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Age
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {currentComplainant.cpnt_age} years old
                  </p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Gender
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {currentComplainant.genderInput || currentComplainant.cpnt_gender}
                  </p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Contact Number
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {currentComplainant.cpnt_number || 'Not provided'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Relationship
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {currentComplainant.cpnt_relation_to_respondent || 'Not specified'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded border md:col-span-2 lg:col-span-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Address
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {currentComplainant.cpnt_address || 'Not provided'}
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700 mb-3">
                📝 Please specify the relationship to the respondent for this complaint:
              </p>
              <FormInput
                control={control}
                name={`complainant.${activeTab}.cpnt_relation_to_respondent`}
                label="Relationship to Respondent *"
                placeholder="e.g. Neighbor, Friend, Relative, Self"
                className="bg-white"
              />
            </div>
          ) : (
            /* For manual entry, show all fields */
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
                  Personal Information
                </h4>
                
                <FormInput
                  control={control}
                  name={`complainant.${activeTab}.cpnt_name`}
                  label="Full Name *"
                  placeholder="Enter complete name (First Middle Last)"
                  className="max-w-full"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="flex mt-2 gap-2">
                      <div className="flex-shrink-0 w-32">
                        <FormField
                          control={control}
                          name={`complainant.${activeTab}.cpnt_gender`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <SelectLayout
                                  placeholder="Select"
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

                      <div className="flex-1">
                        <FormInput
                          control={control}
                          name={`complainant.${activeTab}.genderInput`}
                          placeholder={
                            selectedGender === "Other"
                              ? "Please specify"
                              : "Auto-filled from selection"
                          }
                          readOnly={selectedGender !== "Other"}
                          className={`${
                            selectedGender !== "Other"
                              ? "bg-gray-100 cursor-not-allowed text-gray-600"
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
                  placeholder="e.g. Neighbor, Friend, Relative, Self"
                />
              </div>

              {/* Address Section - Improved design */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
                  Address Information
                </h4>
                
                <div className="space-y-3">
                  <FormLabel className="font-semibold text-black/50">
                    Complete Address *
                  </FormLabel>
                  <p className="text-xs text-gray-500">
                    Please provide the complete address in the format: Street/Sitio, Barangay, Municipality/City, Province
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">Street/Sitio</label>
                      <FormField
                        control={control}
                        name={`complainant.${activeTab}.address.street`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Street/Sitio"
                                className="bg-white border-gray-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">Barangay</label>
                      <FormField
                        control={control}
                        name={`complainant.${activeTab}.address.barangay`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Barangay"
                                className="bg-white border-gray-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">Municipality/City</label>
                      <FormField
                        control={control}
                        name={`complainant.${activeTab}.address.city`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Municipality/City"
                                className="bg-white border-gray-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">Province</label>
                      <FormField
                        control={control}
                        name={`complainant.${activeTab}.address.province`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Province"
                                className="bg-white border-gray-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};