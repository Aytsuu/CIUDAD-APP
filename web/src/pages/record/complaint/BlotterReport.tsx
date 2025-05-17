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
import { postBlotter } from "./restful-api/blotter-api";
import { toast } from "sonner";
import { MediaUpload } from "@/components/ui/media-upload";
import { BlotterFormValues, MediaFile } from "./blotter-type";
import { useMutation } from "@tanstack/react-query";
import supabase from "@/supabase/supabase";
import { FormInput } from "@/components/ui/form/form-input";
import { Plus } from "lucide-react";

export function BlotterReport() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const navigate = useNavigate();

  const postBlotterMutation = useMutation({
    mutationFn: (formData: FormData) => postBlotter(formData),
  });

  const form = useForm<BlotterFormValues>();

  const onSubmit = async (data: BlotterFormValues) => {
    try {
      const mediaUrls = await Promise.all(
        mediaFiles.map(async (file) => {
          if (!file.file) return null;

          // Create unique filename
          const fileExt = file.file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 15)}.${fileExt}`;
          const filePath = `blotter-evidence/${fileName}`;

          // Upload to Supabase bucket
          const { data: uploadData, error } = await supabase.storage
            .from("blotter-files")
            .upload(filePath, file.file);

          if (error) {
            console.error("Error uploading file:", error);
            throw error;
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("blotter-files").getPublicUrl(filePath);

          return {
            originalName: file.file.name,
            storagePath: filePath,
            url: publicUrl,
            type: file.file.type,
          };
        })
      );

      // Filter out nulls from failed uploads
      const validMediaUrls = mediaUrls.filter((url) => url !== null);

      // Create form data for API
      const formData = new FormData();

      // Append form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Add media URLs as JSON string
      formData.append("media_urls", JSON.stringify(validMediaUrls));

      // Submit to Django API
      await postBlotterMutation.mutateAsync(formData, {
        onSuccess: () => {
          toast("✅     Blotter report submitted successfully");
          navigate("/blotter-record");
        },
        onError: (error: any) => {
          console.error("Submission failed:", error);
          toast(
            `❌     Failed to submit report: ${
              error.response?.data?.message || error.message || "Unknown error"
            }`
          );
        },
      });
    } catch (error) {
      console.error("Submission failed:", error);
      toast("❌     Failed to submit report");
    }
  };

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
            <p className="text-xs sm:text-sm text-darkGray">
              Report individuals involved in conflicts, disturbances, or
              incidents needing barangay action.{" "}
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray mb-6 sm:mb-8" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex-row space-y-4">
            {/* Complainant Card */}
            <div className="border rounded-md p-4 bg-white">
              <h3 className="font-medium text-lg mb-2 text-darkBlue2">
                Complainant
              </h3>
              <div className="flex flex-col space-y-3">
                <div className="flex flex-col md:flex-row md:space-x-3">
                  <FormInput
                    control={form.control}
                    name="bc_complainant_lastname"
                    label="Last Name"
                    placeholder="Last Name"
                  />
                  <FormInput
                    control={form.control}
                    name="bc_complainant_firstname"
                    label="First Name"
                    placeholder="First Name"
                  />
                  <FormInput
                    control={form.control}
                    name="bc_complainant_Middlename"
                    label="Middle Name"
                    placeholder="Middle Name"
                  />
                  <FormInput
                    control={form.control}
                    name="bc_complainant_Suffix"
                    label="Suffix"
                    placeholder="Suffix"
                  />
                </div>
                <div>
                  <FormInput
                    control={form.control}
                    name="bc_cmplnt_address"
                    label="Address"
                    placeholder="Sitio/Barangay/Municipality/City"
                  />
                </div>
              </div>
            </div>

            {/* Accused Card */}
            <div className="border rounded-md p-4 bg-white">
              <h3 className="font-medium text-lg mb-2 text-darkBlue2">
                Accused
              </h3>
              <div className="flex flex-col space-y-3">
                <div className="flex flex-col md:flex-row md:space-x-3">
                  <FormInput
                    control={form.control}
                    name="bc_accused_lastname"
                    label="Last Name"
                    placeholder="Last Name"
                  />
                  <FormInput
                    control={form.control}
                    name="bc_accused_firstname"
                    label="First Name"
                    placeholder="First Name"
                  />
                  <FormInput
                    control={form.control}
                    name="bc_accused_middlename"
                    label="Middle Name"
                    placeholder="Middle Name"
                  />
                  <FormInput
                    control={form.control}
                    name="bc_accused_suffix"
                    label="Suffix"
                    placeholder="Suffix"
                  />
                </div>
                <div>
                  <FormInput
                    control={form.control}
                    name="bc_accused_address"
                    label="Address"
                    placeholder="Sitio/Barangay/Municipality/City"
                  />
                </div>
                <div className="flex justify-center">
                  <Button className="flex items-center gap-1 h-8 w-28">
                    <Plus /> Add
                  </Button>
                </div>{" "}
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
            <Button type="submit" disabled={postBlotterMutation.isPending}>
              {postBlotterMutation.isPending
                ? "Submitting..."
                : "Submit Report"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
