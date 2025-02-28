import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import GADCreateBudgetTrackerSchema from "@/form-schema/gad-budget-track-create-tracker";

function CreateGADBudgetTracker() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, index) => (currentYear - index).toString());

  const yearOptions = years.map((year) => ({
    id: year,
    name: year,
  }));

  const form = useForm<z.infer<typeof GADCreateBudgetTrackerSchema>>({
    resolver: zodResolver(GADCreateBudgetTrackerSchema),
    defaultValues: {
      startingBal: "",
      year: "",
    },
  });

  const onSubmit = (values: z.infer<typeof GADCreateBudgetTrackerSchema>) => {
    console.log(values);
    navigate("/gad-budget-tracker-table");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <SelectLayout {...field} options={yearOptions} value={field.value} onChange={field.onChange} label="" placeholder="Select Year" className="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startingBal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Starting Balance</FormLabel>
              <FormControl>
                <Input placeholder="0.00" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end mt-[20px]">
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  );
}

export default CreateGADBudgetTracker;
