import type { RemarkSuppDoc } from "./summon-types";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { CircleAlert } from "lucide-react";
import { MediaGallery } from "@/components/ui/media-gallery";

export default function SummonRemarksView({
  rem_remarks, 
  rem_date, 
  supp_docs
}: {
  rem_remarks: string;
  rem_date: string;
  supp_docs: RemarkSuppDoc[];
}) {

  const mediaFiles = supp_docs?.map((doc) => ({
    id: doc.rsd_id,
    url: doc.rsd_url,
    type: 'image' as const,
    name: doc.rsd_name,
  })) || [];

  return (
    <div className="space-y-6 p-6 max-h-[calc(90vh-100px)] overflow-y-auto h-full">
      {/* Supporting Documents Gallery - First Section */}
      {mediaFiles.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Supporting Images</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {mediaFiles.length} {mediaFiles.length === 1 ? 'image' : 'images'}
            </span>
          </div>
          
          {/* Use MediaGallery component */}
          <MediaGallery mediaFiles={mediaFiles}
          />
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <CircleAlert className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-500">No supporting images attached</p>
        </div>
      )}

      {/* Remarks Content - Second Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Remarks</h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[100px]">
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {rem_remarks || (
                <span className="text-gray-500 italic">No remarks provided.</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Date - Last Section */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
            Date of Remark
          </p>
          <p className="text-sm font-medium text-gray-800">
            {formatTimestamp(new Date(rem_date))}
          </p>
        </div>
      </div>
    </div>
  );
}