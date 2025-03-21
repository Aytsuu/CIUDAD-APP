import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  PhilHealthSchema,
  PhilHealthType,
} from "@/form-schema/medicalConsultation/philHealthSchema";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus, ChevronLeft, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PHMedicalForm() {
  const form = useForm<PhilHealthType>({
    resolver: zodResolver(PhilHealthSchema),
    defaultValues: {
      isTransient: "resident",
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
      ht: 0,
      wt: 0,
      chiefComplaint: "",
      atc: "",
      pin: 0,
      contactNo: 0,
      memberORdependent: "",
      status: "",
      doctor: "",
    },
  });

  const formFields = {
    nameFields: [
      { name: "lname", label: "Last Name", placeholder: "Enter Last Name" },
      { name: "fname", label: "First Name", placeholder: "Enter First Name" },
      { name: "mname", label: "Middle Name", placeholder: "Enter Middle Name" },
    ],
    addressFields: [
      {
        name: "houseno",
        label: "House No.",
        placeholder: "Enter house number",
      },
      { name: "street", label: "Street", placeholder: "Enter street" },
      { name: "sitio", label: "Sitio", placeholder: "Enter sitio" },
      { name: "barangay", label: "Barangay", placeholder: "Enter barangay" },
      { name: "city", label: "City", placeholder: "Enter city" },
      { name: "province", label: "Province", placeholder: "Enter province" },
    ],
    vitalSignsFields: [
      { name: "hr", label: "Heart Rate", placeholder: "Enter Heart Rate" },
      { name: "temp", label: "Temp", placeholder: "Enter Temperature" },
      {
        name: "rrc",
        label: "Respiratory Rate",
        placeholder: "Enter Respiratory Count",
      },
      { name: "ht", label: "Height", placeholder: "height" },
      { name: "wt", label: "Weight", placeholder: "weight" },
    ],
  };

  const status = [
    { id: "Single", name: "Single" },
    { id: "Married", name: "Married" },
    { id: "Widower", name: "Widower" },
  ];
  const doctor = [
    { id: "Kimmy Mo Ma Chung", name: "Kimmy Mo Ma Chung" },
    { id: "Chi Chung", name: "Chi Chung" },
  ];

  const atc = [
    { id: "walk-in with ATC", name: "walk-in with ATC" },
    { id: "walk-in without ATC", name: "walk-in without ATC" },
  ];

  const location = useLocation();
  const recordType = location.state?.recordType || "nonExistingPatient";
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  const onSubmit = (data: PhilHealthType) => {
    console.log(data);
    alert("success");
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => {
            if (recordType === "nonExistingPatient") {
              navigate("/allMedRecords");
            } else {
              navigate("/invMedRecords");
            }
          }}
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

      <div className="bg-white rounded-lg shadow p-4 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Search and Add Resident Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
              {recordType !== "existingPatient" ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                  <div className="relative w-full sm:w-96">
                    <Input placeholder="Search patient..." className="pl-10" />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline">or</span>
                  <Button variant="link" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Resident
                  </Button>
                </div>
              ) : null}

              {/* Transient Checkbox */}
              <div
                className={recordType === "existingPatient" ? "sm:ml-auto" : ""}
              >
                <FormField
                  control={form.control}
                  name="isTransient"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value === "transient"}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? "transient" : "resident")
                          }
                        />
                      </FormControl>
                      <FormLabel className="font-medium text-black/65">
                        Transient
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-10">
              {/* Date Field */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-black/65">
                      Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={currentDate} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="atc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-black/65">
                      ATC Type
                    </FormLabel>
                    <FormControl>
                      <SelectLayout
                        className=""
                        label=""
                        placeholder="select"
                        options={atc}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="memberORdependent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-black/65">
                      Member or Dependent
                    </FormLabel>
                    <FormControl>
                      <SelectLayout
                        className=""
                        label=""
                        placeholder="select"
                        options={status}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-black/65">
                      Pin
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Pin"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : Number(value)
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-center pt-3">
              <FormField
                control={form.control}
                name="contactNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-black/65">
                      Contact No.
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value || ""}
                        placeholder="Contact No."
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : Number(value)
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {formFields.nameFields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as keyof PhilHealthType}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-black/65">
                        {field.label}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...formField}
                          value={formField.value ?? ""} // Fallback to empty string if null or undefined
                          placeholder={field.placeholder}
                          onChange={formField.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-black/65">
                      Status
                    </FormLabel>
                    <FormControl>
                      <SelectLayout
                        className=""
                        label=""
                        placeholder="select"
                        options={status}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Demographics Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-black/65">
                      Age
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value || ""}
                        placeholder="Age"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : Number(value)
                          );
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
                    <FormLabel className="font-medium text-black/65">
                      Date of Birth
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel className="font-medium text-black/65">
                      Sex
                    </FormLabel>
                    <FormControl>
                      <SelectLayout
                        className=""
                        label=""
                        options={[
                          { id: "female", name: "Female" },
                          { id: "male", name: "Male" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select Gender"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <h2 className="font-bold text-darkBlue1">Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {formFields.addressFields.map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name as keyof PhilHealthType}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-black/65">
                          {field.label}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            {...formField}
                            value={formField.value ?? ""} // Fallback to empty string if null or undefined
                            placeholder={field.placeholder}
                            onChange={formField.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Vital Signs Section */}
            <div className="space-y-4">
              <h2 className="font-bold text-darkBlue1">Vital Signs</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {formFields.vitalSignsFields.slice(0, 3).map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name as keyof PhilHealthType}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-black/65">
                          {field.label}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={formField.value || ""}
                            placeholder={field.placeholder}
                            onChange={(e) => {
                              const value = e.target.value;
                              formField.onChange(
                                value === "" ? undefined : Number(value)
                              );
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
              <div className="flex flex-col sm:flex-row gap-4 items-center pt-3">
                <FormLabel className="font-medium text-black/65">
                  Blood Pressure
                </FormLabel>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="bpsystolic"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            placeholder="Systolic"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span className="text-2xl">/</span>
                  <FormField
                    control={form.control}
                    name="bpdiastolic"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            placeholder="Diastolic"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 ">
              {formFields.vitalSignsFields.slice(3, 5).map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as keyof PhilHealthType}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-black/65">
                        {field.label}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={formField.value || ""}
                          placeholder={field.placeholder}
                          onChange={(e) => {
                            const value = e.target.value;
                            formField.onChange(
                              value === "" ? undefined : Number(value)
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Chief Complaint */}
            <FormField
              control={form.control}
              name="chiefComplaint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-black/65">
                    Chief Complaint
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter chief complaint"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {" "}
              <FormField
                control={form.control}
                name="bhwAssign"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-black/65">
                      BHW Assigned:
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="BHW Assigned" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doctor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-black/65">
                      Forward to Doctor
                    </FormLabel>
                    <FormControl>
                      <SelectLayout
                        className="w-[250px] min-w-full"
                        label=""
                        options={doctor}
                        placeholder="select"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" className="w-full sm:w-[100px]">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
