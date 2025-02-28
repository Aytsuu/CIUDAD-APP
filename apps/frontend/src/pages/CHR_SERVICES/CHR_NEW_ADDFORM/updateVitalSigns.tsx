import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VitalSignSchema, VitalSignFormData } from "@/form-schema/chr-schema";

interface UpdateVitalSignsProps {
  initialData: VitalSignFormData; // Add initialData prop
  onSubmit: (values: VitalSignFormData) => void;
  onCancel: () => void;
}

export function UpdateVitalSigns({ initialData, onSubmit, onCancel }: UpdateVitalSignsProps) {
  const form = useForm<VitalSignFormData>({
    resolver: zodResolver(VitalSignSchema),
    defaultValues: initialData, // Populate form with initialData
  });

  const formFields = [
    { name: "age", label: "Age", type: "text" },
    { name: "wt", label: "Weight (kg)", type: "number" },
    { name: "ht", label: "Height (cm)", type: "number" },
    { name: "temp", label: "Temperature (°C)", type: "number" },
    { name: "date", label: "Date", type: "date" },
    { name: "followUpVisit", label: "Follow Up Visit", type: "date" },
    { name: "findings", label: "Findings", type: "text" },
    { name: "notes", label: "Notes", type: "text" },
  ];

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((data) => {
          console.log("Form data submitted:", data); // Debugging
          onSubmit(data);
        }, (errors) => {
          console.error("Form validation errors:", errors); // Debugging
        })}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formFields.map(({ name, label, type }) => (
            <FormField
              key={name}
              control={form.control}
              name={name as keyof VitalSignFormData}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={type}
                      step={type === "number" ? "0.01" : undefined}
                      onChange={
                        type === "number"
                          ? (e) => field.onChange(Number(e.target.value))
                          : field.onChange
                      }
                      value={field.value as string | number | readonly string[] | undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}