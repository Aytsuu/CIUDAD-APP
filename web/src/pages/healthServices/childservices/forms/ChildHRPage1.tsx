import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { BasicInfoType } from "@/form-schema/chr-schema";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button/button";
import { UserPlus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";
import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";

type Page1Props = {
  onNext2: () => void;
  updateFormData: (data: Partial<BasicInfoType>) => void;
  formData: BasicInfoType;
};

export default function ChildHRPage1({
  onNext2,
  updateFormData,
  formData,
}: Page1Props) {
  const form = useForm<BasicInfoType>({
    // resolver: zodResolver(BasicInfoSchema),
    defaultValues: formData,
  });

  useEffect(() => {
    console.log("Form data updated:", formData);
  }, [formData]);

  const onsubmitForm = (data: BasicInfoType) => {
    console.log("PAGE 1:", data);
    updateFormData(data);
    onNext2();
  };

  const location = useLocation();
  const recordType = location.state?.recordType || "nonExistingPatient"; // Default value if undefined

  const formFields = [
    { name: "familyNo", label: "Family No:", type: "text" },
    { name: "ufcNo", label: "UFC No:", type: "text" },
    { name: "childFname", label: "First Name", type: "text" },
    { name: "childLname", label: "Last Name", type: "text" },
    { name: "childMname", label: "Middle Name", type: "text" },
    {
      name: "childSex",
      label: "Gender",
      type: "select",
      options: [
        { id: "1", name: "Male" },
        { id: "2", name: "Female" },
      ],
    },
    { name: "childDob", label: "Date of Birth", type: "date" },
    { name: "childPob", label: "Place of Birth", type: "text" },
    { name: "motherFname", label: "First Name", type: "text" },
    { name: "motherLname", label: "Last Name", type: "text" },
    { name: "motherMname", label: "Middle Name", type: "text" },
    { name: "motherAge", label: "Age", type: "number" },
    { name: "motherOccupation", label: "Occupation", type: "text" },
    { name: "fatherFname", label: "First Name", type: "text" },
    { name: "fatherLname", label: "Last Name", type: "text" },
    { name: "fatherMname", label: "Middle Name", type: "text" },
    { name: "fatherAge", label: "Age", type: "number" },
    { name: "fatherOccupation", label: "Occupation", type: "text" },
    { name: "landmarks", label: "Landmarks:", type: "text" },
  ];
  const addressFields = [
    { name: "houseno", label: "House No.", placeholder: "Enter house number" },
    { name: "street", label: "Street", placeholder: "Enter street" },
    { name: "sitio", label: "Sitio", placeholder: "Enter sitio" },
    { name: "barangay", label: "Barangay", placeholder: "Enter barangay" },
    { name: "city", label: "City", placeholder: "Enter city" },
    { name: "province", label: "Province", placeholder: "Enter province" },
  ];

  return (
    <>
      <div className=" bg-white rounded-lg shadow p-8 md:p-4 lg:p-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onsubmitForm, (errors) => {
              console.error("Form validation errors:", errors);
            })}
            className="space-y-6 p-4 md:p-6 lg:p-8"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between w-full ">
              {recordType === "existingPatient" || (
                <div className="flex items-center justify-between gap-3 mb-10">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                      size={17}
                    />
                    <Input
                      placeholder="Search..."
                      className="pl-10 w-72 bg-white"
                    />
                  </div>

                  <Label>or</Label>

                  <button className="flex items-center gap-1 underline text-blue hover:bg-blue-600 hover:text-sky-500 transition-colors rounded-md">
                    <UserPlus className="h-4 w-4" />
                    Add Resident
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

            <div className="flex flex-wrap gap-4">
              {formFields.slice(0, 2).map(({ name, label, type }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof BasicInfoType}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[200px]">
                      <FormLabel className="text-black/65">
                        {label} <span className="text-red-600">*</span>{" "}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type={type}
                          value={String(field.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="font-bold text-lg text-darkBlue2 mt-10">
                Child's Information
              </h2>

              <div className="flex flex-wrap gap-4">
                {formFields
                  .slice(2, 6)
                  .map(({ name, label, type, options }) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name as keyof BasicInfoType}
                      render={({ field }) => (
                        <FormItem className="flex-1 min-w-[200px]">
                          <FormLabel className="text-black/65">
                            {label}
                          </FormLabel>
                          <FormControl>
                            {type === "select" ? (
                              <SelectLayout
                                className="w-full"
                                label={label}
                                placeholder={`Select ${label.toLowerCase()}`}
                                options={options || []}
                                value={field.value as string}
                                onChange={field.onChange}
                              />
                            ) : (
                              <Input
                                {...field}
                                type={type}
                                value={String(field.value)}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
              </div>

              <div className="flex flex-wrap gap-4">
                {formFields.slice(6, 8).map(({ name, label, type }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name as keyof BasicInfoType}
                    render={({ field }) => (
                      <FormItem
                        className={
                          name === "childPob"
                            ? "flex-1 min-w-[300px]"
                            : "w-[200px]"
                        }
                      >
                        <FormLabel className="text-black/65">{label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type={type}
                            value={String(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-bold text-lg text-darkBlue2">
                Mother's Information
              </h2>
              <div className="flex flex-wrap gap-4">
                {formFields.slice(8, 12).map(({ name, label, type }, index) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name as keyof BasicInfoType}
                    render={({ field }) => (
                      <FormItem className="flex-1 min-w-[200px]">
                        <FormLabel className="text-black/65">
                          {label}
                          {/* Conditionally render the asterisk */}
                          {index !== 2 && (
                            <span className="text-red-600">*</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type={type}
                            value={String(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                {formFields.slice(12, 13).map(({ name, label, type }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name as keyof BasicInfoType}
                    render={({ field }) => (
                      <FormItem className="w-full md:w-1/2">
                        <FormLabel className="text-black/65">
                          {label}{" "}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type={type}
                            value={String(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-bold text-lg text-darkBlue2 mt-10">
                Father's Information
              </h2>

              <div className="flex flex-wrap gap-4">
                {formFields
                  .slice(13, 17)
                  .map(({ name, label, type }, index) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name as keyof BasicInfoType}
                      render={({ field }) => (
                        <FormItem className="flex-1 min-w-[200px]">
                          <FormLabel className="text-black/65">
                            {label}
                            {/* Conditionally render the asterisk */}
                            {index !== 2 && (
                              <span className="text-red-600">*</span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type={type}
                              value={String(field.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
              </div>
              <div className="flex flex-wrap gap-4">
                {formFields.slice(17, 18).map(({ name, label, type }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name as keyof BasicInfoType}
                    render={({ field }) => (
                      <FormItem className="w-full md:w-1/2">
                        <FormLabel className="text-black/65">{label}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type={type}
                            value={String(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <h2 className="font-bold text-lg text-darkBlue2 mt-10">Address</h2>
            {/* Address Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addressFields.map(({ name, label, placeholder }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof BasicInfoType}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black/65">{label}</FormLabel>
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

            <div className="flex flex-wrap gap-4">
              {formFields.slice(18).map(({ name, label, type }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof BasicInfoType}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[300px]">
                      <FormLabel className="text-black/65">{label}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type={type}
                          value={String(field.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="w-[100px]">
                Next
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
