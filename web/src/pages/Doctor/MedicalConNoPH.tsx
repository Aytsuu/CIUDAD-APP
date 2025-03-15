import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import CardLayout from "@/components/ui/card/card-layout";
import PEForm from "./PhysicalExamination";
import {
  CombinedSchema,
  CombinedType,
} from "@/form-schema/doctor/doctorSchema";
import { findings } from "@/form-schema/doctor/doctorSchema";
import { Activity } from "lucide-react";
import { useState } from "react";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { Trash2, CirclePlus } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import MedicalHistory from "./MedicalHistory";

interface Option {
  id: string;
  name: string;
}

const initialCategories: Option[] = [
  { id: "tablet", name: "Tablet" },
  { id: "syrup", name: "Syrup" },
  { id: "injection", name: "Injection" },
];

export default function NonPHMedicalForm() {
  const form = useForm<CombinedType>({
    resolver: zodResolver(CombinedSchema),
    defaultValues: {
      subjective: "",
      objective: "",
      assessments: [],

      ...Object.fromEntries(findings.map((finding) => [finding.name, []])),
      others: [],
      othersTypeIds: [],
    },
  });
 
  const [categories, setCategories] = useState<Option[]>(initialCategories);

  const handleSelectChange = (
    selectedValue: string,
    fieldOnChange: (value: string) => void
  ) => {
    setCategories((prev) =>
      prev.some((opt) => opt.id === selectedValue)
        ? prev
        : [...prev, { id: selectedValue, name: selectedValue }]
    );
    fieldOnChange(selectedValue);
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "assessments", // Name of the field array
  });

  const location = useLocation();
  const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
  const navigate = useNavigate();

  const DisplayFields = {
    nameFields: [
      {
        name: "lname",
        label: "Last Name",
        placeholder: "Enter Last Name",
        defaultValue: "Doe",
      },
      {
        name: "fname",
        label: "First Name",
        placeholder: "Enter First Name",
        defaultValue: "John",
      },
      {
        name: "mname",
        label: "Middle Name",
        placeholder: "Enter Middle Name",
        defaultValue: "Michael",
      },
    ],
    addressFields: [
      {
        name: "houseno",
        label: "House No.",
        placeholder: "Enter house number",
        defaultValue: "123",
      },
      {
        name: "street",
        label: "Street",
        placeholder: "Enter street",
        defaultValue: "Main St",
      },
      {
        name: "sitio",
        label: "Sitio",
        placeholder: "Enter sitio",
        defaultValue: "Sitio 1",
      },
      {
        name: "barangay",
        label: "Barangay",
        placeholder: "Enter barangay",
        defaultValue: "Barangay 1",
      },
      {
        name: "city",
        label: "City",
        placeholder: "Enter city",
        defaultValue: "City 1",
      },
      {
        name: "province",
        label: "Province",
        placeholder: "Enter province",
        defaultValue: "Province 1",
      },
    ],
    vitalSignsFields: [
      {
        name: "hr",
        label: "Heart Rate",
        placeholder: "Enter Heart Rate",
        defaultValue: "72",
      },
      {
        name: "temp",
        label: "Temp",
        placeholder: "Enter Temperature",
        defaultValue: "98.6",
      },
      {
        name: "rrc",
        label: "Respiratory Rate",
        placeholder: "Enter Respiratory Count",
        defaultValue: "16",
      },
      {
        name: "ht",
        label: "Height",
        placeholder: "height",
        defaultValue: "170",
      },
      {
        name: "wt",
        label: "Weight",
        placeholder: "weight",
        defaultValue: "70",
      },
    ],
  };

  const onSubmit = (values: CombinedType) => {
    console.log(values);
    alert("Form submitted successfully!");
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row gap-4 ">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Medical Consultation
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view patients information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-4 sm:mb-6 md:mb-8" />

      <div className="bg-white rounded-lg shadow p-4 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Transient Checkbox */}
            <div className="flex justify-end">
              <div className="sm:ml-auto">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={true}
                    disabled
                    className="cursor-not-allowed opacity-60"
                  />
                  <Label className="font-medium text-black/65">Transient</Label>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-end">
              {/* Date Field */}
              <div>
                <Label className="font-medium text-black/65">
                  Date Assessed
                </Label>
                <Input
                  type="date"
                  value={currentDate}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed mt-2"
                />
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DisplayFields.nameFields.map((field) => (
                <div key={field.name}>
                  <Label className="font-medium text-black/65">
                    {field.label}
                  </Label>
                  <Input
                    value={field.defaultValue}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed mt-2"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>

            {/* Demographics Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="font-medium text-black/65">
                  Date of Birth
                </Label>
                <Input
                  type="date"
                  value="2023-12-23"
                  readOnly
                  className="bg-gray-100 cursor-not-allowed mt-2"
                />
              </div>

              <div>
                <Label className="font-medium text-black/65">Age</Label>
                <Input
                  type="number"
                  value="12"
                  readOnly
                  className="bg-gray-100 cursor-not-allowed mt-2"
                  placeholder="Age"
                />
              </div>

              <div>
                <Label className="font-medium text-black/65">Sex</Label>
                <Input
                  value="Female"
                  readOnly
                  className="bg-gray-100 cursor-not-allowed mt-2"
                  placeholder="Select Gender"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium text-black/65">
                  BHW Assigned:
                </Label>
                <Input
                  value="Katrina Caballes"
                  readOnly
                  className="bg-gray-100 cursor-not-allowed mt-2"
                  placeholder="BHW Assigned"
                />
              </div>
            </div>

            <hr className="border-gray mb-4 sm:mb-6 md:mb-8" />

            {/* Address Section */}
            <div className="space-y-4">
              <h2 className="font-bold text-darkBlue1">Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DisplayFields.addressFields.map((field) => (
                  <div key={field.name}>
                    <Label className="font-medium text-black/65">
                      {field.label}
                    </Label>
                    <Input
                      value={field.defaultValue}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed mt-2"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
            <hr className="border-gray mb-4 sm:mb-6 md:mb-8" />

            {/* Vital Signs Section */}
            <div className="space-y-4">
              <h2 className="font-bold text-darkBlue1">Vital Signs</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DisplayFields.vitalSignsFields.slice(0, 3).map((field) => (
                  <div key={field.name}>
                    <Label className="font-medium text-black/65">
                      {field.label}
                    </Label>
                    <Input
                      type="number"
                      value={field.defaultValue}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed mt-2"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>

              {/* Blood Pressure */}
              <div className="flex flex-col sm:flex-row gap-4 items-center pt-3">
                <Label className="font-medium text-black/65">
                  Blood Pressure
                </Label>
                <div className="flex gap-2 items-center">
                  <div>
                    <Input
                      type="number"
                      value="90"
                      readOnly
                      className="bg-gray-100 cursor-not-allowed mt-2"
                      placeholder="Systolic"
                    />
                  </div>
                  <span className="text-2xl">/</span>
                  <div>
                    <Input
                      type="number"
                      value="100"
                      readOnly
                      className="bg-gray-100 cursor-not-allowed mt-2"
                      placeholder="Diastolic"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {DisplayFields.vitalSignsFields.slice(3, 5).map((field) => (
                <div key={field.name}>
                  <Label className="font-medium text-black/65">
                    {field.label}
                  </Label>
                  <Input
                    type="number"
                    value={field.defaultValue}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed mt-2"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>

            {/* Chief Complaint */}
            <div>
              <Label className="font-medium text-black/65">
                Chief Complaint
              </Label>
              <Textarea
                value="ChiefComplaint"
                readOnly
                className="min-h-[100px] bg-gray-100 cursor-not-allowed mt-2"
                placeholder="Enter chief complaint"
              />
            </div>
            <hr className="border-gray mb-4 sm:mb-6 md:mb-8" />

            <DialogLayout
              trigger={
                <div className="cursor-pointer text-red-500 underline font-semibold italic flex justify-end">
                  {" "}
                  See Medical History {">"}
                </div>
              }
              title="Patients History"
              className="max-w-[1200px]  h-[600px]"
              mainContent={<MedicalHistory />}
            />

            {/* SOAP Form Fields */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="subjective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-black/65">
                      Subjective
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter Subjective Details......"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <CardLayout
              cardTitle="Physical Examination"
              CardTitleClassName="text-darkBlue2 text-lg font-bold"
              cardContent={<PEForm form={form} />}
            />

            <FormField
              control={form.control}
              name="objective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objective</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter Objective Details......"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              {/* Header with Add Button */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium ">Assessment</Label>
                <Button
                  type="button"
                  onClick={() => append({ findings: [] })}
                  className="bg-transparent text-green-800 shadow-none hover:bg-transparent p-0"
                >
                  <CirclePlus className="font-medium" />
                </Button>
              </div>

              {/* Dynamic Fields */}
              <div className="space-y-1 ">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    {/* SelectLayoutWithAdd Component */}
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`assessments.${index}.findings`}
                        render={({ field: { value, onChange } }) => (
                          <SelectLayoutWithAdd
                            className="w-full"
                            label="Category"
                            placeholder="Select"
                            options={categories}
                            value={value.join(", ")} // Convert array to string
                            onChange={(selectedValue) => {
                              // Convert string back to array
                              onChange(selectedValue.split(", "));
                            }}
                          />
                        )}
                      />
                    </div>

                    {/* Delete Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-8 w-8  bg-red-500 text-white hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <div className="flex gap-2 text-darkBlue2 justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
