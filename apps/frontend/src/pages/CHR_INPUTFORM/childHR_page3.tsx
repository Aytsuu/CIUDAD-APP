import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectLayout } from "@/components/ui/select/select-layout";

type Page1FormData = z.infer<typeof ChildHealthFormSchema>;
type Page1Props = {
  onPrevious2: () => void;
  onNext4: () => void;
  updateFormData: (data: Partial<Page1FormData>) => void;
  formData: Page1FormData;
};

export default function ChildHRPage3({
  onPrevious2,
  onNext4,
  updateFormData,
  formData,
}: Page1Props) {
  const form = useForm<Page1FormData>({
    defaultValues: formData, // Set default values from the parent
  });

  const { handleSubmit, reset } = form;
  const [hasDisablity, sethasDisablity] = useState(false);

  useEffect(() => {
    reset(formData); // Rehydrate form when formData changes
  }, [formData, reset]);

  const onSubmitForm = (data: Page1FormData) => {
    updateFormData(data); // Store data before moving to the next page
    onNext4();
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="space-y-6 p-4 md:p-6 lg:p-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <h1> PAGE 3</h1>
            <FormField
              control={form.control}
              name="hasDisability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>eyyy No:</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasDisability"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      id="hasDisability"
                      checked={!!field.value} // Ensure it is always a boolean
                      onCheckedChange={(checked) => {
                        field.onChange(checked); // Directly update form state
                        sethasDisablity(checked === true); // Update local state
                      }}
                    />
                  </FormControl>
                  <FormLabel htmlFor="hasDisability">
                    Accept terms and conditions
                  </FormLabel>
                </FormItem>
              )}
            />

            {/* Conditionally Render SelectLayout */}
            {hasDisablity && (
              <FormField
                control={form.control}
                name="screeningStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Screening Process Status</FormLabel>
                    <FormControl>
                      <SelectLayout
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
            )}
          </div>

          <div className="flex w-full justify-end">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious2}
                className="w-[100px]"
              >
                {" "}
                Previous
              </Button>
              <Button type="submit" className="w-[100px]">
                Next
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
