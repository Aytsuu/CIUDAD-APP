import { useFieldArray, useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import { Plus, X, Search, UserCheck, UserPlus } from "lucide-react";
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
import { useSearchComplainants } from "../api-operations/queries/complaintGetQueries";

export const ComplainantInfo = () => {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "complainant",
  });
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Watch current complainant data
  const currentComplainant = watch(`complainant.${activeTab}`);
  const complainantType = currentComplainant?.type || "manual";

  // Search query
  const { data: searchResults = [], isLoading: isSearchLoading } = useSearchComplainants(searchQuery);

  const addComplainant = () => {
    const newIndex = fields.length;
    append({
      type: "manual", 
      rp_id: null, 
      fullName: "",
      gender: "",
      genderInput: "",
      age: "",
      relation_to_respondent: "",
      contactNumber: "",
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

  const removeComplainant = (index: any) => {
    if (fields.length === 1) return;
    remove(index);
    if (activeTab === index) {
      setActiveTab(index > 0 ? index - 1 : 0);
    } else if (activeTab > index) {
      setActiveTab(activeTab - 1);
    }
  };

  const selectResidentComplainant = (resident: any) => {
    setValue(`complainant.${activeTab}.type`, "resident");
    setValue(`complainant.${activeTab}.rp_id`, resident.rp_id);
    setValue(`complainant.${activeTab}.fullName`, resident.full_name);
    setValue(`complainant.${activeTab}.gender`, resident.gender);
    setValue(`complainant.${activeTab}.genderInput`, resident.gender);
    setValue(`complainant.${activeTab}.age`, resident.age.toString());
    setValue(`complainant.${activeTab}.contactNumber`, resident.contact_number || "");
    
    // Parse address from ResidentProfile format
    if (resident.address) {
      const addressParts = resident.address.split(", ");
      setValue(`complainant.${activeTab}.address`, {
        street: addressParts[0] || "",
        barangay: addressParts[1] || "",
        city: addressParts[2] || "",
        province: addressParts[3] || "",
        sitio: "",
      });
    }
    
    setSearchQuery("");
    setIsSearching(false);
  };

  const switchToManualEntry = () => {
    setValue(`complainant.${activeTab}.type`, "manual");
    setValue(`complainant.${activeTab}.rp_id`, null);
    setIsSearching(false);
  };

  const selectedGender = watch(`complainant.${activeTab}.gender`);

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
        fullName: "",
        gender: "",
        genderInput: "",
        age: "",
        relation_to_respondent: "",
        contactNumber: "",
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
        <h3 className="text-base font-semibold text-black/70 mb-6">
          Complainant {activeTab + 1} Information
        </h3>

        {/* Entry Type Selection */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant={isSearching ? "default" : "outline"}
              onClick={() => setIsSearching(true)}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search Resident
            </Button>
            <Button
              type="button"
              variant={!isSearching ? "default" : "outline"}
              onClick={switchToManualEntry}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Manual Entry
            </Button>
          </div>
        </div>

        {/* Search Section */}
        {isSearching && (
          <div className="mb-6 space-y-3">
            <div className="relative">
              <Input
                placeholder="Search by name, contact number, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="max-h-60 overflow-y-auto border rounded-lg bg-white">
                {isSearchLoading ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y">
                    {searchResults.map((resident: any) => (
                      <div
                        key={resident.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => selectResidentComplainant(resident)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{resident.cpnt_name}</h4>
                            <p className="text-sm text-gray-600">
                              {resident.cpnt_gender}, Age {resident.cpnt_age}
                            </p>
                            <p className="text-sm text-gray-500">{resident.cpnt_number}</p>
                            <p className="text-xs text-gray-400 mt-1">{resident.cpnt_address}</p>
                          </div>
                          <UserCheck className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No residents found. Try different search terms.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Form Fields */}
        {!isSearching && (
          <div className="space-y-6">
            {/* Show resident info if linked */}
            {complainantType === "resident" && currentComplainant?.rp_id && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <UserCheck className="h-4 w-4" />
                  <span className="font-medium">Linked to Resident Profile ID: {currentComplainant.rp_id}</span>
                </div>
              </div>
            )}

            {/* Hidden field for rp_id */}
            <input
              type="hidden"
              {...control.register(`complainant.${activeTab}.rp_id`)}
            />

            <FormInput
              control={control}
              name={`complainant.${activeTab}.fullName`}
              label="Full Name *"
              placeholder="Enter full name"
              className="max-w-full"
              readOnly={complainantType === "resident"}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={control}
                name={`complainant.${activeTab}.age`}
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
                        readOnly={complainantType === "resident"}
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
                      name={`complainant.${activeTab}.gender`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <SelectLayout
                              placeholder="Select gender"
                              label="Gender Options"
                              options={genderOptions}
                              value={field.value || ""}
                              onChange={(value) => {
                                field.onChange(value);
                                if (value === "Other") {
                                  setValue(`complainant.${activeTab}.genderInput`, "");
                                } else {
                                  setValue(`complainant.${activeTab}.genderInput`, value);
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
                      readOnly={selectedGender !== "Other" || complainantType === "resident"}
                      className={`${
                        selectedGender !== "Other" || complainantType === "resident"
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              <FormInput
                control={control}
                name={`complainant.${activeTab}.contactNumber`}
                label="Contact Number *"
                placeholder="e.g. +63 912 345 6789"
                type="tel"
                readOnly={complainantType === "resident"}
              />
            </div>

            <FormInput
              control={control}
              name={`complainant.${activeTab}.relation_to_respondent`}
              label="Relationship to Respondent *"
              placeholder="e.g. Neighbor, Friend, Relative"
            />

            {/* Address Section */}
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
                        name={`complainant.${activeTab}.address.${key}`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={placeholder}
                                className="border-none shadow-none px-2 h-10 md:h-8"
                                readOnly={complainantType === "resident"}
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
                      name={`complainant.${activeTab}.address.${fieldKey}`}
                      render={() => <FormMessage />}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};