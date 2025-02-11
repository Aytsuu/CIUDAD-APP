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
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow p-4 md:p-6 lg:p-8">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="space-y-6"
        >
          <div className="w-full flex items-start bg-white rounded-lg p-4 md:p-6 lg:p-8">
            <div>
              <FormField
                control={form.control}
                name="hasDisability"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        id="hasDisability"
                        checked={!!field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          sethasDisablity(checked === true);
                        }}
                      />
                    </FormControl>
                    <FormLabel htmlFor="hasDisability" className="leading-none">
                      Accept terms and conditions
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {/* Conditionally Render SelectLayout */}
            {hasDisablity && (
              <FormField
                control={form.control}
                name="screeningStatus"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row sm:gap-2 items-center mt-4">
                    <FormLabel className="mb-2 sm:mb-0">Select/Specify Disablity</FormLabel>
                    <FormControl>
                      <SelectLayout
                        className="min-w-[100px]"
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