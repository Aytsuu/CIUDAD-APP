"use client"

import { useParams, useNavigate } from "react-router"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { useBHWDailyNoteDetail } from "./queries/Fetch"
import { formatDate } from "@/helpers/dateHelper"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button/button"
import { ArrowLeft } from "lucide-react"

export default function BHWNoteView() {
   const { bhwdnId } = useParams<{ bhwdnId: string }>()
   const navigate = useNavigate()
   const noteId = bhwdnId ? parseInt(bhwdnId) : null

   const { data: noteData, isLoading, isError } = useBHWDailyNoteDetail(noteId)

   if (isLoading) {
      return (
         <LayoutWithBack
            title="BHW Note Details"
            description="View Barangay Health Worker daily note"
         >
            <div className="bg-white p-6 rounded-md shadow-md">
               <p className="text-center text-gray-600">Loading note details...</p>
            </div>
         </LayoutWithBack>
      )
   }

   if (isError || !noteData?.data) {
      return (
         <LayoutWithBack
            title="BHW Note Details"
            description="View Barangay Health Worker daily note"
         >
            <div className="bg-white p-6 rounded-md shadow-md">
               <p className="text-center text-red-600">Failed to load note details</p>
               <div className="flex justify-center mt-4">
                  <Button onClick={() => navigate(-1)}>
                     <ArrowLeft size={16} className="mr-2" /> Go Back
                  </Button>
               </div>
            </div>
         </LayoutWithBack>
      )
   }

   const note = noteData.data
   const bm = note.bm || {}
   const staffInfo = note.staff_info || {}
   const patientInfo = note.patient_info || {}
   const illnesses = note.illnesses || []

   return (
      <LayoutWithBack
         title="BHW Note Details"
         description="View Barangay Health Worker daily note"
      >
         <div className="bg-white p-6 rounded-md shadow-md w-full">
            <div className="p-4">
               <div className="flex justify-center">
                  <h3 className="py-3 font-bold text-lg">Barangay Health Worker Daily Note</h3>
               </div>
            </div>

            <div className="space-y-6">
               {/* Basic Information */}
               <div>
                  <Label className="text-md font-semibold">Basic Information</Label>
                  <Separator className="mt-2 mb-4"/>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-sm text-gray-600">Date Created</p>
                        <p className="font-medium">{formatDate(note.created_at, 'long')}</p>
                     </div>
                     <div>
                        <p className="text-sm text-gray-600">BHW Name</p>
                        <p className="font-medium">{staffInfo.name || 'N/A'}</p>
                     </div>
                     <div>
                        <p className="text-sm text-gray-600">Staff ID</p>
                        <p className="font-medium">{note.staff || 'N/A'}</p>
                     </div>
                     <div>
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="font-medium">{staffInfo.position || 'N/A'}</p>
                     </div>
                  </div>
                  {note.description && (
                     <div className="mt-4">
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="font-medium whitespace-pre-wrap">{note.description}</p>
                     </div>
                  )}
               </div>

               {/* Patient & Body Measurements */}
               {bm && (
                  <div>
                     <Label className="text-md font-semibold">Child Anthropometric Measurements</Label>
                     <Separator className="mt-2 mb-4"/>
                     <div className="grid grid-cols-4 gap-4">
                        <div>
                           <p className="text-sm text-gray-600">Patient ID</p>
                           <p className="font-medium">{bm.pat_id || patientInfo.pat_id || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm text-gray-600">Patient Name</p>
                           <p className="font-medium">{patientInfo.name || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm text-gray-600">Weight (kg)</p>
                           <p className="font-medium">{bm.weight || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm text-gray-600">Height (cm)</p>
                           <p className="font-medium">{bm.height || 'N/A'}</p>
                        </div>
                     </div>

                     {/* Age and Gender row */}
                     <div className="grid grid-cols-4 gap-4 mt-4">
                        <div>
                           <p className="text-sm text-gray-600">Age</p>
                           <p className="font-medium">{patientInfo.age || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm text-gray-600">Gender</p>
                           <p className="font-medium">{patientInfo.gender || 'N/A'}</p>
                        </div>
                     </div>

                     {/* Nutritional Status Indicators */}
                     <div className="grid grid-cols-5 gap-4 mt-4">
                        <div>
                           <p className="text-sm text-gray-600">MUAC</p>
                           <p className="font-medium">{bm.muac || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm text-gray-600">MUAC Status</p>
                           <p className="font-medium">{bm.muac_status || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm text-gray-600">Weight for Age (WFA)</p>
                           <p className="font-medium">{bm.wfa || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm text-gray-600">Length/Height for Age (LHFA)</p>
                           <p className="font-medium">{bm.lhfa || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-sm text-gray-600">Weight for Length/Height (WFL/WFH)</p>
                           <p className="font-medium">{bm.wfl || 'N/A'}</p>
                        </div>
                     </div>
                  </div>
               )}

               {/* Illnesses/Referrals */}
               {illnesses.length > 0 && (
                  <div>
                     <Label className="text-md font-semibold">Referrals/Follow-up Cases</Label>
                     <Separator className="mt-2 mb-4"/>
                     <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                           <thead className="bg-gray-50">
                              <tr>
                                 <th className="px-4 py-2 text-left text-sm font-semibold">Illness/Disease</th>
                                 <th className="px-4 py-2 text-left text-sm font-semibold">Count</th>
                              </tr>
                           </thead>
                           <tbody>
                              {illnesses.map((illness: any, idx: number) => (
                                 <tr key={idx} className="border-t">
                                    <td className="px-4 py-2">{illness.illnessName || 'N/A'}</td>
                                    <td className="px-4 py-2">{illness.count || 0}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               )}

               {/* Action Buttons */}
               {/* <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => navigate(-1)}>
                     <ArrowLeft size={16} className="mr-2" /> Back
                  </Button>
               </div> */}
            </div>
         </div>
      </LayoutWithBack>
   )
}
