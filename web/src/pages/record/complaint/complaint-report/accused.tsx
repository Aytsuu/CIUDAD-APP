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
import { Plus, X, Search, Trash2 } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { useAllResidents } from "../api-operations/queries/complaintGetQueries";
import { Input } from "@/components/ui/input";
import { FormInput } from "@/components/ui/form/form-input";

type Resident = {
  rp_id: string;
  name: string;
  gender?: string;
  age?: string;
  number?: string;
  address?: string;
  [key: string]: any;
};

export const AccusedInfo = () => {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "accused",
  });

  const [activeTab, setActiveTab] = useState(0);
  const selectedGender = watch(`accused.${activeTab}.gender`);

  useEffect(() => {
    if (fields.length === 0) {
      append({
        alias: "",
        age: "",
        gender: "",
        genderInput: "",
        description: "",
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
      alias: "",
      age: "",
      gender: "",
      genderInput: "",
      description: "",
      address: {
        street: "",
        barangay: "",
        city: "",
        province: "",
        sitio: "",
      },
    });
    setActiveTab(newIndex);
  };

  const removeAccused = (index: number) => {
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
      formattedGender = residentGender.charAt(0).toUpperCase() + residentGender.slice(1).toLowerCase();
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

  const getTabDisplayName = (index: number) => `Resp. ${index + 1}`;

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
                onClick={() => setActiveTab(index)}
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

          {/* Name */}
          <FormField
            control={control}
            name={`accused.${activeTab}.alias`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-black/50">
                  Full Name (If known)/Alias *
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter name or alias" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age and Gender */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`accused.${activeTab}.age`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-black/50">
                    Age *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Age"
                      className="!text-black"
                      {...field}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
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
                <FormField
                  control={control}
                  name={`accused.${activeTab}.gender`}
                  render={({ field }) => (
                    <FormItem className="flex-shrink-0">
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Clear genderInput when changing selection
                            setValue(`accused.${activeTab}.genderInput`, "");
                          }}
                          value={field.value}
                        >
                          <SelectTrigger className="w-20 h-9 rounded-r-none border-r-0 px-2">
                            <SelectValue>
                              {field.value === "Male" && (
                                <User className="h-4 w-4 text-darkGray" />
                              )}
                              {field.value === "Female" && (
                                <Users className="h-4 w-4 text-darkGray" />
                              )}
                              {field.value === "Other" && (
                                <HelpCircle className="h-4 w-4 text-darkGray" />
                              )}
                              {field.value === "Prefer not to say" && (
                                <UserX className="h-4 w-4 text-darkGray" />
                              )}
                              {!field.value && (
                                <span className="text-gray-400 text-xs">
                                  Select
                                </span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-darkGray" />
                                <span>Male</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Female">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-darkGray" />
                                <span>Female</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Other">
                              <div className="flex items-center gap-2">
                                <HelpCircle className="h-4 w-4 text-darkGray" />
                                <span>Other</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Prefer not to say">
                              <div className="flex items-center gap-2">
                                <UserX className="h-4 w-4 text-darkGray" />
                                <span>Prefer not to say</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`accused.${activeTab}.genderInput`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder={
                            selectedGender === "Other"
                              ? "Enter gender"
                              : "Auto-filled from selection"
                          }
                          disabled={selectedGender !== "Other"}
                          value={
                            selectedGender === "Other"
                              ? field.value
                              : selectedGender || ""
                          }
                          onChange={
                            selectedGender === "Other"
                              ? field.onChange
                              : undefined
                          }
                          className={`h-10 rounded-l-none !text-black ${
                            selectedGender !== "Other"
                              ? "bg-gray-100 cursor-not-allowed !text-black"
                              : ""
                          }`}
                        />
                      </FormControl>
                      {selectedGender === "Other" && <FormMessage />}
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <FormField
            control={control}
            name={`accused.${activeTab}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-black/50">
                  Description *
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide detailed description (e.g. physical appearance)..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
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

            {/* Address Validation Messages */}
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
      </div>
    </div>
  );
};
