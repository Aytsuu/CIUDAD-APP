import { Button } from "@/components/ui/button/button";
import { Image, Film, Plus, X, ArrowUp, Play } from "lucide-react";
import { BsChevronLeft } from "react-icons/bs";
import { useState, useRef, ChangeEvent } from "react";
import sanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";
import { Link } from "react-router";

// Define types for our media files
interface MediaFile {
  id: number;
  type: "image" | "video" | "document";
  url: string;
  file?: File;
  description: string;
}

export function BlotterViewRecord() {
  // State to manage uploaded media files
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    { id: 1, type: "image", url: sanRoqueLogo, description: "Image evidence" },
    // You can add a sample video here for testing
  ]);

  // State to track which video is currently being played
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);

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

  return (
    <div className="p-4 w-full h-full">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
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
              Vandalism
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">D3312TH899033190</p>
            <p className="text-xs sm:text-sm text-darkGray">
              March 09, 2023 12:23
            </p>
          </div>
        </div>
        <Link to={""}>
          <Button
            variant="destructive"
          >
            <ArrowUp className="mr-1" />
            Raise Issue
          </Button>
        </Link>
      </header>

      <hr className="mb-6" />

      {/* Complaint and Accused Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border rounded-md p-4 bg-white">
          <div>
            <h3 className="font-medium text-lg mb-2 text-darkBlue2 flex items-center gap-2">
              Complainant
            </h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">Juan Dela Cruz</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              <p className="font-medium">09123456789</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">
                123 Main St., Barangay Example, City
              </p>
            </div>
          </div>
        </div>

        <div className="border rounded-md p-4 bg-white">
          <h3 className="font-medium text-lg mb-2 text-darkBlue2">Accused</h3>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">Pedro Penduko</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              <p className="font-medium">09987654321</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">
                456 Second St., Barangay Sample, City
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Details Section */}
      <div className="mb-6">
        <h2 className="font-medium text-lg mb-2 text-darkBlue2">
          Incident Details
        </h2>
        <div className="w-full border border-gray-300 rounded-md p-4 min-h-24 bg-white">
          <p>gikuan ni kuan ang kuan niya ako a pud gikuan tas iya sad gikuan niya mao to nakuan ang di angay ma kuan</p>
        </div>
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
            <p className="text-semibold text-gray-500 mb-1">Description</p>
            <p className="text-sm">
              Photos of the incident site and video evidence submitted by the
              complainant on March 10, 2023.
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
                          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-20"
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
                  type="button"
                  className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove media"
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
    </div>
  );
}