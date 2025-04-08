// import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form/form";
import GADAddEntrySchema from "@/form-schema/gad-budget-track-create-form-schema";

function GADAddEntryForm() {
  const form = useForm<z.infer<typeof GADAddEntrySchema>>({
    resolver: zodResolver(GADAddEntrySchema),
    defaultValues: {
      entryType: "",
      additionalNotes: "",
      entryAmount: "",
      entryParticulars: "",
    },
  });

  const onSubmit = (values: z.infer<typeof GADAddEntrySchema>) => {
    console.log(values);
    // Handle form submission
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="p-6 max-w-4xl mx-auto"
      >
        <FormField
          control={form.control}
          name="entryType"
          render={({ field }) => (
            <FormItem>
              <Label>Type of Entry:</Label>
              <FormControl>
                <SelectLayout
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  label="Entry Type"
                  placeholder="Select Type"
                  options={[
                    { id: "1", name: "Entry 1" },
                    { id: "2", name: "Entry 2" },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <br />

        <FormField
          control={form.control}
          name="entryAmount"
          render={({ field }) => (
            <FormItem>
              <Label>Amount:</Label>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <br />

        <FormField
          control={form.control}
          name="entryParticulars"
          render={({ field }) => (
            <FormItem>
              <Label>Particulars:</Label>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <br />

        <FormField
          control={form.control}
          name="additionalNotes"
          render={({ field }) => (
            <FormItem>
              <Label>Additional Notes:</Label>
              <FormControl>
                <Textarea
                  placeholder="Enter additional notes (if there is any)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <br />
        <div className="flex items-center justify-end">
          <Button
            type="submit"
            className="bg-blue hover:bg-blue hover:opacity-[95%"
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default GADAddEntryForm;
