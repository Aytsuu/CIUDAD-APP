import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, MapPin, FileText, Users, UserX, Clock, AlertTriangle, ChevronDown, ChevronUp} from "lucide-react";
import { useGetComplaintDetails } from "./queries/summonFetchQueries";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function ComplaintRecordForSummon({ comp_id}: {
  comp_id: string;
}) {
  const { data: complaintDetails, isLoading, error } = useGetComplaintDetails(comp_id);
  const [openSections, setOpenSections] = useState({
    complainants: true,
    accused: true,
    files: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !complaintDetails) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{(error as Error)?.message || "Complaint not found"}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-h-[calc(90vh-100px)] overflow-y-auto h-full p-4 bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-white to-blue-50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Complaint #{complaintDetails.comp_id}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-sm text-gray-900">
                  {complaintDetails.comp_location || "Location not specified"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100 shadow-sm">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarDays className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Incident Date</p>
                <p className="text-sm text-gray-900">
                  {formatTimestamp(complaintDetails.comp_datetime)}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100 shadow-sm">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Filed Date</p>
                <p className="text-sm text-gray-900">
                  {formatTimestamp(complaintDetails.comp_created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-100 shadow-sm">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Incident Type</p>
                <p className="text-sm text-gray-900 font-medium">
                  {complaintDetails.comp_incident_type}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allegation */}
      <Card className="bg-gradient-to-r from-white to-amber-50 border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-amber-900 pb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
            Allegation Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
            <p className="text-sm leading-relaxed text-gray-800">
              {complaintDetails.comp_allegation || "No allegation details provided"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Complainants */}
      <Card className="bg-gradient-to-r from-white to-emerald-50 border-l-4 border-l-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300">
        <Collapsible
          open={openSections.complainants}
          onOpenChange={(open) =>
            setOpenSections((prev) => ({ ...prev, complainants: open }))
          }
        >
          <CardHeader>
            <CollapsibleTrigger className="flex items-center justify-between w-full pb-4 group">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-emerald-900">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                Complainant{complaintDetails.complainant?.length > 1 ? "s" : ""} (
                {complaintDetails.complainant?.length || 0})
              </CardTitle>
              <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                {openSections.complainants ? (
                  <ChevronUp className="h-5 w-5 text-emerald-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-emerald-600" />
                )}
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {complaintDetails.complainant && complaintDetails.complainant.length > 0 ? (
                complaintDetails.complainant.map((complainant: any, index: number) => (
                  <div
                    key={complainant.cpnt_id || index}
                    className="border-2 border-emerald-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {index > 0 && <Separator className="mb-4 border-emerald-100" />}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-lg text-emerald-900 mb-3">
                          {complainant.cpnt_name || "Unnamed Complainant"}
                        </h4>
                        <div className="space-y-2">
                          {complainant.cpnt_age && (
                            <p className="text-sm text-gray-700">
                              <strong>Age:</strong> {complainant.cpnt_age}
                            </p>
                          )}
                          {complainant.cpnt_gender && (
                            <p className="text-sm text-gray-700">
                              <strong>Gender:</strong> {complainant.cpnt_gender}
                            </p>
                          )}
                          {complainant.cpnt_number && (
                            <p className="text-sm text-gray-700">
                              <strong>Contact:</strong> {complainant.cpnt_number}
                            </p>
                          )}
                          {complainant.cpnt_relation_to_respondent && (
                            <p className="text-sm text-gray-700">
                              <strong>Relation:</strong>{" "}
                              {complainant.cpnt_relation_to_respondent}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                        <h5 className="font-semibold text-sm text-emerald-800 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Address
                        </h5>
                        <p className="text-sm text-gray-700">
                          {complainant.cpnt_address || "Address not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-emerald-50 rounded-lg border-2 border-dashed border-emerald-200">
                  <Users className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                  <p className="text-emerald-700 font-medium">No complainants listed</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Accused Persons */}
      <Card className="bg-gradient-to-r from-white to-red-50 border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-all duration-300">
        <Collapsible
          open={openSections.accused}
          onOpenChange={(open) =>
            setOpenSections((prev) => ({ ...prev, accused: open }))
          }
        >
          <CardHeader>
            <CollapsibleTrigger className="flex items-center justify-between w-full pb-4 group">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-red-900">
                <div className="p-2 bg-red-100 rounded-lg">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
                Accused Person{complaintDetails.accused?.length > 1 ? "s" : ""} (
                {complaintDetails.accused?.length || 0})
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                {openSections.accused ? (
                  <ChevronUp className="h-5 w-5 text-red-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-red-600" />
                )}
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {complaintDetails.accused && complaintDetails.accused.length > 0 ? (
                complaintDetails.accused.map((accused: any, index: number) => (
                  <div
                    key={accused.acsd_id || index}
                    className="border-2 border-red-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {index > 0 && <Separator className="mb-4 border-red-100" />}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-lg text-red-900 mb-3">
                          {accused.acsd_name || "Unnamed Accused"}
                        </h4>
                        <div className="space-y-2 mb-3">
                          {accused.acsd_age && (
                            <p className="text-sm text-gray-700">
                              <strong>Age:</strong> {accused.acsd_age}
                            </p>
                          )}
                          {accused.acsd_gender && (
                            <p className="text-sm text-gray-700">
                              <strong>Gender:</strong> {accused.acsd_gender}
                            </p>
                          )}
                        </div>
                        {accused.acsd_description && (
                          <div className="mt-3">
                            <h5 className="font-semibold text-sm text-red-800 mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Description
                            </h5>
                            <p className="text-sm text-gray-700 bg-red-50 rounded-lg p-3 border border-red-100">
                              {accused.acsd_description}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h5 className="font-semibold text-sm text-red-800 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Address
                        </h5>
                        <p className="text-sm text-gray-700">
                          {accused.acsd_address || "Address not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-red-50 rounded-lg border-2 border-dashed border-red-200">
                  <UserX className="h-12 w-12 text-red-300 mx-auto mb-3" />
                  <p className="text-red-700 font-medium">No accused persons listed</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Attached Files */}
      {complaintDetails.complaint_files &&
        complaintDetails.complaint_files.length > 0 && (
          <Card className="bg-gradient-to-r from-white to-purple-50 border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-all duration-300">
            <Collapsible
              open={openSections.files}
              onOpenChange={(open) =>
                setOpenSections((prev) => ({ ...prev, files: open }))
              }
            >
              <CardHeader>
                <CollapsibleTrigger className="flex items-center justify-between w-full group">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-purple-900">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    Attached Files ({complaintDetails.complaint_files.length})
                  </CardTitle>
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    {openSections.files ? (
                      <ChevronUp className="h-5 w-5 text-purple-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {complaintDetails.complaint_files.map((file: any) => (
                      <div
                        key={file.comp_file_id}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 group"
                      >
                        <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800 truncate">
                            {file.comp_file_name || "Unnamed file"}
                          </p>
                          {file.comp_file_type && (
                            <p className="text-xs text-purple-600 font-medium mt-1">
                              {file.comp_file_type}
                            </p>
                          )}
                          {file.comp_file_url && (
                            <a
                              href={file.comp_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors duration-200 inline-block mt-2"
                            >
                              View File
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}
    </div>
  );
}
