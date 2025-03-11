import { Button } from "@/components/ui/button";
import { Image, Film, Plus, X, Calendar, Play } from "lucide-react";
import { BsChevronLeft } from "react-icons/bs";
import { useState, useRef, ChangeEvent } from "react";
import sanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";

// Define types for our media files
interface MediaFile {
  id: number;
  type: "image" | "video" | "document";
  url: string;
  file?: File;
  description: string;
}

// Define form values interface
interface BlotterFormValues {
  // Complainant fields
  complainantName: string;
  complainantContact: string;
  complainantAddress: string;

  // Accused fields
  accusedName: string;
  accusedContact: string;
  accusedAddress: string;

  // Other fields
  incidentDetails: string;
  incidentDate: string;
  incidentCategory: string;
  mediaDescription: string;
}

export function BlotterReport() {
  // State to manage uploaded media files
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    { id: 1, type: "image", url: sanRoqueLogo, description: "Image evidence" },
  ]);

  // State to track which video is currently being played
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);

  // Initialize form
  const form = useForm<BlotterFormValues>({
    defaultValues: {
      // Complainant default values
      complainantName: "",
      complainantContact: "",
      complainantAddress: "",

      // Accused default values
      accusedName: "",
      accusedContact: "",
      accusedAddress: "",

      // Other default values
      incidentDetails: "",
      incidentDate: "",
      incidentCategory: "",
      mediaDescription:
        "Photos of the incident site and video evidence submitted by the complainant on March 10, 2023.",
    },
  });

  // Create a ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler to open file dialog
  const handleAddMediaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handler for file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length > 0) {
      const newMediaFiles = selectedFiles.map((file, index) => {
        // Create URL for preview
        const previewUrl = URL.createObjectURL(file);

        // Determine if file is image or video
        const fileType = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
          ? "video"
          : "document";

        return {
          id: mediaFiles.length + index + 1,
          type: fileType as "image" | "video" | "document",
          url: previewUrl,
          file: file,
          description: file.name,
        };
      });

      setMediaFiles([...mediaFiles, ...newMediaFiles]);
    }

    // Reset input to allow selecting the same file again
    e.target.value = "";
  };

  // Handler to remove a media file
  const handleRemoveMedia = (id: number) => {
    setMediaFiles(mediaFiles.filter((media) => media.id !== id));
    if (activeVideoId === id) {
      setActiveVideoId(null);
    }
  };

  // Toggle video playback
  const toggleVideoPlayback = (id: number) => {
    setActiveVideoId(activeVideoId === id ? null : id);
  };

  // Form submission handler
  const onSubmit = (data: BlotterFormValues) => {
    console.log("Form submitted:", data);
    console.log("Media files:", mediaFiles);
    // Here you would typically send the data to your backend
  };

  // Get current date in YYYY-MM-DD format for max date attribute
  const currentDate = new Date().toISOString().split("T")[0];

  return (
    <div className="w-full h-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="flex flex-row mb-4 sm:mb-0">
          <div className="flex items-center mr-4">
            <Button className="text-black p-2 self-start" variant={"outline"}>
              <Link to={"/blotter-record"}>
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Complaint and Accused Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Complainant Card */}
            <div className="border rounded-md p-4 bg-white">
              <div>
                <h3 className="font-medium text-lg mb-2 text-darkBlue2 flex items-center gap-2">
                  Complainant
                </h3>
              </div>
              <div className="space-y-3">
                {/* Complainant Name */}
                <FormField
                  control={form.control}
                  name="complainantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-darkGray">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="font-medium"
                          placeholder="Enter Complaint Name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Complainant Contact */}
                <FormField
                  control={form.control}
                  name="complainantContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-darkGray">
                        Contact
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="font-medium"
                          placeholder="Contact Number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Complainant Address */}
                <FormField
                  control={form.control}
                  name="complainantAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-darkGray">
                        Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="font-medium"
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
                {/* Accused Name */}
                <FormField
                  control={form.control}
                  name="accusedName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-darkGray">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="font-medium"
                          placeholder="Enter Accused Name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Accused Contact */}
                <FormField
                  control={form.control}
                  name="accusedContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-darkGray">
                        Contact
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="font-medium"
                          placeholder="Contact Number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Accused Address */}
                <FormField
                  control={form.control}
                  name="accusedAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-darkGray">
                        Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="font-medium"
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

          {/* Incident Details Section */}
          <h1 className="font-medium text-lg text-darkBlue2">
            Incident Details
          </h1>
          <div className="mb-6">
            <div className="flex mb-4 flex-row mt-5">
              <FormField
                control={form.control}
                name="incidentCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-darkBlue2">
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
                        className="w-32 mr-4 text-darkGray"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="incidentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base text-darkBlue2">
                      Date of Incident
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          {...field}
                          className="font-sm pr-10 w-32"
                          placeholder="Select date"
                          max={currentDate}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="incidentDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-base text-darkBlue2">
                    Incident Description:
                  </FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-2 min-h-24"
                      placeholder="Enter incident details here..."
                      {...field}
                    ></textarea>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Supporting Documents section*/}
          <div className="mb-6">
            <h2 className="font-medium text-lg mb-2 text-darkBlue2">
              Supporting Documents
            </h2>

            {/* Media Gallery */}
            <div className="border border-gray-300 rounded-md p-4 bg-white">
              {/*Description */}
              <div className="mb-4">
                <h2 className="text-semibold text-gray-500/75 mb-1">
                  Description
                </h2>
                <p className="text-sm text-darkGray">
                  Photos of the incident site and video evidence submitted by
                  the complainant on March 10, 2023.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {mediaFiles.map((media) => (
                  <div key={media.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                      {media.type === "video" ? (
                        <div className="w-full h-full relative">
                          <video
                            src={media.url}
                            className="object-cover w-full h-full"
                            controls={activeVideoId === media.id}
                            muted={activeVideoId !== media.id}
                            onClick={() => toggleVideoPlayback(media.id)}
                          />
                          {activeVideoId !== media.id && (
                            <div
                              className="absolute inset-0 flex items-center justify-center cursor-pointer"
                              onClick={() => toggleVideoPlayback(media.id)}
                            >
                              <div className="bg-black bg-opacity-50 rounded-full p-2">
                                <Play size={40} className="text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <img
                          src={media.url}
                          alt={`Evidence ${media.id}`}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                      {media.type === "video" ? (
                        <Film size={16} className="text-gray-500" />
                      ) : (
                        <Image size={16} className="text-gray-500" />
                      )}
                    </div>

                    {/* Remove button and shows on hover */}
                    <button
                      onClick={() => handleRemoveMedia(media.id)}
                      className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove media"
                      type="button"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                {/* Upload new */}
                <div
                  onClick={handleAddMediaClick}
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                >
                  <Plus size={24} className="text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Add Media</p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <Link to={"/blotter-record"}>
              <Button type="button" className="mr-4">
                Cancel
              </Button>
            </Link>

            <Link to={""}>
              <Button type="submit" variant={"outline"}>
                Submit
              </Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
