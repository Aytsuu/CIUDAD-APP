import { Button } from "@/components/ui/button/button";
import { BsChevronLeft } from "react-icons/bs";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { usePostBlotter } from "./restful-api/blotter-api";
import { toast } from "sonner";
import { MediaUpload } from "@/components/ui/media-upload";

interface MediaFile {
  id: number | string;
  type: "image" | "video" | "document";
  url: string;
  file?: File;
  description: string;
}

interface BlotterFormValues {
  bc_complainant: string;
  bc_cmplnt_address: string;
  bc_accused: string;
  bc_accused_address: string;
  bc_incident_type: string;
  bc_allegation: string;
  bc_datetime: string;
  bc_evidence: FileList | null;
}

// Function to format date for API
function formatDateForAPI(dateString: string) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  } catch (error) {
    console.error("Date format error:", error);
    return dateString;
  }
}

export function BlotterReport() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const navigate = useNavigate();
  
  const postBlotterMutation = usePostBlotter();

  const form = useForm<BlotterFormValues>({
    defaultValues: {
      bc_complainant: "",
      bc_cmplnt_address: "",
      bc_accused: "",
      bc_accused_address: "",
      bc_incident_type: "",
      bc_allegation: "",
      bc_datetime: new Date().toISOString().split("T")[0],
      bc_evidence: null
    }
  });

  const onSubmit = async (data: BlotterFormValues) => {
    const formData = new FormData();
    
    // Format the date to match expected format
    const formattedData = {
      ...data,
      bc_datetime: formatDateForAPI(data.bc_datetime)
    };
    
    // Append form data
    Object.entries(formattedData).forEach(([key, value]) => {
      if (key !== "bc_evidence" && value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Append media files
    mediaFiles.forEach((file, index) => {
      if (file.file) {
        // Use a consistent key name pattern for server processing
        formData.append(`mediaFiles`, file.file);
      }
    });
    
    // Debug information
    console.log("Form data keys:", [...formData.keys()]);
    
    try {
      await postBlotterMutation.mutateAsync(formData, {
        onSuccess: () => {
          toast("Blotter report submitted successfully");
          navigate("/blotter-record");
        },
        onError: (error: any) => {
          console.error("Submission failed:", error);
          toast(`Failed to submit report: ${error.response?.data?.message || error.message || "Unknown error"}`);
        }
      });
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  const currentDate = new Date().toISOString().split("T")[0];

  return (
    <div className="w-full h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="flex flex-row mb-4 sm:mb-0">
          <div className="flex items-center mr-4">
            <Button className="text-black p-2 self-start" variant="outline">
              <Link to="/blotter-record">
                <BsChevronLeft />
              </Link>
            </Button>
          </div>
          <div>
            <h1 className="font-semibold text-l sm:text-2xl text-darkBlue2">
              Barangay Report
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">D3312TH899033190</p>
            <p className="text-xs sm:text-sm text-darkGray">
              March 09, 2023 12:23
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray mb-6 sm:mb-8" />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Complainant Card */}
            <div className="border rounded-md p-4 bg-white">
              <h3 className="font-medium text-lg mb-2 text-darkBlue2">
                Complainant
              </h3>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="bc_complainant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-darkGray">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter Complaint Name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bc_cmplnt_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-darkGray">
                        Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Sitio/Barangay/Municipality/City"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Accused Card */}
            <div className="border rounded-md p-4 bg-white">
              <h3 className="font-medium text-lg mb-2 text-darkBlue2">
                Accused
              </h3>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="bc_accused"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-darkGray">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter Accused Name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bc_accused_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-darkGray">
                        Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Sitio/Barangay/Municipality/City"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Incident Details */}
          <div className="border rounded-md p-4 bg-white">
            <h1 className="font-medium text-lg text-darkBlue2 mb-4">
              Incident Details
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <FormField
                control={form.control}
                name="bc_incident_type"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-sm text-darkGray">
                      Category
                    </FormLabel>
                    <FormControl>
                      <SelectLayout
                        label="Incidents"
                        placeholder="Select"
                        options={[
                          { id: "1", name: "Theft" },
                          { id: "2", name: "Assault" },
                          { id: "3", name: "Noise Complaint" },
                          { id: "4", name: "Property Damage" },
                          { id: "5", name: "Other" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bc_datetime"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-sm text-darkGray">
                      Date of Incident
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="dd/mm/yyyy --:-- --"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // You could add date format validation here if needed
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="bc_allegation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-darkGray">
                    Incident Description
                  </FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full border rounded-md p-2 min-h-24"
                      placeholder="Enter incident details here..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Supporting Documents */}
          <div className="border rounded-md p-4 bg-white">
            <h2 className="font-medium text-lg mb-4 text-darkBlue2">
              Supporting Documents
            </h2>
            <MediaUpload 
              title="Supporting Evidence"
              description="Upload images, videos or documents related to the incident"
              mediaFiles={mediaFiles}
              activeVideoId={activeVideoId}
              setMediaFiles={setMediaFiles}
              setActiveVideoId={setActiveVideoId}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Link to="/blotter-record">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={postBlotterMutation.isPending}
            >
              {postBlotterMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}