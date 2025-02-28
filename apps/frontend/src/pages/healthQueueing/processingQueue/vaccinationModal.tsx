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
import { VitalSignsSchema, VitalSignsType } from "@/form-schema/vaccineSchema";
import { Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function VaccinationForm() {
  // Form handling
  const form = useForm<VitalSignsType>({
    resolver: zodResolver(VitalSignsSchema),
    defaultValues: {
      pr: "",
      temp: "",
      bp: "",
      o2: "",
    },
  });

  // Static values for read-only fields
  const isTransient = "transient"; // Example value
  const vaccineType = "Flu"; // Example value
  const dateVaccinated = "2023-10-05"; // Example value
  const nameValues = {
    FirstName: "John",
    LastName: "Doe",
    MiddleName: "Smith",
  }; // Example values
  const age = 30; // Example value
  const sex = "Male"; // Example value
  const dob = "1993-10-05"; // Example value
  const addressValues = {
    HouseNo: "12",
    Street: "123 Main St",
    Sitio: "New York",
    Barangay: "NY",
    City: "NY",
    Province: "NY",
  }; // Example values
  const signature = "https://via.placeholder.com/150"; // Example value
  const assignedTo = "Kenxcfdffdfdffffeme"; // Example value

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

  const saveData = async (data: VitalSignsType) => {
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
          <div className="border-green-600 text-green-700 border border-green h-9 px-4 py-2 rounded-md">
           Assess
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
                <div>
                  {/* Transient Checkbox (Read-Only) */}
                  <div className="flex justify-end w-full sm:w-auto sm:ml-auto py-2">
                    <div className="flex flex-row items-center space-x-3 space-y-0">
                      <Checkbox
                        checked={isTransient?.toLowerCase() === "transient"}
                        disabled
                      />
                      <Label className="leading-none">Transient</Label>
                    </div>
                  </div>

                  <h1 className="font-extrabold text-darkBlue1">STEP 1</h1>

                  {/* Vaccine Type and Date Vaccinated (Read-Only) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Vaccine Type</Label>
                      <Input
                        value={vaccineType}
                        readOnly
                        className="w-full mt-2 bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <Label>Date Vaccinated</Label>
                      <Input
                        type="date"
                        value={dateVaccinated}
                        readOnly
                        className="w-full mt-2   bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Name Fields (Read-Only) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mb-4">
                    {Object.entries(nameValues).map(([name, value]) => (
                      <div key={name}>
                        <Label>{name}</Label>
                        <Input
                          value={value}
                          readOnly
                          className="bg-gray-100 mt-2  cursor-not-allowed"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Age and Sex Fields (Read-Only) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                    <div>
                      <Label>Age</Label>
                      <Input
                        value={age}
                        readOnly
                        type="number"
                        className="bg-gray-100 mt-2 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <Label>Sex</Label>
                      <Input
                        value={sex}
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={dob}
                        readOnly
                        className="w-full bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <h2 className="font-bold">Address</h2>

                  {/* Address Fields (Read-Only) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {Object.entries(addressValues).map(([name, value]) => (
                      <div key={name}>
                        <Label>{name}</Label>
                        <Input
                          value={value}
                          readOnly
                          className="bg-gray-100 mt-2 cursor-not-allowed"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Signature and Assigned Step 2 (Read-Only) */}
                  <div className="pt-5 flex flex-col sm:flex-row w-full justify-between gap-4 sm:gap-6">
                    {/* Signature Section (Read-Only) */}
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Label className="text-sm sm:text-base">Signature:</Label>
                      <img
                        src={signature}
                        alt="Signature"
                        className="w-20 h-20  sm:w-24 sm:h-24 object-cover rounded-full"
                      />
                    </div>

                    {/* Assigned Step 2 Dropdown (Read-Only) */}
                    <div className="w-full sm:w-auto">
                      <Label className="text-sm ">Assigned Step 2 by:</Label>
                      <Input
                        value={assignedTo}
                        readOnly
                        className="w-full sm:w-[265px]  mb-2 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-gray mb-6 sm:mb-10" />

                <h1 className="font-extrabold text-darkBlue1">STEP 2</h1>

                <h2 className="font-bold">Vital Signs</h2>

                {/* Vital Signs Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {vitalSignsFields.map(({ name, label, placeholder }) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name as keyof VitalSignsType}
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
                Are you sure you want to proceed?
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <Button
                  variant={"outline"}
                  onClick={handleConfirmationClose}
                  className="w-[120px]"
                >
                  No
                </Button>
                <Button onClick={handleSuccessfulShow} className="w-[120px]">
                  Yes
                </Button>
              </div>
            </div>
          }
        />
      )}

      {/* Success Modal */}
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
