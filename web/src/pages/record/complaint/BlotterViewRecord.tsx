import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { BsChevronLeft } from "react-icons/bs";
import { Link, useLocation } from "react-router-dom";
import { BlotterRecord } from "./blotter-type";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import DialogLayout from "@/components/ui/dialog/dialog-layout";

export function BlotterViewRecord() {
  const { state } = useLocation();
  const blotterData = state?.blotter as BlotterRecord;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRaiseIssue = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Issue raised successfully", {
        description: `Blotter ID: ${blotterData.id}`,
        action: {
          label: "View",
          onClick: () => console.log("View action clicked"),
        },
      });
    } catch (error) {
      toast.error("Failed to raise issue", {
        description: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
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
              Blotter Record Details
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Case No: {blotterData.id || "N/A"}
            </p>
            <p className="text-xs sm:text-sm text-darkGray">
              Date Filed:{" "}
              {new Date(blotterData.bc_datetime).toLocaleDateString() || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <DialogLayout
            trigger={
              <Button className="bg-red-600 hover:bg-red-700">
                Raise Issue
              </Button>
            }
            title="Confirm Issue Raising"
            description="Are you sure you want to raise an issue for this blotter report?"
            mainContent={
              <>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Blotter ID:{" "}
                    <span className="font-medium">{blotterData.id}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    This action will notify the concerned authorities about
                    unresolved issues.
                  </p>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitting(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleRaiseIssue}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Confirm"}
                  </Button>
                </div>
              </>
            }
          />
        </div>
      </div>

      <hr className="border-gray mb-6 sm:mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Complainant Card */}
        <div className="border rounded-md p-4 bg-white">
          <h3 className="font-medium text-lg mb-2 text-darkBlue2">
            Complainant
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-darkGray">Full Name</p>
              <p className="text-base">{blotterData.bc_complainant || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-darkGray">Address</p>
              <p className="text-base">
                {blotterData.bc_cmplnt_address || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Accused Card */}
        <div className="border rounded-md p-4 bg-white">
          <h3 className="font-medium text-lg mb-2 text-darkBlue2">Accused</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-darkGray">Full Name</p>
              <p className="text-base">{blotterData.bc_accused || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-darkGray">Address</p>
              <p className="text-base">
                {blotterData.bc_accused_address || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Details */}
      <div className="border rounded-md p-4 bg-white mb-6">
        <h1 className="font-medium text-lg text-darkBlue2 mb-4">
          Incident Details
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-darkGray">Category</p>
            <p className="text-base">{blotterData.bc_incident_type || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-darkGray">Date of Incident</p>
            <p className="text-base">
              {blotterData.bc_datetime
                ? new Date(blotterData.bc_datetime).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-darkGray">Incident Description</p>
          <p className="text-base whitespace-pre-line">
            {blotterData.bc_allegation || "N/A"}
          </p>
        </div>
      </div>

      {/* Supporting Documents Section */}
      {blotterData.media && blotterData.media.length > 0 ? (
        <div className="border rounded-md p-4 bg-white mb-6">
          <h2 className="font-medium text-lg mb-4 text-darkBlue2">
            Supporting Documents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {blotterData.media.map((media, index) => {
              const mediaUrl = media.url.startsWith("http")
                ? media.url
                : `https://isxckceeyjcwvjipndfd.supabase.co/storage/v1/object/public/${media.storage_path}`;

              return (
                <div
                  key={media.id}
                  className="border rounded-md p-2 flex flex-col"
                >
                  {media.file_type.startsWith("image/") ? (
                    <img
                      src={mediaUrl}
                      alt={media.file_name || `Evidence ${index + 1}`}
                      className="w-full h-40 object-cover mb-2 rounded-md"
                      onError={(e) => {
                        console.error("Failed to load image:", mediaUrl);
                        e.currentTarget.src = "/fallback-image.jpg";
                      }}
                    />
                  ) : media.file_type.startsWith("video/") ? (
                    <div className="relative w-full h-40 mb-2">
                      <video
                        controls
                        className="w-full h-full object-cover rounded-md"
                        poster="/video-thumbnail.jpg"
                      >
                        <source src={mediaUrl} type={media.file_type} />
                        Your browser does not support videos
                      </video>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 bg-gray-100 mb-2 rounded-md">
                      <FileText className="w-12 h-12 text-gray-400" />
                      <span className="mt-2 text-xs text-gray-500">
                        Document
                      </span>
                    </div>
                  )}
                  <p className="text-xs truncate px-2 text-center">
                    {media.file_name || `Evidence ${index + 1}`}
                  </p>
                  <a
                    href={mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline mt-1 text-center"
                  >
                    Open Fullscreen
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border rounded-md p-4 bg-white mb-6">
          <p className="text-gray-500 text-center">
            No supporting documents attached
          </p>
        </div>
      )}
    </div>
  );
}
