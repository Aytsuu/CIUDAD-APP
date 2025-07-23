import { useFieldArray, useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import { Plus, X, User, Users, UserX, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";

export const ComplainantInfo = () => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "complainant",
  });
  const { watch } = useFormContext();
  const [activeTab, setActiveTab] = useState(0);

  const addComplainant = () => {
    const newIndex = fields.length;
    append({
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

  const removeComplainant = (index: number) => {
    if (fields.length === 1) return;
    remove(index);
    if (activeTab === index) {
      setActiveTab(index > 0 ? index - 1 : 0);
    } else if (activeTab > index) {
      setActiveTab(activeTab - 1);
    }
  };

  const selectedGender = watch(`complainant.${activeTab}.gender`);
  
  useEffect(() => {
    if (fields.length === 0) {
      append({
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

  const getTabDisplayName = (index: number) => `Comp. ${index + 1}`;

  const validateAge = (value: string) => {
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

        {/* Personal Information Section */}
        <div className="space-y-6">
          {/* Full Name */}
          <FormField
            control={control}
            name={`complainant.${activeTab}.fullName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-black/50">
                  Full Name *
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter full name" 
                    className="max-w-md"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age and Gender Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow positive integers
                        if (value === '' || /^\d+$/.test(value)) {
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gender and Gender Details Combined */}
            <div className="md:col-span-3">
              <FormLabel className="font-semibold text-black/50">
                Gender *
              </FormLabel>
              <div className="flex my-2">
                <FormField
                  control={control}
                  name={`complainant.${activeTab}.gender`}
                  render={({ field }) => (
                    <FormItem className="flex-shrink-0">
                      <FormControl>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Auto-fill the gender input field based on selection
                            const genderInputField = `complainant.${activeTab}.genderInput`;
                            if (value === "Other") {
                              // Clear the input when Other is selected so user can type
                              control._formValues.complainant[activeTab].genderInput = "";
                            } else {
                              // Auto-fill with the selected value
                              control._formValues.complainant[activeTab].genderInput = value;
                            }
                          }} 
                          value={field.value}
                        >
                          <SelectTrigger className="w-16 h-9 px-2 rounded-r-none border-r-0">
                            <SelectValue>
                              {field.value === "Male" && <User className="h-4 w-4 text-blue-600" />}
                              {field.value === "Female" && <Users className="h-4 w-4 text-pink-600" />}
                              {field.value === "Other" && <HelpCircle className="h-4 w-4 text-purple-600" />}
                              {field.value === "Prefer not to say" && <UserX className="h-4 w-4 text-gray-600" />}
                              {!field.value && <span className="text-gray-400 text-xs">Select</span>}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600" />
                                <span>Male</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Female">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-pink-600" />
                                <span>Female</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Other">
                              <div className="flex items-center gap-2">
                                <HelpCircle className="h-4 w-4 text-purple-600" />
                                <span>Other</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Prefer not to say">
                              <div className="flex items-center gap-2">
                                <UserX className="h-4 w-4 text-gray-600" />
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
                  name={`complainant.${activeTab}.genderInput`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          placeholder={selectedGender === "Other" ? "Enter gender" : "Auto-filled from selection"}
                          disabled={selectedGender !== "Other"}
                          value={selectedGender === "Other" ? field.value : selectedGender || ""}
                          onChange={selectedGender === "Other" ? field.onChange : undefined}
                          className={`h-10 rounded-l-none ${selectedGender !== "Other" ? "bg-gray-100 cursor-not-allowed" : ""} h-9`}
                        />
                      </FormControl>
                      {selectedGender === "Other" && <FormMessage />}
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Contact and Relationship Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`complainant.${activeTab}.contactNumber`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-black/50">
                    Contact Number *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="tel"
                      placeholder="e.g. +63 912 345 6789" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`complainant.${activeTab}.relation_to_respondent`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-black/50">
                    Relationship to Respondent *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Neighbor, Friend, Relative" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h4 className="text-base font-semibold text-black/70">
              Address Information
            </h4>
            
            <div className="space-y-3">
              <FormLabel className="font-semibold text-black/50">
                Complete Address (Street / Barangay / Municipality / Province) *
              </FormLabel>
              
              <div className="flex flex-col md:flex-row items-stretch border-2 border-gray-300 rounded-lg p-2 bg-white gap-2 md:gap-0">
                {[
                  { key: "street", placeholder: "Street/Sitio" },
                  { key: "barangay", placeholder: "Barangay" },
                  { key: "city", placeholder: "Municipality/City" },
                  { key: "province", placeholder: "Province" }
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
                      <span className="hidden md:inline mx-2 text-gray-400 font-medium">/</span>
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
      </div>
    </div>
  );
};