import { useFieldArray, useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import { Plus, X, UserCheck, Search } from "lucide-react";
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

  const { data: allResidents = [], isLoading: isResidentsLoading } =
    useAllResidents();

  const currentComplainant = watch(`complainant.${activeTab}`);
  const complainantType = currentComplainant?.type || "manual";

  const addComplainant = () => {
    const newIndex = fields.length;
    append({
      type: "manual",
      rp_id: null,
      cpnt_name: "",
      cpnt_gender: "",
      cpnt_age: "",
      cpnt_relation_to_respondent: "",
      cpnt_number: "",
      cpnt_address: "",
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
  };

  const switchToManualEntry = () => {
    setSelectedResident(null);
    setValue(`complainant.${activeTab}.type`, "manual");
    setValue(`complainant.${activeTab}.rp_id`, null);
    setValue(`complainant.${activeTab}.cpnt_address`, "");
  };

  const genderOptions = [
    { id: "Male", name: "Male" },
    { id: "Female", name: "Female" },
  ];

  useEffect(() => {
    if (fields.length === 0) {
      append({
        type: "manual",
        rp_id: null,
        cpnt_name: "",
        cpnt_gender: "",
        cpnt_age: "",
        cpnt_relation_to_respondent: "",
        cpnt_number: "",
        cpnt_address: "",
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
    displayName: `${resident.cpnt_name} (ID: ${resident.rp_id})`,
    searchableText: `${resident.rp_id} ${resident.cpnt_name} ${resident.cpnt_number || ''}`.toLowerCase(),
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
          {/* Improved Resident Search Section */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-green-600" />
                <FormLabel className="font-semibold text-green-700">
                  Search and Link Resident Profile (Optional)
                </FormLabel>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                <div className="lg:col-span-2">
                  <ComboboxInput
                    value={
                      selectedResident
                        ? `${selectedResident.cpnt_name} (ID: ${selectedResident.rp_id})`
                        : ""
                    }
                    options={formattedResidents}
                    isLoading={isResidentsLoading}
                    placeholder="Search by name, ID, or contact number..."
                    emptyText="No residents found. Try a different search term."
                    onSelect={(item) => {
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
                
                {complainantType === "resident" && currentComplainant?.rp_id && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={switchToManualEntry}
                    className="text-red-600 border-red-300 hover:bg-red-50 h-10"
                  >
                    Switch to Manual Entry
                  </Button>
                )}
              </div>

              <p className="text-xs text-green-600">
                Tip: Search by name, resident ID, or contact number to quickly link an existing resident profile.
              </p>
            </div>
          </div>

          {/* Show resident info if linked */}
          {complainantType === "resident" && currentComplainant?.rp_id && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-700">
                  Linked to Resident Profile
                </span>
              </div>

              {/* Display resident information in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                    Resident ID
                  </span>
                  <p className="text-gray-900 font-mono">{currentComplainant.rp_id}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                    Full Name
                  </span>
                  <p className="text-gray-900 font-medium">{currentComplainant.cpnt_name}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                    Age
                  </span>
                  <p className="text-gray-900">{currentComplainant.cpnt_age}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                    Gender
                  </span>
                  <p className="text-gray-900">{currentComplainant.cpnt_gender}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                    Contact
                  </span>
                  <p className="text-gray-900">{currentComplainant.cpnt_number || 'N/A'}</p>
                </div>
                <div className="bg-white p-3 rounded border md:col-span-2 lg:col-span-1">
                  <span className="font-medium text-gray-600 text-xs uppercase tracking-wide">
                    Address
                  </span>
                  <p className="text-gray-900">{currentComplainant.cpnt_address || 'N/A'}</p>
                </div>
              </div>

              {/* Only show relationship field for linked residents */}
              <div className="mt-4 max-w-md">
                <FormInput
                  control={control}
                  name={`complainant.${activeTab}.cpnt_relation_to_respondent`}
                  label="Relationship to Respondent *"
                  placeholder="e.g., Neighbor, Friend, Relative, etc."
                />
              </div>
            </div>
          )}

          {/* Hidden field for rp_id */}
          <input
            type="hidden"
            {...control.register(`complainant.${activeTab}.rp_id`)}
          />

          {/* Manual entry form (shown when not linked to resident) */}
          {complainantType !== "resident" || !currentComplainant?.rp_id ? (
            <div className="space-y-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <FormInput
                control={control}
                name={`complainant.${activeTab}.cpnt_name`}
                label="Full Name *"
                placeholder="Enter full name"
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

                <FormField
                  control={control}
                  name={`complainant.${activeTab}.cpnt_gender`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-black/50">
                        Gender *
                      </FormLabel>
                      <FormControl>
                        <SelectLayout
                          placeholder="Select gender"
                          label=""
                          options={genderOptions}
                          value={field.value || ""}
                          onChange={field.onChange}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormInput
                  control={control}
                  name={`complainant.${activeTab}.cpnt_number`}
                  label="Contact Number *"
                  placeholder="e.g., +63 912 345 6789"
                  type="tel"
                />
              </div>

              <FormInput
                control={control}
                name={`complainant.${activeTab}.cpnt_relation_to_respondent`}
                label="Relationship to Respondent *"
                placeholder="e.g., Neighbor, Friend, Relative"
              />

              {/* Single Line Address Field */}
              <FormInput
                control={control}
                name={`complainant.${activeTab}.cpnt_address`}
                label="Complete Address *"
                placeholder="Enter complete address (Street, Barangay, City/Municipality, Province)"
                className="max-w-full"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};