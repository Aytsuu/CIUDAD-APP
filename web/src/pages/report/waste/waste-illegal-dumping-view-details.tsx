import { Button } from "@/components/ui/button/button";

interface WasteReportDetailsProps {
  rep_id: number;
  rep_image: string;
  rep_matter: string;
  rep_location: string;
  rep_add_details: string;
  rep_violator: string;
  rep_contact: string;
  rep_status: string;
  rep_date: string;
}

function WasteIllegalDumpingDetails({
  rep_id,
  rep_image,
  rep_matter,
  rep_location,
  rep_add_details,
  rep_violator,
  rep_date,
  rep_contact,
}: WasteReportDetailsProps) {
  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap justify-center">
            <span className="bg-gray text-sm text-black-100 px-3 py-1 rounded">
                {rep_matter}
            </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Image */}
        {rep_image && (
          <div className="lg:w-1/2">
            <img
              src={rep_image}
              alt="Report evidence"
              className="w-full rounded-md border"
            />
          </div>
        )}

        {/* Details */}
        <div className="lg:w-1/2 space-y-4 text-sm text-gray-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Sitio</p>
              <p>{rep_location}</p>
            </div>
            <div>
              <p className="font-semibold">Contact Number</p>
              <p>{rep_contact}</p>
            </div>
          </div>

          <div>
            <p className="font-semibold">Violator</p>
            <p>{rep_violator || "Unknown"}</p>
          </div>

          <div>
            <p className="font-semibold">Report Details</p>
            <p>{rep_add_details || "No additional details provided."}</p>
          </div>

          <div>
            <p className="font-semibold">Date and Time</p>
            <p>{rep_date}</p>
          </div>

          {/* Mark as Resolved Button */}
          <div className="flex mt-6 justify-center">
                <Button className="bg-green-100 text-green-800 px-4 py-2 rounded-md border border-green-500 hover:bg-green-200 hover:text-green-900">
                    ✓ Mark as Resolved
                </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WasteIllegalDumpingDetails;


