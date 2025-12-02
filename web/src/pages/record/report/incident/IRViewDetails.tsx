import { Button } from "@/components/ui/button/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Clock4,
  CalendarDays,
  ImageOff,
  User,
  FileText,
} from "lucide-react";
import React from "react";
import { useLocation, useNavigate } from "react-router";
import { useLoading } from "@/context/LoadingContext";
import { MediaGallery } from "@/components/ui/media-gallery";
import { getDateTimeFormat } from "@/helpers/dateHelper";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useGetIRInfo } from "../queries/reportFetch";

const SEVERITY_LEVELS: Record<string, any> = {
  LOW: 'bg-green-100 border-green-400 text-green-700 hover:bg-green-100',
  MEDIUM: 'bg-amber-100 border-amber-400 text-amber-700 hover:bg-amber-100',
  HIGH: 'bg-red-100 border-red-400 text-red-700 hover:bg-red-100',
}

// Loading state component
const LoadingState = () => (
  <LayoutWithBack
    title="Incident Report Details"
    description="Review and manage the details of the reported incident."
  >
    <Card className="w-full p-10 bg-white shadow-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="md" />
        <div className="text-center">
          <Label className="text-lg font-medium text-gray-700">
            Loading incident details...
          </Label>
          <p className="text-sm text-gray-500 mt-1">
            Please wait while we retrieve the report information
          </p>
        </div>
      </div>
    </Card>
  </LayoutWithBack>
);
      
export default function IRViewDetails() {
  // ================ STATE INITIALIZATION ================
  const navigate = useNavigate();
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const { showLoading, hideLoading } = useLoading();
  const [mediaFiles, setMediaFiles] = React.useState<any[]>([]);
  const { data: IRInfo, isLoading } = useGetIRInfo(params?.ir_id);
  const images = IRInfo?.files || [];

  // ================ SIDE EFFECTS ================
  React.useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading]);

  React.useEffect(() => {
    if (IRInfo) {
      setMediaFiles(IRInfo?.files);
    }
  }, [IRInfo]);

  // ================ RENDER ================
  if(isLoading) {
    return <LoadingState />;
  }

  return (
    <LayoutWithBack
      title="Incident Report Details"
      description="Review and manage the details of the reported incident."
    >
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-4">
          <Label>Severity:</Label>
          <Badge className={`px-3 rounded-full ${SEVERITY_LEVELS[IRInfo?.ir_severity]}`}>
            {IRInfo?.ir_severity}
          </Badge>
        </div>
      </div>
      <div className="mx-auto space-y-4">
        {/* Main Content Area */}
        <div className="flex gap-4">
          <Card className="w-full flex flex-col bg-white p-10 gap-6">
            {/* Header Information Card */}
            <div className="bg-transparent border-none">
              <div className="flex justify-between gap-8">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Location
                    </Label>
                    <p className="text-sm font-semibold text-black/90 truncate">
                      {IRInfo?.ir_area}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Reported By
                    </Label>
                    <p className="text-sm font-semibold text-black/90 truncate">
                      {IRInfo?.ir_reported_by}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Date
                    </Label>
                    <p className="text-sm font-semibold text-black/90">
                      {IRInfo?.ir_date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock4 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Time
                    </Label>
                    <p className="text-sm font-semibold text-black/90">
                      {IRInfo?.ir_time}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Incident Details */}
            <div className="lg:col-span-2">
              <div className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div>
                    <p className="text-md text-gray-500">
                      Complete description of the reported incident
                    </p>
                  </div>
                </div>

                <div className="h-80">
                  <Textarea
                    className="w-full h-full resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-4 text-sm leading-relaxed"
                    value={IRInfo?.ir_add_details}
                    placeholder="Incident details will appear here..."
                    readOnly
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Image Upload Section */}
          <div className="w-1/2">
            <Card className="p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <Label className="text-lg font-semibold text-gray-900">
                    Evidence
                  </Label>
                  <p className="text-sm text-gray-500">
                    Supporting images or documents
                  </p>
                </div>
              </div>

              <div className="h-80 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 p-2">
                {images.length == 0 ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <ImageOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <Label className="text-lg font-medium text-gray-500">
                      No Evidence Uploaded
                    </Label>
                    <p className="text-sm text-gray-400 mt-2">
                      Images or documents would appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <MediaGallery mediaFiles={mediaFiles} />
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Label className="text-lg font-semibold text-gray-900">
                Actions
              </Label>
              <p className="text-sm text-gray-500">
                Manage this incident report
              </p>
            </div>
            <div className="flex flex-col items-center sm:flex-row gap-6 w-full sm:w-auto">
              <p className="text-sm text-gray-700">Received on {getDateTimeFormat(IRInfo?.ir_created_at)}</p>
              <Button
                onClick={() => {
                  navigate("/report/acknowledgement/form", {
                    state: {
                      params: {
                        data: IRInfo,
                      },
                    },
                  });
                }}
              >
                <FileText className="w-4 h-4" />
                Create Acknowledgement Report
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </LayoutWithBack>
  );
}