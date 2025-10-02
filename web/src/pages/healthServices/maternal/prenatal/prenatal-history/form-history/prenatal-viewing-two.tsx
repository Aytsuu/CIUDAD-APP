"use client"

import { useLocation } from "react-router";


import { usePrenatalPatientPrenatalCare } from "../../../queries/maternalFetchQueries"
import { Loader2 } from "lucide-react";


export default function PrenatalViewingTwo() {
   const location = useLocation()
   const { patientData, pregnancyId, visitNumber } = location.state?.params || {};

   const { data: prenatalCareData, isLoading } = usePrenatalPatientPrenatalCare(patientData?.pat_id || "", pregnancyId || "")
   
   // Limit the records to show based on visitNumber, similar to prenatalcare-history
   const recordsToShow = prenatalCareData?.prenatal_records?.slice(0, visitNumber) || [];
   
   console.log("Patient Data: ", patientData)
   console.log("Visit Number: ", visitNumber)
   console.log("Records to show: ", recordsToShow.length)

   // const {}


   if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="animate-spin h-8 w-8 mr-2">Loading records...</Loader2>
      </div>
    );
  }


   return (
      <div className="max-w-7xl mx-auto h-[128rem] overflow-hidden m-5 border border-gray-500">
         <div className="mx-10 my-5">
            <div>
               <p className="text-sm pb-5 mt-10">CEBU CITY HEALTH DEPARTMENT <br /> 2020</p>
            </div>

            <div className="border border-black h-[118rem]">
               <table className="table-auto w-full">
                  <thead>
                     <tr className="text-center">
                        <th className="border-r border-black p-2 text-sm">DATE</th>
                        <th className="border-r border-black p-2 text-sm">AOG</th>
                        <th className="border-r border-black p-2 text-sm">WT</th>
                        <th className="border-r border-black p-2 text-sm">BP</th>
                        <th className="border-r border-black p-2 text-sm">FINDINGS <br /> LEOPOLDS'S MANUEVER</th>
                        <th className="p-2 text-sm">NOTES <br /> (LAB RESULTS, COMPLAINTS, ADVISES)</th>
                     </tr>
                  </thead>
                  <tbody>
                     {recordsToShow && recordsToShow.length > 0 ? (
                        recordsToShow.flatMap((record: any) => 
                           record.prenatal_care_entries?.map((visit: any, index: number) => (
                              <tr key={`${record.pf_id}-${index}`}>
                                 <td className="border-b border-t border-r border-black p-2 text-sm">
                                    {visit.pfpc_date || '-'}
                                 </td>
                                 <td className="border-b border-t border-r border-black p-2 text-sm">
                                    {visit.pfpc_aog_wks && visit.pfpc_aog_days ? 
                                       `${visit.pfpc_aog_wks}w ${visit.pfpc_aog_days}d` : 
                                       visit.pfpc_aog_wks ? `${visit.pfpc_aog_wks}w` : '-'}
                                 </td>
                                 <td className="border-b border-t border-r border-black p-2 text-sm">
                                    {visit.weight || '-'}
                                 </td>
                                 <td className="border-b border-t border-r border-black p-2 text-sm">
                                    {visit.bp_systolic && visit.bp_diastolic ? 
                                       `${visit.bp_systolic}/${visit.bp_diastolic}` : '-'}
                                 </td>
                                 <td className="border-b border-t border-r border-black p-2 text-sm">
                                    <div>
                                       {visit.pfpc_fundal_ht && (
                                          <div>Fundal Height: {visit.pfpc_fundal_ht}</div>
                                       )}
                                       {visit.pfpc_fetal_hr && (
                                          <div>Fetal Heart Rate: {visit.pfpc_fetal_hr} bpm</div>
                                       )}
                                       {visit.pfpc_fetal_pos && (
                                          <div>Fetal Position: {visit.pfpc_fetal_pos}</div>
                                       )}
                                       {!visit.pfpc_fundal_ht && !visit.pfpc_fetal_hr && !visit.pfpc_fetal_pos && '-'}
                                    </div>
                                 </td>
                                 <td className="border-b border-t border-black p-2 text-sm">
                                    <div>
                                       {visit.pfpc_complaints && (
                                          <div><strong>Complaints:</strong> {visit.pfpc_complaints}</div>
                                       )}
                                       {visit.pfpc_advises && (
                                          <div><strong>Advises:</strong> {visit.pfpc_advises}</div>
                                       )}
                                       {!visit.pfpc_complaints && !visit.pfpc_advises && '-'}
                                    </div>
                                 </td>
                              </tr>
                           )) || []
                        )
                     ) : (
                        <tr>
                           <td className="border border-black p-2 text-sm text-center" colSpan={6}>
                              No prenatal care visits recorded
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
        </div>
      </div>
   )
}