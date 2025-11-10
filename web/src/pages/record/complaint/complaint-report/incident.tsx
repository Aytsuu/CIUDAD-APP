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
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react";
import React from "react";
import { MdDescription } from "react-icons/md";

interface IncidentInfoProps {
  onSubmit: () => void;
  onPrevious: () => void;
  isSubmitting: boolean;
}

export const IncidentInfo: React.FC<IncidentInfoProps> = ({
  onSubmit,
  onPrevious,
  isSubmitting,
}) => {
  const { control, setValue, watch, trigger } = useFormContext();
  const incidentType = useWatch({
    control,
    name: "incident.comp_incident_type",
  });

  // Watch the documents field from the form
  const formFiles = watch("files") || [];
  const [mediaFiles, setMediaFiles] =
    React.useState<MediaUploadType>(formFiles);

  // Watch the datetime field to sync with date/time inputs
  const compDateTime = watch("incident.comp_datetime") || "";

  // Extract date and time from comp_datetime for the UI inputs
  const currentDate = compDateTime ? compDateTime.split("T")[0] : "";
  const currentTime = compDateTime ? compDateTime.split("T")[1] : "";

  React.useEffect(() => {
    setValue("files", mediaFiles);
  }, [mediaFiles, setValue]);

  // Sync form data with local state on mount/form data change
  React.useEffect(() => {
    if (formFiles.length !== mediaFiles.length) {
      setMediaFiles(formFiles);
    }
  }, [formFiles]);

  // Set initial date/time values when component mounts
  React.useEffect(() => {
    if (!compDateTime) {
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().slice(0, 5);
      const initialDateTime = `${dateStr}T${timeStr}`;
      setValue("incident.comp_datetime", initialDateTime);
      setValue("incident.date", dateStr);
      setValue("incident.time", timeStr);
    }
  }, [compDateTime, setValue]);

  const incidentTypeOptions = [
    { id: "Theft", name: "Theft" },
    { id: "Assault", name: "Assault" },
    { id: "Property Damage", name: "Property Damage" },
    { id: "Noise", name: "Noise Complaint" },
    { id: "Other", name: "Other" },
  ];

  // Handle datetime change
  const handleDateTimeChange = (field: "date" | "time", value: string) => {
    const currentDateTime = watch("incident.comp_datetime") || "";
    let datePart = currentDateTime.includes("T")
      ? currentDateTime.split("T")[0]
      : new Date().toISOString().split("T")[0];
    let timePart = currentDateTime.includes("T")
      ? currentDateTime.split("T")[1]
      : "00:00";

    if (field === "date") {
      datePart = value;
    } else if (field === "time") {
      timePart = value;
    }

    const newDateTime = `${datePart}T${timePart}`;
    setValue("incident.comp_datetime", newDateTime);

    // Also update the individual date/time fields for UI consistency
    setValue("incident.date", datePart);
    setValue("incident.time", timePart);

    // Trigger validation after setting the value
    setTimeout(() => {
      trigger("incident.comp_datetime");
    }, 100);
  };

  const handleSubmitClick = async () => {
    const isValid = await trigger([
      "incident.comp_location",
      "incident.comp_incident_type",
      "incident.comp_allegation",
      "incident.comp_datetime",
    ]);

    if (isValid) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-6 bg-white mt-10 rounded-lg">
      <div className="bg-white p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex text-blue-500 items-center justify-center mb-2">
            <MdDescription size={30} className="mr-2" />
            <h3 className="text-lg font-bold">Incident Details</h3>
          </div>
          <p className="text-xs text-gray-600 max-w-md">
            Provide accurate information about the incident, including what happened, when, and where. All data will be securely stored and treated with confidentiality.
          </p>
        </div>
      </div>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="incident.comp_incident_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-black/70">
                  Incident Type *
                </FormLabel>
                <FormControl>
                  <SelectLayout
                    placeholder="Select incident type"
                    label="Incident Types"
                    options={incidentTypeOptions}
                    value={field.value || ""}
                    onChange={(value) => {
                      field.onChange(value);
                      setTimeout(
                        () => trigger("incident.comp_incident_type"),
                        100
                      );
                    }}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="incident.date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-black/70">
                  Date of Incident *
                </FormLabel>
                <FormControl>
                  <input
                    type="date"
                    value={currentDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      handleDateTimeChange("date", value);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="incident.time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-black/70">
                  Time of Incident *
                </FormLabel>
                <FormControl>
                  <input
                    type="time"
                    value={currentTime}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      handleDateTimeChange("time", value);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormInput
          control={control}
          name="incident.comp_location"
          label="Location of Incident *"
          placeholder="Enter the exact location where the incident occurred"
        />

        <FormField
          control={control}
          name="incident.comp_allegation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-black/70">
                Incident Details / Allegation *
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a clear and complete account of what happened. Include details such as what occurred, who was involved, and any other relevant information..."
                  className="min-h-[120px] resize-vertical"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    // Trigger validation after a short delay
                    setTimeout(() => trigger("incident.comp_allegation"), 300);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hidden field for the combined datetime that the backend expects */}
        <input
          type="hidden"
          {...control.register("incident.comp_datetime", {
            required: "Date and time are required",
          })}
        />

        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div>
            <FormLabel className="font-semibold text-black/70">
              Supporting Evidence
            </FormLabel>
            <p className="text-sm text-gray-600 mt-1">
              Upload photos or documents that support your complaint (optional)
            </p>
          </div>

          <MediaUpload
            title="Supporting Documents"
            description="Upload images (PNG, JPEG, JPG) or documents (PDF) that support your complaint. Maximum 5 files."
            mediaFiles={mediaFiles}
            setMediaFiles={setMediaFiles}
            maxFiles={5}
            acceptableFiles="image"
          />
        </div>

        {/* Navigation and Submit Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onPrevious}
            className="flex items-center gap-2 text-darkGray hover:bg-blue-500 hover:text-white"
            disabled={isSubmitting}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>Submit Complaint</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
