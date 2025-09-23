// import { ChevronLeft, Loader2 } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useMemo, useState } from "react";
// import { PatientInfoCard } from "@/components/ui/patientInfoCard";
// import { Button } from "@/components/ui/button";
// import { CurrentVaccination } from "../../../../components/ui/current-vaccination";
// import { VaccinationHistoryRecord } from "@/components/ui/vaccination-history";
// import { VaccinationRecord } from "../tables/columns/types";
// import { useLocation } from "react-router-dom";
// import CardLayout from "@/components/ui/card/card-layout";
// import {
//   useIndivPatientVaccinationRecords,
//   useUnvaccinatedVaccines,
//   useFollowupVaccines,
// } from "../queries/fetch";
// import { updateVaccinationHistory } from "../restful-api/update";
// import { toast } from "sonner";
// import { useQueryClient } from "@tanstack/react-query";
// import { updateFollowUpVisit } from "../restful-api/update";
// import { usePatientVaccinationDetails } from "../queries/fetch";
// import { FollowUpsCard } from "@/components/ui/ch-vac-followup";
// import { VaccinationStatusCards } from "@/components/ui/vaccination-status";
// import { VaccinationStatusCardsSkeleton } from "../../skeleton/vaccinationstatus-skeleton";

// export default function ScheduledVaccine() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const { Vaccination, patientData } = location.state || {};
//   const queryClient = useQueryClient();

//   const patientId = patientData?.pat_id;
//   console.log("Patient ID:", patientId);
//   console.log("Vaccination Data:", Vaccination);
//   console.log("Patient Data:", patientData);
//   console.log("Vaccine Type:", Vaccination?.vaccination_type);

//   const { data: unvaccinatedVaccines = [], isLoading: isUnvaccinatedLoading } =
//     useUnvaccinatedVaccines(patientId, patientData.personal_info.per_dob);
//   const { data: followupVaccines = [], isLoading: isFollowVaccineLoading } =
//     useFollowupVaccines(patientId);
//   const {
//     data: vaccinationHistory = [],
//     isLoading: isVachistLoading,
//     error,
//   } = useIndivPatientVaccinationRecords(patientId);
//   const { data: vaccinations = [], isLoading: isCompleteVaccineLoading } = usePatientVaccinationDetails(patientData?.pat_id);
//   const isLoading =
//     isUnvaccinatedLoading ||
//     isFollowVaccineLoading ||
//     isVachistLoading ||
//     isCompleteVaccineLoading;

//   const currentVaccination = useMemo(() => {
//     return vaccinationHistory.find(
//       (history: VaccinationRecord) =>
//         history.vachist_id === Vaccination?.vachist_id
//     );
//   }, [vaccinationHistory, Vaccination]);

//   const previousVaccination = useMemo(() => {
//     if (!vaccinationHistory.length || !Vaccination?.created_at) return null;

//     // For routine vaccinations, just get the most recent vaccination
//     if (Vaccination.vaccination_type?.toLowerCase() === "routine") {
//       const sortedHistory = [...vaccinationHistory].sort(
//         (a, b) =>
//           new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//       );
//       // Return the most recent one that's not the current vaccination
//       return (
//         sortedHistory.find(
//           (history) => history.vachist_id !== Vaccination.vachist_id
//         ) || null
//       );
//     }
//     // Original logic for non-routine vaccinations
//     const sortedHistory = [...vaccinationHistory].sort(
//       (a, b) =>
//         new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//     );

//     const currentIndex = sortedHistory.findIndex(
//       (history) => history.vachist_id === Vaccination.vachist_id
//     );

//     return currentIndex > 0 ? sortedHistory[currentIndex - 1] : null;
//   }, [vaccinationHistory, Vaccination]);

//   console.log("Previous Vaccination Data:", previousVaccination);

//   const relevantHistory = useMemo(() => {
//     if (!Vaccination?.created_at) return [];
//     return vaccinationHistory.filter(
//       (history: VaccinationRecord) =>
//         new Date(history.created_at) <= new Date(Vaccination.created_at)
//     );
//   }, [vaccinationHistory, Vaccination]);

//   //
//   if (!patientData || !Vaccination) {
//     return (
//       <div className="w-full h-full flex items-center justify-center">
//         <p className="text-xl text-gray-600">No vaccination data found.</p>
//       </div>
//     );
//   }

//   const submit = async () => {
//     setIsSubmitting(true);
//     try {
//       console.log("Previous Vaccination Data:", previousVaccination);
//       if (previousVaccination?.follow_up_visit) {
//         updateFollowUpVisit({
//           followv_id: String(previousVaccination.follow_up_visit.followv_id),
//           followv_status: "completed",
//           completed_at: new Date().toISOString().split("T")[0], // Format to YYYY-MM-DD
//         });

//         console.log(
//           "Updated follow-up visit status to completed for previous vaccination",
//           previousVaccination.follow_up_visit.followv_id
//         );
//       }
//       await updateVaccinationHistory({vachist_id:Vaccination.vachist_id, vachist_status:"completed"});

//       queryClient.invalidateQueries({
//         queryKey: ["patientVaccinationRecords", patientId],
//       });
//       queryClient.invalidateQueries({ queryKey: ["vaccinationRecords"] });

//       toast.success("Vaccination marked as completed successfully.");
//       navigate(-1);
//     } catch (error) {
//       toast.error("Failed to update vaccination status.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <>
//       <div className="flex items-center gap-4 mb-4 sm:mb-6">
//         <Button
//           className="text-darkGray p-2"
//           variant="outline"
//           onClick={() => navigate(-1)}
//         >
//           <ChevronLeft className="h-4 w-4" />
//         </Button>
//         <div>
//           <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
//             Vaccination Record
//           </h1>
//           <p className="text-xs sm:text-sm text-darkGray">
//             View vaccination details and patient information
//           </p>
//         </div>
//       </div>
//       <hr className="border-gray mb-4 sm:mb-6" />

//       <div className="mb-4">
//         <PatientInfoCard patient={patientData} />
//       </div>

//       {isLoading ? (
//         <VaccinationStatusCardsSkeleton />
//       ) : (
//         <CardLayout
//           cardClassName="mb-6"
//           content={
//             <div className="flex flex-col lg:flex-row gap-6">
//               <div className="w-full">
//                 <VaccinationStatusCards
//                   unvaccinatedVaccines={unvaccinatedVaccines}
//                   vaccinations={vaccinations}
//                 />
//               </div>

//               <div className="w-full">
//                 <FollowUpsCard followupVaccines={followupVaccines} />
//               </div>
//             </div>
//           }
//         />
//       )}
//       <CardLayout
//         content={
//           <>
//             <div>
//               {currentVaccination && (
//                 <CurrentVaccination currentVaccination={currentVaccination} />
//               )}

//               <VaccinationHistoryRecord
//                 relevantHistory={relevantHistory}
//                 currentVaccinationId={Vaccination?.vachist_id}
//                 loading={isLoading}
//                 error={error?.message}
//               />
//             </div>

//             <div className="flex justify-end mt-6">
//               <Button type="submit" onClick={submit} disabled={isSubmitting}>
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Processing...
//                   </>
//                 ) : (
//                   "Done Administered"
//                 )}
//               </Button>
//             </div>
//           </>
//         }
//       />
//     </>
//   );
// }
