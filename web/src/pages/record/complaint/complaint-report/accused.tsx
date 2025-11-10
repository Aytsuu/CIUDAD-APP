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
import {
  X,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { useAllResidents } from "../api-operations/queries/complaintGetQueries";
import { Input } from "@/components/ui/input";
import { FormInput } from "@/components/ui/form/form-input";
import { MdAccountCircle } from "react-icons/md";

type Resident = {
  rp_id: string;
  name: string;
  gender?: string;
  age?: string;
  number?: string;
  address?: string;
  [key: string]: any;
};

interface AccusedInfoProps {
  onNext: () => void;
  onPrevious: () => void;
  isSubmitting: boolean;
}

export const AccusedInfo: React.FC<AccusedInfoProps> = ({
  onNext,
  onPrevious,
  isSubmitting,
}) => {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "accused",
  });

  const [activeTab, setActiveTab] = useState(0);
  const [_selectedResident, setSelectedResident] = useState<any>(null);
  const [selectedResidentValue, setSelectedResidentValue] =
    useState<string>("");

  const { data: allResidents = [], isLoading: _isResidentsLoading } =
    useAllResidents();

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
    setValue(`accused.${activeTab}.acsd_name`, resident.name);
    setValue(`accused.${activeTab}.acsd_age`, resident.age);

    // Format gender to match options
    const residentGender = resident.gender;
    let formattedGender = "";
    if (residentGender) {
      formattedGender =
        residentGender.charAt(0).toUpperCase() +
        residentGender.slice(1).toLowerCase();
    }
    setValue(`accused.${activeTab}.acsd_gender`, formattedGender);

    setValue(`accused.${activeTab}.acsd_description`, "");
    setValue(`accused.${activeTab}.acsd_address`, resident.address || "");
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
      const resident = allResidents.find(
        (r: Resident) => r.rp_id === currentAccusedData.rp_id
      );
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
        <span>{resident.name}</span>
      </div>
    ),
  }));

  if (fields.length === 0) return null;

  const isResidentSelected = currentAccused?.rp_id;

  return (
    <div className="rounded-lg mt-10">
      {/* Header Section */}
      <div className="bg-white p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex text-blue-500 items-center justify-center mb-2">
            <MdAccountCircle size={30} className="mr-2" />
            <h3 className="text-lg font-bold">Respondent</h3>
          </div>
          <p className="text-xs text-gray-600 max-w-md">
            Please select a registered resident as the respondent. Only
            registered residents can be filed as respondents in a complaint. The
            description field can be edited to provide additional details about
            the incident.
          </p>
        </div>
      </div>
      <div key={`tab-${activeTab}`} className="bg-white rounded-lg p-6">
        <div className="space-y-6">
          {/* Form Fields - Read-only except for description */}
          <div className="space-y-6 p-4 rounded-lg">
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
                className="ml-3 text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-500 hover:text-white whitespace-nowrap"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
          </div>
          {/* Resident Search Section with Combobox */}
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
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
                      selectResidentAccused(value);
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
                  className="text-red-600 border-red-300 hover:bg-red-50 h-10 px-3"
                  title="Clear Selection"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
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
                    <FormLabel className="font-semibold text-gray-700">
                      Age
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="150"
                        placeholder=""
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
                    <FormLabel className="font-semibold text-gray-700">
                      Gender
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder=""
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
              placeholder=""
              className="max-w-full "
              readOnly={true}
            />

            {/* Description Field - Only editable field */}
            <FormField
              control={control}
              name={`accused.${activeTab}.acsd_description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-gray-700">
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

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onPrevious}
              className="flex items-center gap-2 text-darkGray hover:bg-blue-500 hover:text-white"
              disabled={isSubmitting}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onNext}
              className="flex items-center gap-2 text-darkGray hover:bg-blue-500 hover:text-white"
              disabled={isSubmitting}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
