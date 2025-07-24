// Import necessary components and icons
import { Button } from "@/components/ui/button/button";
import { Card } from "@/components/ui/card/card";
import { Label } from "@/components/ui/label";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  MessageSquareWarning,
  Clock4,
  CalendarDays,
  Trash,
  ImageOff,
  FileText,
  User,
} from "lucide-react";
import React from "react";
import { useLocation, useNavigate } from "react-router";

// Main component for the DRR Report Form
export default function IRFormLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const data = React.useMemo(() => params?.data, [params]);
  console.log(data)
  return (
    <LayoutWithBack 
      title="Incident Report Details" 
      description="Review and manage the complete details of the reported incident."
    >
      <div className="mx-auto space-y-2">
        {/* Header Information Card */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 bg-blue/10 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-buttonBlue" />
              </div>
              <div className="min-w-0 flex-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</Label>
                <p className="text-sm font-semibold text-black/90 truncate">{
                  `Sitio ${data?.ir_sitio}, ${data?.ir_street}`
                }</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reported By</Label>
                <p className="text-sm font-semibold text-black/90 truncate">{data?.ir_reported_by}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</Label>
                <p className="text-sm font-semibold text-black/90">{data?.ir_date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock4 className="w-5 h-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time</Label>
                <p className="text-sm font-semibold text-black/90">{data?.ir_time}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          
          {/* Incident Details */}
          <div className="lg:col-span-2">
            <Card className="p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <Label className="text-lg font-semibold text-gray-900">Incident Details</Label>
                  <p className="text-sm text-gray-500">Complete description of the reported incident</p>
                </div>
              </div>
              
              <div className="h-80">
                <Textarea 
                  className="w-full h-full resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-4 text-sm leading-relaxed"
                  value={data?.ir_add_details}
                  placeholder="Incident details will appear here..."
                  readOnly
                />
              </div>
            </Card>
          </div>

          {/* Image Upload Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageOff className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <Label className="text-lg font-semibold text-gray-900">Evidence</Label>
                  <p className="text-sm text-gray-500">Supporting images or documents</p>
                </div>
              </div>
              
              <div className="h-80 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                <div className="text-center">
                  <ImageOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <Label className="text-lg font-medium text-gray-500">No Evidence Uploaded</Label>
                  <p className="text-sm text-gray-400 mt-2">Images or documents would appear here</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Label className="text-lg font-semibold text-gray-900">Actions</Label>
              <p className="text-sm text-gray-500">Manage this incident report</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                variant="destructive" 
                className="flex items-center gap-2 px-6 py-2 w-full sm:w-auto"
              >
                <Trash className="w-4 h-4" />
                Delete Report
              </Button>
              
              <Button 
                variant="outline"
                className="flex items-center gap-2 px-6 py-2 w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => {
                  navigate('/report/acknowledgement/form', {
                    state: {
                      params: {
                        data
                      }
                    }
                  })
                }}
              >
                <MessageSquareWarning className="w-4 h-4" />
                Create Acknowledgement Report
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </LayoutWithBack>
  );
}