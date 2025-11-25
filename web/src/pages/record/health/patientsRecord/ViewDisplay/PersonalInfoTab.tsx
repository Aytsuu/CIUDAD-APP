import { History } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { Button } from "@/components/ui/button/button";
import CardLayout from "@/components/ui/card/card-layout";
import { TabsContent } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import PatientHistory from "./PatientHistory";


interface PatientData {
  // isTransferredFrom: boolean;
  // location: {
  //   sitio?: string;
  //   brgy?: string;
  //   city?: string;
  // };
  lastName: string;
  firstName: string;
  middleName: string;
  sex: string;
  contact: string;
  dateOfBirth: string;
  patientType: string;
  houseNo: string;
  address: {
    street: string;
    sitio: string;
    barangay: string;
    city: string;
    province: string;
  };
  bloodType: string;
  allergies: string;
  chronicConditions: string;
  lastVisit: string;
  visits: Array<{ date: string; reason: string; doctor: string }>;
  philhealthId?: string;
}

interface PersonalInfoTabProps {
  form: UseFormReturn<any>;
  isEditable: boolean;
  isTransient: boolean;
  patientData: PatientData | null;
  patientId?: string;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  residentsOptions?: { id: string; name: React.ReactNode }[];
  selectedResidentId?: string;
  onResidentSelect?: (id: string | undefined) => void;
  showResidentSelector?: boolean;
}

export default function PersonalInfoTab({ 
  form, 
  isEditable, 
  isTransient, 
  patientId,
  handleSaveEdit, 
  handleCancelEdit,
  residentsOptions = [],
  selectedResidentId,
  onResidentSelect,
  showResidentSelector = false
}: PersonalInfoTabProps) {
  form.setValue("philhealthId", form.getValues("philhealthId") || "");

  return (
    <TabsContent value="personal" className="mt-0">
      <CardLayout
        title={"Personal Information"}
        description="Patient's personal and contact details"
        content={
          <div className="mx-auto border-none">
            <span className="flex justify-end m-2" title="Update history">
              {patientId ? (
                <PatientHistory patientId={patientId} />
              ) : (
                <History className="hover:text-blue-600 cursor-pointer" size={20} />
              )}
            </span>

            <div className="pt-4">
              <Form {...form}>
                <form className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditable}
                              className={!isEditable ? "bg-muted/30" : ""}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditable}
                              className={!isEditable ? "bg-muted/30" : ""}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">
                            Middle Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditable}
                              className={!isEditable ? "bg-muted/30" : ""}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="philhealthId"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">
                            PhilHealth ID
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditable}
                              className={!isEditable ? "bg-muted/30" : ""}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <FormField
                      control={form.control}
                      name="sex"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">Sex</FormLabel>
                          <Select 
                            disabled={!isEditable} 
                            value={field.value?.toLowerCase()} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className={!isEditable ? "bg-muted/30" : ""}>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">Contact Number</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditable} className={!isEditable ? "bg-muted/30" : ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} disabled={!isEditable} className={!isEditable ? "bg-muted/30" : ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patientType"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">Patient Type</FormLabel>
                          <Select 
                            disabled={!isEditable} 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className={!isEditable ? "bg-muted/30" : ""}>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Resident">Resident</SelectItem>
                              <SelectItem value="Transient">Transient</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Resident Selection Combobox - Show when converting to Resident */}
                  {showResidentSelector && isEditable && (
                    <div className="w-full border rounded-md px-4 py-5 shadow-md mb-5 animate-in fade-in slide-in-from-top-4 duration-500">
                      <Label className="text-sm font-medium mb-2">Select Resident</Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Choose the resident profile to link with this patient record
                      </p>
                      <div className="grid grid-cols-2">
                        <Combobox
                          options={residentsOptions}
                          value={selectedResidentId || ""}
                          onChange={onResidentSelect}
                          placeholder="Search for a resident..."
                          emptyMessage="No resident found"
                        />
                      </div>
                    </div>
                  )}

                  <h3 className="text-md font-medium pt-4">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">Street</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditable} className={!isEditable ? "bg-muted/30" : ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.sitio"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">Sitio</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditable} className={!isEditable ? "bg-muted/30" : ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.barangay"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">Barangay</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditable} className={!isEditable ? "bg-muted/30" : ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* city and province */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">City</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditable} className={!isEditable ? "bg-muted/30" : ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address.province"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">Province</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditable} className={!isEditable ? "bg-muted/30" : ""} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </div>
          </div>
        }
        cardClassName="border shadow-sm rounded-lg"
        headerClassName="pb-2"
        contentClassName="pt-0"
      />
      {isTransient && isEditable && (
        <div className="flex justify-end mt-6 space-x-2 pb-6">
          <Button variant="outline" size="sm" onClick={handleCancelEdit} className="bg-white text-gray-700 hover:bg-gray-50">
            Cancel
          </Button>
          <Button size="sm" className="bg-buttonBlue hover:bg-buttonBlue/90 text-white" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </div>
      )}
    </TabsContent>
  );
}