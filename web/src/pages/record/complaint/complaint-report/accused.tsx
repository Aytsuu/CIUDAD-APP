import { useFieldArray, useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, UserCheck } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { FormInput } from "@/components/ui/form/form-input";
import { ComboboxInput } from "@/components/ui/form/form-combobox-input";
import { useAllResidents } from "../api-operations/queries/complaintGetQueries";

export const AccusedInfo = () => {
  const { control, watch, setValue, trigger } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "accused",
  });

  const [activeTab, setActiveTab] = useState(0);
  const [selectedResident, setSelectedResident] = useState<any>(null);

  // Fetch all residents upfront
  const { data: allResidents = [], isLoading: isResidentsLoading } = useAllResidents();

  // Watch current accused data
  const currentAccused = watch(`accused.${activeTab}`);
  const accusedType = currentAccused?.type || "manual";
  const selectedGender = watch(`accused.${activeTab}.acsd_gender`);

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
        acsd_name: "",
        acsd_age: "",
        acsd_gender: "",
        genderInput: "",
        acsd_description: "",
        acsd_address: "",
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

  const addAccused = () => {
    const newIndex = fields.length;
    append({
      type: "manual",
      rp_id: null,
      acsd_name: "",
      acsd_age: "",
      acsd_gender: "",
      genderInput: "",
      acsd_description: "",
      acsd_address: "",
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

  const removeAccused = (index: any) => {
    if (fields.length === 1) return;
    remove(index);
    if (activeTab === index) {
      setActiveTab(index > 0 ? index - 1 : 0);
    } else if (activeTab > index) {
      setActiveTab(activeTab - 1);
    }
    setSelectedResident(null);
  };

  const selectResidentAccused = (resident: any) => {
    setSelectedResident(resident);
    setValue(`accused.${activeTab}.type`, "resident");
    setValue(`accused.${activeTab}.rp_id`, resident.rp_id);
    setValue(`accused.${activeTab}.acsd_name`, resident.cpnt_name);
    setValue(`accused.${activeTab}.acsd_age`, resident.cpnt_age);
    setValue(`accused.${activeTab}.acsd_gender`, resident.cpnt_gender);
    setValue(`accused.${activeTab}.genderInput`, resident.cpnt_gender);
    setValue(`accused.${activeTab}.acsd_description`, `Resident: ${resident.cpnt_name}`);
    setValue(`accused.${activeTab}.acsd_address`, resident.cpnt_address || "");
    
    // Parse address for display
    if (resident.cpnt_address) {
      const addressParts = resident.cpnt_address.split(", ");
      setValue(`accused.${activeTab}.address`, {
        street: addressParts[0] || "",
        barangay: addressParts[1] || "",
        city: addressParts[2] || "",
        province: addressParts[3] || "",
        sitio: addressParts[4] || "",
      });
    }
    
    // Trigger validation after setting values
    setTimeout(() => {
      trigger(`accused.${activeTab}`);
    }, 100);
  };

  const switchToManualEntry = () => {
    setSelectedResident(null);
    setValue(`accused.${activeTab}.type`, "manual");
    setValue(`accused.${activeTab}.rp_id`, null);
    setValue(`accused.${activeTab}.acsd_address`, "");
    
    // Clear fields but keep manually entered data
    setValue(`accused.${activeTab}.acsd_name`, currentAccused?.acsd_name || "");
    setValue(`accused.${activeTab}.acsd_age`, currentAccused?.acsd_age || "");
    setValue(`accused.${activeTab}.acsd_gender`, currentAccused?.acsd_gender || "");
    setValue(`accused.${activeTab}.acsd_description`, currentAccused?.acsd_description || "");
  };

  const validateAge = (value: any) => {
    if (!value) return "Age is required";
    const age = parseInt(value);
    if (isNaN(age)) return "Age must be a number";
    if (age < 1 || age > 150) return "Age must be between 1 and 150";
    return true;
  };

  const getTabDisplayName = (index: any) => `Resp. ${index + 1}`;

  if (fields.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Tabs */}
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
                      removeAccused(index);
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
            onClick={addAccused}
            variant="outline"
            size="sm"
            className="ml-3 text-blue-600 border-blue-300 hover:bg-blue-50 whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Respondent
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div
        key={`tab-${activeTab}`}
        className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-6 shadow-sm"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-black/70">
              Respondent {activeTab + 1} Information
            </h3>
            <span className="text-sm text-gray-500">
              Tab {activeTab + 1} of {fields.length}
            </span>
          </div>

          {/* Resident Selection */}
          <div className="mb-6">
            <ComboboxInput
              value={selectedResident ? selectedResident.cpnt_name : ""}
              options={allResidents}
              isLoading={isResidentsLoading}
              label="Select Resident (Optional)"
              placeholder="Search or select a resident..."
              emptyText="No residents found."
              onSelect={(displayValue, item) => {
                if (item) {
                  selectResidentAccused(item);
                }
              }}
              displayKey="cpnt_name"
              valueKey="rp_id"
              additionalDataKey="cpnt_number"
              className="w-full"
            />
          </div>

          {/* Show resident info if linked */}
          {accusedType === "resident" && currentAccused?.rp_id && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-green-700">
                  <UserCheck className="h-4 w-4" />
                  <span className="font-medium">Linked to Resident Profile</span>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Full Name:</span>
                  <p className="text-gray-900">{currentAccused.acsd_name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Age:</span>
                  <p className="text-gray-900">{currentAccused.acsd_age}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Gender:</span>
                  <p className="text-gray-900">{currentAccused.genderInput || currentAccused.acsd_gender}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-900">{currentAccused.acsd_address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Hidden field for rp_id */}
          <input
            type="hidden"
            {...control.register(`accused.${activeTab}.rp_id`)}
          />

          {/* Form Fields */}
          <div className="space-y-6">
            <FormInput
              control={control}
              name={`accused.${activeTab}.acsd_name`}
              label="Full Name (If known)/Alias *"
              placeholder="Enter name or alias"
              readOnly={accusedType === "resident"}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`accused.${activeTab}.acsd_age`}
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
                        readOnly={accusedType === "resident"}
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
                      name={`accused.${activeTab}.acsd_gender`}
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
                                  setValue(`accused.${activeTab}.genderInput`, "");
                                } else {
                                  setValue(`accused.${activeTab}.genderInput`, value);
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
                      name={`accused.${activeTab}.genderInput`}
                      placeholder={
                        selectedGender === "Other"
                          ? "Enter gender"
                          : "Auto-filled from selection"
                      }
                      readOnly={selectedGender !== "Other" || accusedType === "resident"}
                      className={`${
                        selectedGender !== "Other" || accusedType === "resident"
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={control}
              name={`accused.${activeTab}.acsd_description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-black/50">
                    Description *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed description (e.g. physical appearance)..."
                      className="min-h-[120px]"
                      readOnly={accusedType === "resident"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Section - Only show for manual entry */}
            {accusedType === "manual" && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <FormLabel className="font-semibold text-black/50">
                    Complete Address (Street / Barangay / Municipality / Province) *
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
                          name={`accused.${activeTab}.address.${key}`}
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
                    {["street", "barangay", "city", "province"].map((fieldKey) => (
                      <FormField
                        key={fieldKey}
                        control={control}
                        name={`accused.${activeTab}.address.${fieldKey}`}
                        render={() => <FormMessage />}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};