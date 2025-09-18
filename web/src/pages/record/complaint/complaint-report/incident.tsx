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
import React from "react";

export const IncidentInfo = () => {
  const { control, setValue, watch, trigger } = useFormContext();
  const incidentType = useWatch({ control, name: "incident.comp_incident_type" });

  // Watch the documents field from the form
  const formDocuments = watch("documents") || [];
  const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>(formDocuments);

  // Watch the datetime field to sync with date/time inputs
  const compDateTime = watch("incident.comp_datetime") || "";
  
  // Extract date and time from comp_datetime for the UI inputs
  const currentDate = compDateTime ? compDateTime.split('T')[0] : "";
  const currentTime = compDateTime ? compDateTime.split('T')[1] : "";

  // Sync mediaFiles with form data whenever it changes
  React.useEffect(() => {
    setValue("documents", mediaFiles);
  }, [mediaFiles, setValue]);

  // Sync form data with local state on mount/form data change
  React.useEffect(() => {
    if (formDocuments.length !== mediaFiles.length) {
      setMediaFiles(formDocuments);
    }
  }, [formDocuments]);

  // Set initial date/time values when component mounts
  React.useEffect(() => {
    if (!compDateTime) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
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
    let datePart = currentDateTime.includes("T") ? currentDateTime.split("T")[0] : new Date().toISOString().split("T")[0];
    let timePart = currentDateTime.includes("T") ? currentDateTime.split("T")[1] : "00:00";
    
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

  return (
    <div className="space-y-6">
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
                    setTimeout(() => trigger("incident.comp_incident_type"), 100);
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
        // rules={{ required: "Location is required" }}
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
          required: "Date and time are required" 
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

      {/* Debug information (remove in production) */}
      {/* <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs">
        <h4 className="font-semibold mb-2">Debug Info:</h4>
        <p>comp_datetime: {compDateTime}</p>
        <p>Date: {currentDate}</p>
        <p>Time: {currentTime}</p>
      </div> */}
    </div>
  );
};