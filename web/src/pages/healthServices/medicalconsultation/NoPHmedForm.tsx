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
  nonPhilHealthSchema,
  nonPhilHealthType,
} from "@/form-schema/medicalConsultation/nonPhilhealthSchema";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { ArrowLeft, UserPlus, ChevronLeft, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FormSelect } from "@/components/ui/form/form-select";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

// Define the physical exam schema with arrays for multiple selections
const physicalExamSchema = z.object({
  skin: z.object({
    status: z.array(z.enum(["normal", "edema", "rash", "pallor", "cyanosis", "jaundice", "other"])).nonempty({
      message: "At least one option must be selected",
    })
  }).optional(),
  eyes: z.object({
    status: z.array(z.enum(["normal", "yellowish", "redness", "discharge", "swelling", "other"])).nonempty({
      message: "At least one option must be selected",
    }),
  }).optional(),
  ears: z.object({
    status: z.array(z.enum(["normal", "discharge", "redness", "swelling", "other"])).nonempty({
      message: "At least one option must be selected",
    }),
  }),
  nose: z.object({
    status: z.array(z.enum(["normal", "discharge", "congestion", "bleeding", "other"])).nonempty({
      message: "At least one option must be selected",
    }),
  }).optional(),
  throat: z.object({
    status: z.array(z.enum(["normal", "redness", "swelling", "exudate", "other"])).nonempty({
      message: "At least one option must be selected",
    }),
  }).optional(),
  chest: z.object({
    status: z.array(z.enum(["normal", "wheezing", "crackles", "decreased breath sounds", "other"])).nonempty({
      message: "At least one option must be selected",
    }),
  }).optional(),
  heart: z.object({
    status: z.array(z.enum(["normal", "murmur", "irregular rhythm", "tachycardia", "bradycardia", "other"])).nonempty({
      message: "At least one option must be selected",
    }),
  }).optional(),
  abdomen: z.object({
    status: z.array(z.enum(["normal", "tender", "distended", "mass", "other"])).nonempty({
      message: "At least one option must be selected",
    }),
  }).optional(),
  extremities: z.object({
    status: z.array(z.enum(["normal", "edema", "deformity", "limited range of motion", "other"])).nonempty({
      message: "At least one option must be selected",
    }),
  }).optional(),
  neurological: z.object({
    status: z.array(z.enum(["normal", "weakness", "numbness", "altered mental status", "other"])).nonempty({
      message: "At least one option must be selected",
    }),
  }).optional(),
});

// Combine both schemas
const combinedSchema = nonPhilHealthSchema.merge(physicalExamSchema);
type CombinedFormType = nonPhilHealthType & z.infer<typeof physicalExamSchema>;

export default function NonPHMedicalForm() {
  const form = useForm<CombinedFormType>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      isTransient: "resident",
      fname: "",
      lname: "",
      mname: "",
      date: "",
      age: "",
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
      doctor: "",
      skin: { status: ["normal"] },
      eyes: { status: ["normal"] },
      ears: { status: ["normal"] },
      nose: { status: ["normal"] },
      throat: { status: ["normal"] },
      chest: { status: ["normal"] },
      heart: { status: ["normal"] },
      abdomen: { status: ["normal"] },
      extremities: { status: ["normal"] },
      neurological: { status: ["normal"] },
    },
  });

  function onSubmit(values: CombinedFormType) {
    console.log(values);
    alert("sumakses ka")
  }

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

  const location = useLocation();
  const recordType = location.state?.recordType || "nonExistingPatient";
  const navigate = useNavigate();
  const doctor = [
    { id: "Kimmy Mo Ma Chung", name: "Kimmy Mo Ma Chung" },
    { id: "Chi Chung", name: "Chi Chung" },
  ];

  const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  // Define the body parts and their options for physical exam
  const bodyParts = [
    {
      id: "skin",
      name: "Skin",
      options: ["normal", "edema", "rash", "pallor", "cyanosis", "jaundice", "other"],
    },
    {
      id: "eyes",
      name: "Eyes",
      options: ["normal", "yellowish", "redness", "discharge", "swelling", "other"],
    },
    {
      id: "ears",
      name: "Ears",
      options: ["normal", "discharge", "redness", "swelling", "other"],
    },
    {
      id: "nose",
      name: "Nose",
      options: ["normal", "discharge", "congestion", "bleeding", "other"],
    },
    {
      id: "throat",
      name: "Throat",
      options: ["normal", "redness", "swelling", "exudate", "other"],
    },
    {
      id: "chest",
      name: "Chest",
      options: ["normal", "wheezing", "crackles", "decreased breath sounds", "other"],
    },
    {
      id: "heart",
      name: "Heart",
      options: ["normal", "murmur", "irregular rhythm", "tachycardia", "bradycardia", "other"],
    },
    {
      id: "abdomen",
      name: "Abdomen",
      options: ["normal", "tender", "distended", "mass", "other"],
    },
    {
      id: "extremities",
      name: "Extremities",
      options: ["normal", "edema", "deformity", "limited range of motion", "other"],
    },
    {
      id: "neurological",
      name: "Neurological",
      options: ["normal", "weakness", "numbness", "altered mental status", "other"],
    },
  ];

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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Information Section */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-8 mb-6">
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
              <div>
                <FormSelect
                  control={form.control}
                  name="isTransient"
                  label="Patient Type"
                  options={[
                    { id: "Resident", name: "Resident" },
                    { id: "Transient", name: "Transient" },
                    { id: "Regular", name: "Regular" },
                  ]}
                  readOnly
                />
              </div>
            </div>

            <div className="w-full flex justify-end">
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
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {formFields.nameFields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as keyof nonPhilHealthType}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-black/65">
                        {field.label}
                      </FormLabel>
                      <FormControl>
                        <Input {...formField} placeholder={field.placeholder} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Demographics Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        value={field.value || " "}
                        placeholder="Age"
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    name={field.name as keyof nonPhilHealthType}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-black/65">
                          {field.label}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...formField}
                            placeholder={field.placeholder}
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
                    name={field.name as keyof nonPhilHealthType}
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
                            onChange={(e) =>
                              formField.onChange(Number(e.target.value))
                            }
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
                            value={field.value || " "}
                            placeholder="Systolic"
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
                  name={field.name as keyof nonPhilHealthType}
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
                          onChange={(e) =>
                            formField.onChange(Number(e.target.value))
                          }
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
          </div>

          {/* Physical Exam Section */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Physical Examination</CardTitle>
              <CardDescription>
                Complete the physical examination form by selecting the appropriate findings for each body system.
                You can select multiple options for each body part.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <Accordion type="multiple" className="w-full">
                  {bodyParts.map((bodyPart) => (
                    <AccordionItem key={bodyPart.id} value={bodyPart.id}>
                      <AccordionTrigger className="text-lg font-semibold">{bodyPart.name}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`${bodyPart.id}.status` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                  {bodyPart.options.map((option) => (
                                    <FormItem
                                      key={option}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value as string[]), option])
                                              : field.onChange(
                                                (field.value as string[])?.filter((value) => value !== option)
                                              )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal capitalize">{option}</FormLabel>
                                    </FormItem>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => form.reset()}
              className="w-full sm:w-[150px]"
            >
              Reset Form
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-[150px]"
            >
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}