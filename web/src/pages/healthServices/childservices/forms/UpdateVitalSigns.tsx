import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VitalSignSchema, VitalSignType } from "@/form-schema/chr-schema";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";

interface UpdateVitalSignsProps {
  initialData: VitalSignType;
  onSubmit: (values: VitalSignType) => void;
  onCancel: () => void;
}

export function UpdateVitalSigns({
  initialData,
  onSubmit,
  onCancel,
}: UpdateVitalSignsProps) {
  const form = useForm<VitalSignType>({
    resolver: zodResolver(VitalSignSchema),
    defaultValues: initialData,
  });

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit((data) => {
          onSubmit(data);
        })}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <FormInput
              control={form.control}
              name="age"
              label="Age"
              type="text"
              placeholder="Enter age"
              className="bg-gray-50"
            />

            <FormInput
              control={form.control}
              name="wt"
              label="Weight (kg)"
              type="number"
              placeholder="Enter weight"
              className="bg-gray-50"
            />

            <FormInput
              control={form.control}
              name="ht"
              label="Height (cm)"
              type="number"
              placeholder="Enter height"
              className="bg-gray-50"
            />
          </div>

          {/* Measurements Section */}
          <div className="space-y-4">
            <FormInput
              control={form.control}
              name="temp"
              label="Temperature (°C)"
              type="number"
              placeholder="Enter temperature"
              className="bg-gray-50"
            />
          </div>

          {/* Follow Up Section - Full width */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="follov_description"
                label="Follow Up Description"
                type="text"
                placeholder="Enter follow up description"
                className="bg-gray-50"
              />

              <FormDateTimeInput
                control={form.control}
                name="followUpVisit"
                label="Follow Up Visit Date"
                type="date"
              />
            </div>
          </div>

          {/* Notes Section - Full width */}
          <div className="col-span-1 md:col-span-2">
            <FormTextArea
              control={form.control}
              name="notes"
              label="Additional Notes"
              placeholder="Enter any additional notes here..."
              className="min-h-[120px] bg-gray-50"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button type="submit" className="px-6 py-2">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
