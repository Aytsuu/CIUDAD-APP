import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";

// Schema for validation
const Page2Schema = z.object({
  birthWeight: z.string(),
  birthLength: z.string(),
  headCircumference: z.string(),
  chestCircumference: z.string(),
  deliveryType: z.string(),
  gestationalAge: z.string(),
  complications: z.string(),
});

type Page2Props = {
  onPrevious4: () => void;
  onSubmitForm: () => void;
  updateFormData: (data: Partial<z.infer<typeof Page2Schema>>) => void;
};

export default function ChildHRPageLast({
  onPrevious4,
  onSubmitForm,
  updateFormData,
}: Page2Props) {
  const form = useForm<z.infer<typeof Page2Schema>>({
    resolver: zodResolver(Page2Schema),
    defaultValues: {
      birthWeight: "",
      birthLength: "",
      headCircumference: "",
      chestCircumference: "",
      deliveryType: "",
      gestationalAge: "",
      complications: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof Page2Schema>) => {
    updateFormData(data); // Save the data
    onSubmitForm(); // Submit the entire form
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-[0_1px_12px_-3px_rgba(0,0,0,0.05),0_8px_16px_-2px_rgba(0,0,0,0.03)] p-6">
      <Form {...form}>
        <form
          className="space-y-6 p-4 md:p-6 lg:p-8"
          onSubmit={form.handleSubmit(handleSubmit)} // ✅ Handles submission
        >
          {/* Birth Measurements Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Birth Measurements</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="birthWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Length (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="headCircumference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Head Circumference (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chestCircumference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chest Circumference (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Delivery Information Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">
              Delivery Information
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deliveryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Delivery</FormLabel>
                    <FormControl>
                      <SelectLayout
                        label="Delivery Type"
                        placeholder="Select delivery type"
                        options={[
                          { id: "1", name: "Normal Spontaneous Delivery" },
                          { id: "2", name: "Caesarean Section" },
                          { id: "3", name: "Assisted Delivery" },
                        ]}
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
                name="gestationalAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gestational Age (weeks)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Complications Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Complications</Label>
            <FormField
              control={form.control}
              name="complications"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter any complications during delivery..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex w-full justify-end">
            <div className="flex gap-2">
              <Button type="button" className="w-[100px]" onClick={onPrevious4}>
                Previous
              </Button>
              <Button type="submit" className="w-[100px]">
                Submit {/* ✅ Now handles submission */}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
