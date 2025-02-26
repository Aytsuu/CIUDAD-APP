import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectLayout } from "@/components/ui/select/select-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useState } from "react";
import CombinedSchema from "@/form-schema/vaccineSchema";
import { Check } from "lucide-react";

export default function VaccinationForm() {
  type VaccineSchema = z.infer<typeof CombinedSchema>;

  // Form handling
  const form = useForm<VaccineSchema>({
    resolver: zodResolver(CombinedSchema),
    defaultValues: {
      vaccinetype: "",
      datevaccinated: "",
      lname: "",
      fname: "",
      mname: "",
      age: "",
      sex: "",
      dob: "",
      houseno: "",
      street: "",
      sitio: "",
      barangay: "",
      province: "",
      city: "",
      pr: "",
      temp: "",
      bp: "",
      o2: "",
      assignto:"",
    },
  });

  // Text fields configuration
  const nameFields = [
    { name: "fname", label: "First Name", placeholder: "First Name" },
    { name: "mname", label: "Middle Name", placeholder: "Middle Name" },
    { name: "lname", label: "Last Name", placeholder: "Last Name" },
  ];

  const addressFields = [
    { name: "houseno", label: "House No.", placeholder: "Enter house number" },
    { name: "street", label: "Street", placeholder: "Enter street" },
    { name: "sitio", label: "Sitio", placeholder: "Enter sitio" },
    { name: "barangay", label: "Barangay", placeholder: "Enter barangay" },
    { name: "city", label: "City", placeholder: "Enter city" },
    { name: "province", label: "Province", placeholder: "Enter province" },
  ];

  const vitalSignsFields = [
    { name: "pr", label: "PR", placeholder: "Enter PR" },
    { name: "temp", label: "Temp", placeholder: "Enter Temperature" },
    { name: "bp", label: "BP", placeholder: "Enter Blood Pressure" },
    { name: "o2", label: "O2", placeholder: "Enter O2" },
  ];

  // State for dialog and confirmation modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessfulModal, setShowSuccessfulModal] = useState(false);

  const saveData = async (data: VaccineSchema) => {
    console.log("Form submitted", data);
    setShowSuccessfulModal(true);
    form.reset();
    setIsDialogOpen(false);
    setTimeout(() => {
      setShowSuccessfulModal(false);
    }, 800);
  };

  const handleConfirmationClose = () => {
    setShowConfirmationModal(false);
  };

  const handleSuccessfulShow = () => {
    // Submit the form data
    saveData(form.getValues());
    setShowConfirmationModal(false);
  };

  return (
    <>
      {/* Main Form Dialog */}
      <DialogLayout
        trigger={
          <div className="border-green-600  text-green-700 border border-green h-9 px-4 py-2 rounded-md">
            <Check size={16} />
          </div>
        }
        className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[900px] h-full sm:h-auto"
        title="Vaccination Form"
        description=""
        mainContent={
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(() => {
                  setShowConfirmationModal(true);
                })}
                className="space-y-6"
              >
                <h1 className="font-extrabold text-darkBlue1">STEP 1</h1>
                {/* Vaccine Type and Date Vaccinated */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vaccinetype"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vaccine Type</FormLabel>
                        <FormControl>
                          <SelectLayout
                            className="w-full"
                            label="Vaccine Type"
                            placeholder="Select"
                            options={[
                              { id: "flu", name: "Flu" },
                              { id: "covid", name: "Covid" },
                            ]}
                            value={String(field.value)}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="datevaccinated"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Vaccinated</FormLabel>
                        <FormControl>
                          <Input type="date" className="w-full" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nameFields.map(({ name, label, placeholder }) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name as keyof VaccineSchema}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              value={String(field.value)}
                              placeholder={placeholder}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                {/* Age and Sex Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sex</FormLabel>
                        <FormControl>
                          <SelectLayout
                            className="w-full"
                            label="Sex"
                            placeholder="Select"
                            options={[
                              { id: "female", name: "Female" },
                              { id: "male", name: "Male" },
                            ]}
                            value={String(field.value)}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" className="w-full" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <h2 className="font-bold">Address</h2>

                {/* Address Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {addressFields.map(({ name, label, placeholder }) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name as keyof VaccineSchema}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              value={String(field.value)}
                              placeholder={placeholder}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <div className="flex justify-end items-center mt-4 gap-2">
                  <FormLabel>Signature:</FormLabel>
                  <img
                    src="https://via.placeholder.com/150"
                    alt="Sample Image"
                    className="w-100 h-200 object-cover rounded-full"
                  />
                </div>
                <h1 className="font-extrabold text-darkBlue1">STEP 2</h1>

                <h2 className="font-bold">Vital Signs</h2>

                {/* Vital Signs Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {vitalSignsFields.map(({ name, label, placeholder }) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name as keyof VaccineSchema}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              value={String(field.value)}
                              placeholder={placeholder}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
                  <Button type="submit" className="w-[120px]">
                    Save
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        }
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <DialogLayout
          trigger={<div />}
          isOpen={showConfirmationModal}
          onOpenChange={setShowConfirmationModal}
          mainContent={
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold">Confirmation</h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want Proceed?
              </p>
              <Button
                variant={"outline"}
                onClick={handleConfirmationClose}
                className="mt-6 w-[120px]"
              >
                No
              </Button>
              <Button onClick={handleSuccessfulShow} className="mt-6 w-[120px]">
                Yes
              </Button>
            </div>
          }
        />
      )}

      {showSuccessfulModal && (
        <DialogLayout
          trigger={<div />}
          isOpen={showSuccessfulModal}
          onOpenChange={setShowSuccessfulModal}
          mainContent={
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold">
                Vaccination Record Saved
              </h3>
              <p className="mt-2 text-gray-600">
                The vaccination record has been successfully saved.
              </p>
            </div>
          }
        />
      )}
    </>
  );
}
