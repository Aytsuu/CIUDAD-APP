import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import { Plus, X } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export const AccusedInfo = () => {
  const { control, getValues } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "accused"
  });
  
  const [activeTab, setActiveTab] = useState(0);

  // Initialize with first accused if none exist
  useEffect(() => {
    if (fields.length === 0) {
      append({
        firstName: "",
        lastName: "",
        contactNumber: "",
        address: {
          street: "",
          barangay: "",
          city: "",
          province: "",
          sitio: ""
        }
      });
      setActiveTab(0);
    }
  }, [fields.length, append]);

  const addAccused = () => {
    const newIndex = fields.length;
    append({
      firstName: "",
      lastName: "",
      contactNumber: "",
      address: {
        street: "",
        barangay: "",
        city: "",
        province: "",
        sitio: ""
      }
    });
    // Set the new tab as active
    setActiveTab(newIndex);
  };

  const removeAccused = (index: number) => {
    if (fields.length === 1) {
      // Don't allow removing the last accused
      return;
    }
    
    remove(index);
    
    // Adjust active tab if necessary
    if (activeTab === index) {
      // If removing the active tab, switch to the previous tab or first tab
      setActiveTab(index > 0 ? index - 1 : 0);
    } else if (activeTab > index) {
      // If removing a tab before the active tab, adjust the active tab index
      setActiveTab(activeTab - 1);
    }
  };

  // Ensure activeTab is within bounds
  useEffect(() => {
    if (activeTab >= fields.length && fields.length > 0) {
      setActiveTab(fields.length - 1);
    }
  }, [fields.length, activeTab]);

  // Keep tab names static as "Resp. X"
  const getTabDisplayName = (index: number) => {
    return `Resp. ${index + 1}`;
  };

  // Don't render anything if there are no fields yet
  if (fields.length === 0) {
    return null;
  }

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
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'bg-ashGray/40 text-black/50 hover:bg-gray-200'
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
                        ? 'hover:bg-blue-700 text-blue-100 hover:text-white'
                        : 'hover:bg-red-100 text-gray-500 hover:text-red-600'
                    }`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Add New Tab Button */}
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

      {/* Tab Content - Force re-render when activeTab changes */}
      <div key={`tab-${activeTab}`} className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-6 shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-black/70">
              Respondent {activeTab + 1} Information
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Tab {activeTab + 1} of {fields.length}</span>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={control}
              name={`accused.${activeTab}.firstName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-black/50">First Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="First name" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name={`accused.${activeTab}.lastName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-black/50">Last Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Last name" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name={`accused.${activeTab}.contactNumber`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-black/50">Contact Number *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="09123456789" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-black/70">Address Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`accused.${activeTab}.address.street`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-black/50">Street *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123 Main St" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name={`accused.${activeTab}.address.barangay`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="font-semibold text-black/50">Barangay *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Barangay 1" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={control}
                name={`accused.${activeTab}.address.city`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-black/50">City *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Cebu" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name={`accused.${activeTab}.address.province`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-black/50">Province *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Cebu Province" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name={`accused.${activeTab}.address.sitio`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-black/50">Sitio/Purok</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Sitio 1" 
                        {...field} 
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
  );
};