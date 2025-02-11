import { useForm } from "react-hook-form";
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
import ChildHealthFormSchema from "@/form-schema/chr-schema";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";

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
  const form = useForm<z.infer<typeof ChildHealthFormSchema>>({
    defaultValues: formData,
  });

  const { handleSubmit } = form;

  const onsubmitForm = (data: Page1FormData) => {
    console.log("Form Data:", data);
    updateFormData(data);
    onNext2();
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-[0_1px_12px_-3px_rgba(0,0,0,0.05),0_8px_16px_-2px_rgba(0,0,0,0.03)] p-6">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onsubmitForm)}
          className="space-y-6 p-4 md:p-6 lg:p-8"
        >
          {/* ID Numbers Section */}
          <div className="flex flex-wrap gap-4">
            <FormField
              control={form.control}
              name="familyNo"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[200px]">
                  <FormLabel>Family No:</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ufcNo"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[200px]">
                  <FormLabel>UFC No:</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Child's Information Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Child's Information</Label>
            <div className="flex flex-wrap gap-4">
              <FormField
                control={form.control}
                name="childFname"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[200px]">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="childLname"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[200px]">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="childMname"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[200px]">
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="childSex"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[200px]">
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <SelectLayout
                        className="w-full" // Add this line!
                        label="Gender"
                        placeholder="Select gender"
                        options={[
                          { id: "1", name: "Male" },
                          { id: "2", name: "Female" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <FormField
                control={form.control}
                name="childDob"
                render={({ field }) => (
                  <FormItem className="w-[200px]">
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="childPob"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[300px]">
                    <FormLabel>Place of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter place of birth"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Mother's Information Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">
              Mother's Information
            </Label>
            <div className="flex flex-wrap gap-4">
              <FormField
                control={form.control}
                name="motherFname"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[200px]">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="motherLname"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[200px]">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="motherMname"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[200px]">
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="motherAge"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[200px]">
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <FormField
                control={form.control}
                name="motherOccupation"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/2">
                    <FormLabel>Occupation</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Father's Information Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">
              Father's Information
            </Label>
            <div className="flex flex-wrap gap-4">
              <FormField
                control={form.control}
                name="fatherFname"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[200px]">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fatherLname"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[200px]">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fatherMname"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[200px]">
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fatherAge"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[200px]">
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <FormField
                control={form.control}
                name="fatherOccupation"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/2">
                    <FormLabel>Occupation</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="flex flex-wrap gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[300px]">
                  <FormLabel>Address:</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="landmarks"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[300px]">
                  <FormLabel>Landmarks:</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Newborn Screening Section */}
          <div>
            <FormLabel>Date referred for newborn screening</FormLabel>
            <div className="flex flex-wrap gap-4 mt-2">
              <FormField
                control={form.control}
                name="dateNewbornScreening"
                render={({ field }) => (
                  <FormItem className="w-[200px]">
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Screening Status */}
          <FormField
            control={form.control}
            name="screeningStatus"
            render={({ field }) => (
              <FormItem className="max-w-[400px]">
                <FormLabel>Screening Process Status</FormLabel>
                <FormControl>
                  <SelectLayout
                    className="w-full" // Add this line!
                    label="Status"
                    placeholder="Select status"
                    options={[
                      { id: "1", name: "Male" },
                      { id: "2", name: "Female" },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Navigation Buttons */}
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
