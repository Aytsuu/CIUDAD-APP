import { useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Textarea } from "@/components/ui/textarea";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { FormInput } from "@/components/ui/form/form-input";

export const IncidentInfo = () => {
  const { control } = useFormContext();
  const incidentType = useWatch({ control, name: "incident.type" });

  const incidentTypeOptions = [
    { id: "Theft", name: "Theft" },
    { id: "Assault", name: "Assault" },
    { id: "Property Damage", name: "Property Damage" },
    { id: "Noise", name: "Noise Complaint" },
    { id: "Other", name: "Other" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="incident.type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-black/50">
                Incident Type *
              </FormLabel>
              <FormControl>
                <SelectLayout
                  placeholder="Select incident type"
                  label="Incident Types"
                  options={incidentTypeOptions}
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {incidentType === "Other" && (
          <FormInput
            control={control}
            name="incident.otherType"
            label="Specify Incident Type *"
            placeholder="Describe the incident type"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          control={control}
          name="incident.date"
          label="Date *"
          type="date"
        />

        <FormInput
          control={control}
          name="incident.time"
          label="Time *"
          type="time"
        />
      </div>

      <FormInput
        control={control}
        name="incident.location"
        label="Location *"
        placeholder="Specific place of where the incident happened"
      />

      <FormField
        control={control}
        name="incident.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-semibold text-black/50">
              Incident Details *
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Provide a clear and complete account of what happened..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-6">
        {/* <MediaUpload
          title="Supporting Documents"
          description="Upload images, videos, or documents (PDF, DOC, DOCX) that support your complaint (Max 10MB each)"
        /> */}
      </div>
    </div>
  );
};