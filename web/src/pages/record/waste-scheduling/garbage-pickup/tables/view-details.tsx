import { Label } from "@/components/ui/label"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, MapPin, User, FileText, Trash2, CircleCheck } from "lucide-react"
import { formatTime } from "@/helpers/timeFormatter"


export default function ViewGarbageRequestDetails({
  garb_id,
  garb_requester,
  garb_location,
  sitio_name,
  garb_created_at,
  garb_pref_time,
  garb_pref_date,
  garb_additional_notes,
  file_url,
  garb_waste_type,
  rejection_reason,
  dec_date
}: {
  garb_id: string
  garb_requester: string
  garb_location: string
  sitio_name: string
  garb_created_at: string
  garb_pref_date?: string
  garb_pref_time?: string
  garb_additional_notes?: string
  file_url: string
  garb_waste_type: string;
  rejection_reason?: string;
  dec_date?: string;
}) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      <div className="grid grid-cols-1  gap-6">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <FileText className="w-5 h-5 text-blue-600" />
              Request Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-600">Requester</Label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-900">{garb_requester}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-600">Location</Label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="font-semibold text-slate-900">{sitio_name}</p>
                  <p className="text-sm text-slate-600">{garb_location}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-slate-600">Waste Type</Label>
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 p-2">
                    <Trash2 className="w-4 h-4 mr-2" />
                    {garb_waste_type}
                </Badge>            
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-600">Request Created</Label>
              <p className="text-sm text-slate-700 font-medium">{formatTimestamp(garb_created_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
              Preferred Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-600">Preferred Date</Label>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <CalendarDays className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-900">{garb_pref_date}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-600">Preferred Time</Label>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-900">{formatTime(garb_pref_time || '')}</span>
              </div>
            </div>

            {garb_additional_notes && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">Additional Notes</Label>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <p className="text-sm text-slate-700 leading-relaxed">{garb_additional_notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {file_url && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-100">
            <CardTitle className="text-slate-900">Attached Image</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={file_url || "/placeholder.svg"}
                alt="Garbage collection request image"
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
