import { useFieldArray, useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import { X, Search, Trash2, ChevronRight, PlusCircle} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useAllResidents } from "../api-operations/queries/complaintGetQueries";
import { Combobox } from "@/components/ui/combobox";
import { MdAccountCircle } from "react-icons/md";

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

interface ComplainantInfoProps {
  onNext: () => void;
  isSubmitting: boolean;
}

export const ComplainantInfo: React.FC<ComplainantInfoProps> = ({ onNext, isSubmitting}) => {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "complainant",});
  const [activeTab, setActiveTab] = useState(0);
  const [selectedResidentValue, setSelectedResidentValue] = useState<string>("");
  const { data: allResidents = [] } = useAllResidents();
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
    setSelectedResidentValue("");
  };

  const selectResidentComplainant = (residentId: string) => {
    const resident = allResidents.find((r: Resident) => r.rp_id === residentId);
    if (!resident) return;

    setSelectedResidentValue(residentId);
    setValue(`complainant.${activeTab}.rp_id`, resident.rp_id);
    setValue(`complainant.${activeTab}.cpnt_name`, resident.name);

    const residentGender = resident.gender;
    let formattedGender = "";
    if (residentGender) {
      formattedGender =
        residentGender.charAt(0).toUpperCase() +
        residentGender.slice(1).toLowerCase();
    }
    setValue(`complainant.${activeTab}.cpnt_gender`, formattedGender);
    setValue(`complainant.${activeTab}.cpnt_age`, resident.age);
    setValue(`complainant.${activeTab}.cpnt_number`, resident.number || "");
    setValue(
      `complainant.${activeTab}.cpnt_relation_to_respondent`,
      resident.cpnt_relation_to_respondent || ""
    );
    setValue(`complainant.${activeTab}.cpnt_address`, resident.address || "");
  };

  const clearSelection = () => {
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
      setSelectedResidentValue(currentComplainantData.rp_id);
    } else {
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
        <span className="inline-block px-2 py-1 text-xs font-normal bg-green-500 text-white rounded">
          #{resident.rp_id}
        </span>
        <span className="text-sm">{resident.name}</span>
      </div>
    ),
  }));

  if (fields.length === 0) return null;

  const isResidentSelected = currentComplainant?.rp_id;

  return (
    <div className="rounded-lg mt-6 md:mt-10">
      {/* Header Section */}
      <div className="bg-white p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex text-blue-500 items-center justify-center mb-2">
            <MdAccountCircle size={30} className="mr-2" />
            <h3 className="text-base sm:text-lg font-bold">Complainant</h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md px-4">
            Information about the person submitting the complaint, including
            their identity and contact details.
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div key={`tab-${activeTab}`} className="bg-white rounded-lg p-4 sm:p-6">
        {/* Form Fields - Always visible and editable */}
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 bg-white border-gray-200 rounded-lg">
          <div className="space-y-3">
            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 sm:mb-10">
              <div className="flex items-center space-x-2 flex-1 overflow-x-auto pb-2 sm:pb-0">
                {fields.map((field, index) => (
                  <Button
                    key={field.id}
                    type="button"
                    variant={activeTab === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setActiveTab(index);
                    }}
                    className={`relative flex items-center gap-2 px-3 py-2 transition-colors whitespace-nowrap min-w-fit ${
                      activeTab === index
                        ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
                        : "bg-ashGray/40 text-black/50 hover:bg-gray-200 border-gray-300"
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">
                      {getTabDisplayName(index)}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeComplainant(index);
                        }}
                        className={`p-1 rounded-full transition-colors ${
                          activeTab === index
                            ? "hover:bg-blue-700 text-blue-100 hover:text-white"
                            : "hover:bg-red-100 text-gray-500 hover:text-red-600"
                        }`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Button>
                ))}
              </div>
              <Button
                type="button"
                onClick={addComplainant}
                variant="outline"
                size="sm"
                className="text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-500 hover:text-white whitespace-nowrap w-full sm:w-auto"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                <span className="sm:hidden">Add Complainant</span>
              </Button>
            </div>

            {/* Resident Search Section */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-2">
                  Search and select a record if the complainant is a registered
                  resident.
                </p>
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
                  triggerClassName="w-full text-gray-500 font-normal"
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
                  className="text-red-600 border-red-300 hover:bg-red-50 h-10 px-3 w-full sm:w-auto"
                  title="Clear Selection"
                >
                  <Trash2 className="h-4 w-4 mr-2 sm:mr-0" />
                  <span className="sm:hidden">Clear Selection</span>
                </Button>
              )}
            </div>
          </div>

          {/* Full Name */}
          <FormInput
            control={control}
            name={`complainant.${activeTab}.cpnt_name`}
            label="Full Name *"
            placeholder="Enter full name"
            className="max-w-full text-gray-500 font-normal"
          />

          {/* Age, Gender, Contact Number Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              control={control}
              name={`complainant.${activeTab}.cpnt_age`}
              rules={{ validate: validateAge }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-gray-700 text-sm">
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
                      className="text-sm"
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
                  <FormLabel className="font-semibold text-gray-700 text-sm">
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
              className="sm:col-span-2 lg:col-span-1"
            />
          </div>

          {/* Complete Address */}
          <FormInput
            control={control}
            name={`complainant.${activeTab}.cpnt_address`}
            label="Complete Address *"
            placeholder="Enter complete address (Street, Barangay, City/Municipality, Province)"
            className="max-w-full"
          />

          {/* Relationship to Respondent */}
          <FormInput
            control={control}
            name={`complainant.${activeTab}.cpnt_relation_to_respondent`}
            label="Relationship to Respondent *"
            placeholder="e.g., Neighbor, Friend, Relative, etc."
          />
        </div>

        {/* Hidden field for rp_id */}
        <input
          type="hidden"
          {...control.register(`complainant.${activeTab}.rp_id`)}
        />

        {/* Navigation Button */}
        <div className="flex justify-end pt-4 sm:pt-6 border-t border-gray-200 mt-4 sm:mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onNext}
            className="flex items-center gap-2 text-darkGray hover:bg-blue-500 hover:text-white w-full sm:w-auto"
            disabled={isSubmitting}
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};