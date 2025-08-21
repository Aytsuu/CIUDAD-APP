"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VitalSignSchema } from "@/form-schema/chr-schema/chr-schema";
import type { VitalSignType } from "@/form-schema/chr-schema/chr-schema";
import {
  Form,
 
} from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { Button } from "@/components/ui/button/button";

interface VitalSignsSectionProps {
  currentAge: string;
  latestOverallVitalSign?: VitalSignType | null;
  onAddVitalSign: (values: VitalSignType) => void;
  onCancel: () => void;
}

export function VitalSignsSection({
  currentAge,
  latestOverallVitalSign,
  onAddVitalSign,
  onCancel,
}: VitalSignsSectionProps) {
  const vitalSignForm = useForm<VitalSignType>({
    resolver: zodResolver(VitalSignSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      age: currentAge,
      wt: latestOverallVitalSign?.wt || undefined,
      ht: latestOverallVitalSign?.ht || undefined,
      temp: undefined,
      follov_description: "",
      followUpVisit: "",
      followv_status: "pending",
      notes: "",
    },
  });

  return (
    <div className="rounded-lg border bg-blue-50 p-4">
      <h3 className="mb-4 text-lg font-bold">Add New Vital Signs</h3>
      <Form {...vitalSignForm}>
        <form
          onSubmit={vitalSignForm.handleSubmit(onAddVitalSign)}
          className="space-y-4"
        >
          <div className="flex w-full justify-between gap-2">
            <FormInput
              control={vitalSignForm.control}
              name="age"
              label="Age"
              type="text"
              placeholder="Current age"
              readOnly
              className="bg-gray-100"
            />
            <FormInput
              control={vitalSignForm.control}
              name="wt"
              label="Weight (kg)"
              type="number"
              placeholder="Enter weight"
            />
            <FormInput
              control={vitalSignForm.control}
              name="ht"
              label="Height (cm)"
              type="number"
              placeholder="Enter height"
            />
            <FormInput
              control={vitalSignForm.control}
              name="temp"
              label="Temperature (°C)"
              type="number"
              placeholder="Enter temperature"
            />
          </div>
          <div className="w-full">
            <FormTextArea
              control={vitalSignForm.control}
              name="notes"
              label="Notes"
              placeholder="Enter notes"
              rows={3}
            />
          </div>
          <div className="flex w-full gap-4">
            <FormTextArea
              control={vitalSignForm.control}
              name="follov_description"
              label="Follow Up Reason"
              placeholder="Enter reason for follow-up"
              className="w-full"
            />
            <FormDateTimeInput
              control={vitalSignForm.control}
              name="followUpVisit"
              label="Follow Up Visit Date"
              type="date"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6 py-2 hover:bg-zinc-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 px-6 py-2 hover:bg-green-700"
            >
              Add Vital Signs
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}