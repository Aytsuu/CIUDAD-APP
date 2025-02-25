import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChildHealthFormSchema } from "@/form-schema/chr-schema";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";
import { CardTitle,CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

type Page1FormData = z.infer<typeof ChildHealthFormSchema>;
type Page1Props = {
  onNext2: () => void;
  updateFormData: (data: Partial<Page1FormData>) => void;
  formData: Page1FormData;
};

export default function ChildHRPage1({
  onNext2,
  updateFormData,
  formData,
}: Page1Props) {
  const form = useForm<Page1FormData>({
    resolver: zodResolver(ChildHealthFormSchema),
    defaultValues: formData,
  });

  useEffect(() => {
    console.log("Form data updated:", formData);
  }, [formData]);

  const onsubmitForm = (data: Page1FormData) => {
    console.log("PAGE 1:", data);
    updateFormData(data);
    onNext2();
  };

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
    { name: "address", label: "Address:", type: "text" },
    { name: "landmarks", label: "Landmarks:", type: "text" },
  ];

  return (
    <div className="w-full  max-w-6xl h-full my-10 mx-auto bg-white rounded-lg shadow p-4 md:p-6 lg:p-8">
      <Link to="/allChildHRTable">
        {" "}
        <div className="mb-8">
          <ArrowLeft />
        </div>
      </Link>

      <CardHeader className="border-b">

      <CardTitle className="text-2xl font-semibold pl-4 border-l-8 border-blue">
        Child Health Record
      </CardTitle>
</CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onsubmitForm, (errors) => {
            console.error("Form validation errors:", errors);
          })}
          className="space-y-6 p-4 md:p-6 lg:p-8"
        >
          <div className="w-full flex justify-between space-y-4">
            <div className="flex items-center justify-between gap-3 mb-10">
              <div>
                <input
                  type="text"
                  placeholder="Search residents..."
                  className="w-[500px] pl-5 pr-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Label>or</Label>
              <button className="flex items-center gap-1 underline text-blue hover:bg-blue-600 hover:text-sky-500 transition-colors rounded-md">
                <UserPlus className="h-4 w-4" />
                Add Resident
              </button>
            </div>

            <div className="flex flex-wrap mt-2">
              <FormField
                control={form.control}
                name="isTransient"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value === "transient"}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? "transient" : "resident");
                        }}
                      />
                    </FormControl>
                    <FormLabel className="leading-none mb-0">
                      Transient
                    </FormLabel>
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
                name={name as keyof Page1FormData}
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[200px]">
                    <FormLabel>{label}</FormLabel>
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
            <Label className="text-lg font-semibold">Child's Information</Label>
            <div className="flex flex-wrap gap-4">
              {formFields.slice(2, 6).map(({ name, label, type, options }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof Page1FormData}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[200px]">
                      <FormLabel>{label}</FormLabel>
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
                  name={name as keyof Page1FormData}
                  render={({ field }) => (
                    <FormItem
                      className={
                        name === "childPob"
                          ? "flex-1 min-w-[300px]"
                          : "w-[200px]"
                      }
                    >
                      <FormLabel>{label}</FormLabel>
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
            <Label className="text-lg font-semibold">
              Mother's Information
            </Label>
            <div className="flex flex-wrap gap-4">
              {formFields.slice(8, 12).map(({ name, label, type }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof Page1FormData}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[200px]">
                      <FormLabel>{label}</FormLabel>
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
                  name={name as keyof Page1FormData}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2">
                      <FormLabel>{label}</FormLabel>
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
            <Label className="text-lg font-semibold">
              Father's Information
            </Label>
            <div className="flex flex-wrap gap-4">
              {formFields.slice(13, 17).map(({ name, label, type }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof Page1FormData}
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[200px]">
                      <FormLabel>{label}</FormLabel>
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
                  name={name as keyof Page1FormData}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/2">
                      <FormLabel>{label}</FormLabel>
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

          <div className="flex flex-wrap gap-4">
            {formFields.slice(18, 20).map(({ name, label, type }) => (
              <FormField
                key={name}
                control={form.control}
                name={name as keyof Page1FormData}
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[300px]">
                    <FormLabel>{label}</FormLabel>
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
  );
}
