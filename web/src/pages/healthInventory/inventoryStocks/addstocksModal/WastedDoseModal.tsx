import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { 
  FormField, 
  FormControl, 
  FormItem, 
  FormLabel, 
  FormMessage, 
  Form 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";




interface WastedDoseFormProps {
  wasted:number// Optional initial value for the input
}
// ✅ Define Zod Schema for Wasted Doses
const formSchema = z.object({
  wastedDose: z.number()
    .min(1, "Wasted dose must be at least 1")
    .int("Must be a whole number"),
});

export default function WastedDoseForm({wasted}:WastedDoseFormProps) {
  // ✅ Initialize form with validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wastedDose: 0, // Default value
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Submitted Data:", data);
    console.log(wasted)
    // Handle form submission (store data, send to API, etc.)
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <FormField
              control={form.control}
              name="wastedDose" // ✅ Correct field name
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wasted Dose</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter wasted dose"
                      value={field.value 
                        || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : parseInt(value, 10));
                      }}/>
                  </FormControl>
                  <FormMessage /> {/* ✅ Shows validation errors */}
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
