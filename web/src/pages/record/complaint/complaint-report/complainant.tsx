import { useFieldArray, useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import { Plus, X, UserCheck, Search, Trash2 } from "lucide-react";
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
import { Combobox } from "@/components/ui/combobox";

type Resident = {
  rp_id: string;
  name: string;
  gender?: string;
  age?: string;
  number?: string;
  cpnt_relation_to_respondent?: string;
  address?: string;
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
  const [selectedResidentValue, setSelectedResidentValue] = useState<string>("");

  const { data: allResidents = [], isLoading: isResidentsLoading } =
    useAllResidents();

  const currentComplainant = watch(`complainant.${activeTab}`);

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
    setSelectedResidentValue("");
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
    setSelectedResidentValue("");
  };

  const selectResidentComplainant = (residentId: string) => {
    const resident = allResidents.find((r: Resident) => r.rp_id === residentId);
    if (!resident) return;

    setSelectedResident(resident);
    setSelectedResidentValue(residentId);
    setValue(`complainant.${activeTab}.rp_id`, resident.rp_id);
    setValue(`complainant.${activeTab}.cpnt_name`, resident.name);
    
    // Fix gender mapping - ensure it matches the option values
    const residentGender = resident.cpnt_gender;
    let formattedGender = "";
    if (residentGender) {
      formattedGender = residentGender.charAt(0).toUpperCase() + residentGender.slice(1).toLowerCase();
    }
    setValue(`complainant.${activeTab}.cpnt_gender`, formattedGender);
    
    setValue(`complainant.${activeTab}.cpnt_age`, resident.age);
    setValue(
      `complainant.${activeTab}.cpnt_number`,
      resident.number || ""
    );
    setValue(
      `complainant.${activeTab}.cpnt_relation_to_respondent`,
      resident.cpnt_relation_to_respondent || ""
    );
    setValue(
      `complainant.${activeTab}.cpnt_address`,
      resident.address || ""
    );
  };

  const clearSelection = () => {
    setSelectedResident(null);
    setSelectedResidentValue("");
    setValue(`complainant.${activeTab}.rp_id`, null);
    setValue(`complainant.${activeTab}.cpnt_name`, "");
    setValue(`complainant.${activeTab}.cpnt_gender`, "");
    setValue(`complainant.${activeTab}.cpnt_age`, "");
    setValue(`complainant.${activeTab}.cpnt_number`, "");
    setValue(`complainant.${activeTab}.cpnt_relation_to_respondent`, "");
    setValue(`complainant.${activeTab}.cpnt_address`, "");
  };

  const genderOptions = [
    { id: "Male", name: "Male" },
    { id: "Female", name: "Female" },
  ];

  // Only handle activeTab bounds checking
  useEffect(() => {
    if (activeTab >= fields.length && fields.length > 0) {
      setActiveTab(fields.length - 1);
    }
  }, [fields.length, activeTab]);

  // Reset selected resident when switching tabs
  useEffect(() => {
    const currentComplainantData = watch(`complainant.${activeTab}`);
    if (currentComplainantData?.rp_id) {
      const resident = allResidents.find((r: Resident) => r.rp_id === currentComplainantData.rp_id);
      setSelectedResident(resident || null);
      setSelectedResidentValue(currentComplainantData.rp_id);
    } else {
      setSelectedResident(null);
      setSelectedResidentValue("");
    }
  }, [activeTab, allResidents, watch]);

  const getTabDisplayName = (index: any) => `Comp. ${index + 1}`;

  const validateAge = (value: any) => {
    if (!value) return "Age is required";
    const age = parseInt(value);
    if (isNaN(age)) return "Age must be a number";
    if (age < 1 || age > 150) return "Age must be between 1 and 150";
    return true;
  };

  // Format residents for Combobox
  const residentOptions = allResidents.map((resident: Resident) => ({
    id: resident.rp_id,
    name: (
      <div className="flex items-center gap-2">
        <span className="inline-block px-2 py-1 text-s font-normal bg-green-500 text-white rounded">
          #{resident.rp_id}
        </span>
        <span>{resident.cpnt_name}</span>
      </div>
    ),
  }));

  if (fields.length === 0) return null;

  const isResidentSelected = currentComplainant?.rp_id;

  return (
    <div className="rounded-lg mt-10">
      {/* Header Section */}
      <div className="bg-white p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-black/70">
            Complainant Information
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Please fill out the complainant's information. You can select from existing residents or manually enter new information. All fields marked with * are required.
        </p>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between">
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
        className="bg-white rounded-lg p-6"
      >
        <div className="space-y-6">
          {/* Resident Search Section with Combobox */}
          <div className="space-y-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Combobox 
                  options={residentOptions}
                  value={selectedResidentValue}
                  onChange={(value) => {
                    if (value) {
                      selectResidentComplainant(value);
                    } else {
                      clearSelection();
                    }
                  }}
                  placeholder="Select a resident"
                  triggerClassName="w-full"
                  contentClassName="w-full max-w-2xl"
                  emptyMessage={
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <Search className="h-8 w-8 text-gray-300 mb-2" />
                      <span className="font-normal text-gray-500 text-sm">
                        No resident found.
                      </span>
                    </div>
                  }
                />
              </div>

              {isResidentSelected && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  className="text-red-600 border-red-300 hover:bg-red-50 h-10 px-3"
                  title="Clear Selection"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
                        {/* {isResidentSelected && (
            <div className="flex items-center gap-2 text-green-600">
              <UserCheck className="h-4 w-4" />
              <span className="text-sm font-medium">Resident Selected</span>
            </div>
          )} */}
            </div>
          </div>

          {/* Form Fields - Always visible and editable */}
          <div className="space-y-6 p-4 bg-white border-gray-200 rounded-lg">
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
              placeholder="e.g., Neighbor, Friend, Relative, etc."
            />

            <FormInput
              control={control}
              name={`complainant.${activeTab}.cpnt_address`}
              label="Complete Address *"
              placeholder="Enter complete address (Street, Barangay, City/Municipality, Province)"
              className="max-w-full"
            />
          </div>

          {/* Hidden field for rp_id */}
          <input
            type="hidden"
            {...control.register(`complainant.${activeTab}.rp_id`)}
          />
        </div>
      </div>
    </div>
  );
};