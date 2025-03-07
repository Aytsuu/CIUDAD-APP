import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  nonPhilHealthSchema,
  nonPhilHealthType,
} from "@/form-schema/medicalConsultationSchema";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";

export default function MedicalForm() {
  const form = useForm<nonPhilHealthType>({
    resolver: zodResolver(nonPhilHealthSchema),

    defaultValues: {
      isTransient: "Resident",
      fname: "",
      lname: "",
      mname: "",
      date: "",
      age: 0,
      sex: "",
      dob: "",
      houseno: "",
      street: "",
      sitio: "",
      barangay: "",
      province: "",
      city: "",
      bhwAssign: "",
      hr: 0,
      temp: 0,
      bpsystolic: 0,
      bpdiastolic: 0,
      rrc: 0,
      rrcmp: 0,
      ht: "",
      wt: "",
      chiefComplaint: "",
    },
  });

  const location = useLocation();
  const recordType = location.state?.recordType || "nonExistingPatient"; // Default value if undefined

  function onSubmit(values: nonPhilHealthType) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState.errors]);

  const nameFields = [
    { name: "lname", label: "LastName", placeholder: "Enter Last Name" },
    { name: "fname", label: "FirstName", placeholder: "Enter First Name" },
    { name: "mname", label: "MiddleName", placeholder: "Enter Middle Name" },
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
    { name: "hr", label: "HR", placeholder: "Enter Heart Rate" },
    { name: "rrc", label: "RR", placeholder: "Enter Respiratory Count" },
    { name: "rrcmp", label: "RR", placeholder: "Enter Respiratory " },
    { name: "temp", label: "Temp", placeholder: "Enter Temperature" },
    { name: "ht", label: "BP", placeholder: "Enter Height" },
    { name: "wt", label: "O2", placeholder: "Enter Weight" },
  ];

  const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  return (
    <div className=" bg-white rounded-lg shadow  md:p-2 lg:p-8">
      <Link to="/allMedRecords">
        {" "}
        <div className="mb-4 text-darkBlue2">
          <ArrowLeft />
        </div>
      </Link>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Medical Consultation
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view patients information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Fields */}
          <div className="flex flex-col gap-4 ">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full ">
              {recordType === "existingPatient" || (
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                  <div className="w-full sm:w-[400px]">
                    <Input className="w-full" placeholder="Search..." />
                  </div>
                  <Label className="hidden sm:block">or</Label>
                  <button className="flex items-center gap-2 underline text-blue">
                    <UserPlus className="h-4 w-4" />
                    <span>Add Resident</span>
                  </button>
                </div>
              )}

              <div className="flex justify-end w-full sm:w-auto sm:ml-auto">
                <FormField
                  control={form.control}
                  name="isTransient"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value === "transient"}
                          onCheckedChange={(checked) => {
                            field.onChange(checked ? "transient" : "resident");
                          }}
                        />
                      </FormControl>
                      <FormLabel className="leading-none">Transient</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className=" sm:w-auto md:w-auto lg:w-[200px] mt-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" value={currentDate} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {nameFields.map(({ name, label, placeholder }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof nonPhilHealthType}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder={placeholder}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Age & DOB Fields */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter Age"
                        onChange={(e) => {
                          // Convert the string value to a number
                          const value =
                            e.target.valueAsNumber || Number(e.target.value);
                          field.onChange(value);
                        }}
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
                      <Input {...field} type="date" value={field.value} />
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
                        label="Gender"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <FormField
                control={form.control}
                name="bhwAssign"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bhw Assignment</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="BHW" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address Fields */}
            <h2 className="font-bold mt-8 text-darkBlue1">Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {addressFields.map(({ name, label, placeholder }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof nonPhilHealthType}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder={placeholder}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <h2 className="font-bold mt-8 text-darkBlue1">Vital Signs</h2>
            {/* Vital Signs Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {vitalSignsFields
                .slice(0, 4)
                .map(({ name, label, placeholder }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name as keyof nonPhilHealthType}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder={placeholder}
                            value={field.value || ""} // Ensure the value is not undefined
                            onChange={(e) => {
                              // Convert the string value to a number
                              const value =
                                e.target.valueAsNumber ||
                                Number(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
            </div>
            {/* Blood Pressure */}
            <FormLabel>Blood Pressure</FormLabel>
            <div className="flex gap-2 mt-[-10px] ">
              <FormField
                control={form.control}
                name="bpsystolic"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter Systolic"
                        value={field.value || ""} // Ensure the value is not undefined
                        onChange={(e) => {
                          // Convert the string value to a number
                          const value =
                            e.target.valueAsNumber || Number(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Label className="font-normal text-[25px]">/</Label>
              <FormField
                control={form.control}
                name="bpdiastolic"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter Diastolic"
                        value={field.value || ""} // Ensure the value is not undefined
                        onChange={(e) => {
                          // Convert the string value to a number
                          const value =
                            e.target.valueAsNumber || Number(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-5">
              <FormField
                control={form.control}
                name="chiefComplaint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chief Complaint</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter CHieff Complaint"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="w-[100px]">
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
