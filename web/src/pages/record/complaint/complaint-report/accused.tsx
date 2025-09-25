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
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Search, Trash2 } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { useAllResidents } from "../api-operations/queries/complaintGetQueries";
import { Input } from "@/components/ui/input";
import { FormInput } from "@/components/ui/form/form-input";

type Resident = {
  rp_id: string;
  cpnt_name: string;
  cpnt_gender?: string;
  cpnt_age?: string;
  cpnt_number?: string;
  cpnt_address?: string;
  [key: string]: any;
};

export const AccusedInfo = () => {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "accused",
  });

  const [activeTab, setActiveTab] = useState(0);
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [selectedResidentValue, setSelectedResidentValue] = useState<string>("");

  const { data: allResidents = [], isLoading: isResidentsLoading } = useAllResidents();

  const currentAccused = watch(`accused.${activeTab}`);

  const addAccused = () => {
    const newIndex = fields.length;
    append({
      rp_id: null,
      acsd_name: "",
      acsd_age: "",
      acsd_gender: "",
      acsd_description: "",
      acsd_address: "",
    });
    setActiveTab(newIndex);
    setSelectedResident(null);
    setSelectedResidentValue("");
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
    setSelectedResidentValue("");
  };

  const selectResidentAccused = (residentId: string) => {
    const resident = allResidents.find((r: Resident) => r.rp_id === residentId);
    if (!resident) return;

    setSelectedResident(resident);
    setSelectedResidentValue(residentId);
    setValue(`accused.${activeTab}.rp_id`, resident.rp_id);
    setValue(`accused.${activeTab}.acsd_name`, resident.cpnt_name);
    setValue(`accused.${activeTab}.acsd_age`, resident.cpnt_age);
    
    // Format gender to match options
    const residentGender = resident.cpnt_gender;
    let formattedGender = "";
    if (residentGender) {
      formattedGender = residentGender.charAt(0).toUpperCase() + residentGender.slice(1).toLowerCase();
    }
    setValue(`accused.${activeTab}.acsd_gender`, formattedGender);
    
    setValue(`accused.${activeTab}.acsd_description`, "");
    setValue(`accused.${activeTab}.acsd_address`, resident.cpnt_address || "");
  };

  const clearSelection = () => {
    setSelectedResident(null);
    setSelectedResidentValue("");
    setValue(`accused.${activeTab}.rp_id`, null);
    setValue(`accused.${activeTab}.acsd_name`, "");
    setValue(`accused.${activeTab}.acsd_age`, "");
    setValue(`accused.${activeTab}.acsd_gender`, "");
    setValue(`accused.${activeTab}.acsd_description`, "");
    setValue(`accused.${activeTab}.acsd_address`, "");
  };

  // Only handle activeTab bounds checking
  useEffect(() => {
    if (activeTab >= fields.length && fields.length > 0) {
      setActiveTab(fields.length - 1);
    }
  }, [fields.length, activeTab]);

  // Reset selected resident when switching tabs
  useEffect(() => {
    const currentAccusedData = watch(`accused.${activeTab}`);
    if (currentAccusedData?.rp_id) {
      const resident = allResidents.find((r: Resident) => r.rp_id === currentAccusedData.rp_id);
      setSelectedResident(resident || null);
      setSelectedResidentValue(currentAccusedData.rp_id);
    } else {
      setSelectedResident(null);
      setSelectedResidentValue("");
    }
  }, [activeTab, allResidents, watch]);

  const getTabDisplayName = (index: any) => `Resp. ${index + 1}`;

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

  const isResidentSelected = currentAccused?.rp_id;

  return (
    <div className="rounded-lg mt-10">
      {/* Header Section */}
      <div className="bg-white p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-black/70">
            Respondent Information
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Please select a registered resident as the respondent. Only registered residents can be filed as respondents in a complaint. The description field can be edited to provide additional details about the incident.
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

      {/* Form Content */}
      <div
        key={`tab-${activeTab}`}
        className="bg-white rounded-lg p-6"
      >
        <div className="space-y-6">
          {/* Resident Search Section with Combobox */}
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <Combobox 
                  options={residentOptions}
                  value={selectedResidentValue}
                  onChange={(value) => {
                    if (value) {
                      selectResidentAccused(value);
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
            </div>
          </div>

          {/* Form Fields - Read-only except for description */}
          <div className="space-y-6 p-4 rounded-lg">
            <FormInput
              control={control}
              name={`accused.${activeTab}.acsd_name`}
              label="Full Name *"
              placeholder="Please select a registered resident above"
              className="max-w-full "
              readOnly={true}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`accused.${activeTab}.acsd_age`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-black/50">
                      Age
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="150"
                        placeholder="Auto-filled from resident data"
                        {...field}
                        readOnly={true}
                        className=""
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`accused.${activeTab}.acsd_gender`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-black/50">
                      Gender
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Auto-filled from resident data"
                        {...field}
                        readOnly={true}
                        className=""
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormInput
              control={control}
              name={`accused.${activeTab}.acsd_address`}
              label="Complete Address *"
              placeholder="Auto-filled from resident data"
              className="max-w-full "
              readOnly={true}
            />

            {/* Description Field - Only editable field */}
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
                      placeholder="Provide detailed description of the respondent's involvement in the incident..."
                      className="min-h-[120px] bg-white border-2 border-blue-200 focus:border-blue-400"
                      {...field}
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Hidden field for rp_id */}
          <input
            type="hidden"
            {...control.register(`accused.${activeTab}.rp_id`)}
          />
        </div>
      </div>
    </div>
  );
};