import { useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";


// ✅ Define Zod Schema for Wasted Doses
const formSchema = z.object({
  usedItem: z
    .number()
    .min(1, "Must have atleast 1 used Items")
    .int("Must be a whole number"),
});

export default function UsedFAModal() {
  // ✅ Initialize form with validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usedItem: 0, // Default value
    },
  });

 

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Submitted Data:", data);
    alert("Success")
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <FormField
              control={form.control}
              name="usedItem" // ✅ Correct field name
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. of Used Items</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="No. of Used Items"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          value === "" ? undefined : parseInt(value, 10)
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage /> 
                </FormItem>
              )}
            />
          </div>

          <div className="w-full flex justify-end mt-4">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </>
  );
}
