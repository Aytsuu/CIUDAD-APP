// import React, { useEffect, useCallback } from 'react';
// import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { User } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { Label } from '@/components/ui/label';
// import { usePatientsQuery, usePatients5yearsbelowQuery } from '@/pages/healthServices/restful-api-patient/FetchPatient';
// import { useToastContext } from '../ui/toast';

// export interface Patient {
//   pat_id: string;
//   pat_type: string;
//   name?: string;
//   trans_id?: string;
//   rp_id?: { rp_id?: string };
//   personal_info?: {
//     per_fname?: string;
//     per_mname?: string;
//     per_lname?: string;
//     per_dob?: string;
//     per_sex?: string;
//   };
//   households?: { hh_id: string }[];
//   address?: {
//     add_street?: string;
//     add_barangay?: string;
//     add_city?: string;
//     add_province?: string;
//     add_sitio?: string;
//     full_address?: string;
//   };
//   family?: {
//     fam_id: string;
//     fc_role: string;
//   };
//   family_head_info?: {
//     fam_id: string | null;
//     family_heads?: {
//       mother?: {
//         role?: string;
//         personal_info?: {
//           per_fname?: string | null;
//           per_mname?: string | null;
//           per_lname?: string | null;
//           per_dob?: string | null;
//           per_sex?: string | null;
//         };
//       };
//       father?: {
//         role?: string;
//         personal_info?: {
//           per_fname?: string | null;
//           per_mname?: string | null;
//           per_lname?: string | null;
//           per_dob?: string | null;
//           per_sex?: string | null;
//         };
//       };
//     };
//   };
//   spouse_info?: {
//     spouse_info?: {
//       spouse_fname?: string;
//       spouse_lname?: string;
//       spouse_mname?: string;
//       spouse_dob?: string;
//       spouse_occupation?: string;
//     };
//   };
// }

// interface PatientSearchProps {
//   onPatientSelect: (patient: Patient | null, patientId: string) => void;
//   className?: string;
//   value: string;
//   onChange: (id: string) => void;
//   ischildren?: boolean;
// }

// export function PatientSearch({
//   onPatientSelect,
//   className,
//   value,
//   onChange,
//   ischildren = false,
// }: PatientSearchProps) {
//   const router = useRouter();
//   const {
//     data: patientsData,
//     isLoading,
//     isError,
//     error,
//   } = usePatientsQuery();

//   const {
//     data: patients5YearsBelowData,
//     isLoading: isLoading5YearsBelow,
//     isError: isError5YearsBelow,
//     error: error5YearsBelow,
//   } = usePatients5yearsbelowQuery();
// const { toast } = useToastContext();
//   useEffect(() => {
//     if (isError) {
//       toast.show({
//         title: 'Error',
//         message: `Failed to load patients: ${(error as Error).message}`,
//         type: 'error',
//       });
//     }
//     if (isError5YearsBelow) {
//       toast.show({
//         title: 'Error',
//         message: `Failed to load children patients: ${(error5YearsBelow as Error).message}`,
//         type: 'error',
//       });
//     }
//   }, [isError, error, isError5YearsBelow, error5YearsBelow]);

//   const handlePatientSelection = useCallback(
//     (id: string) => {
//       onChange(id);
//       const dataSource = ischildren ? patients5YearsBelowData?.default : patientsData?.default;
//       const selectedPatient = dataSource?.find(
//         (patient: any) => patient.pat_id.toString() === id.split(',')[0].trim()
//       );
//       onPatientSelect(selectedPatient || null, id);
//     },
//     [patientsData?.default, patients5YearsBelowData?.default, onPatientSelect, onChange, ischildren]
//   );

//   const currentData = ischildren ? patients5YearsBelowData : patientsData;
//   const currentIsLoading = ischildren ? isLoading5YearsBelow : isLoading;
//   const currentEmptyMessage = ischildren ? 'No child patient found.' : 'No patient found.';

//   return (
//     <View className={`bg-white pb-4 ${className}`}>
//       <View className="flex-row items-center gap-3 mb-2">
//         <User size={16} color="#1E40AF" />
//         <Label className="text-base font-semibold text-blue-800">
//           {ischildren ? 'Select Child Patient' : 'Select Patient'}
//         </Label>
//       </View>

//       <Combobox
//         options={currentData?.formatted ?? []}
//         value={value}
//         onChange={handlePatientSelection}
//         placeholder={
//           currentIsLoading ? 'Loading patients...' : `Search and select ${ischildren ? 'a child' : 'a'} patient`
//         }
//         triggerClassName="font-normal w-full"
//         emptyMessage={
//           <View className="flex-col justify-center items-center">
//             <Label className="font-normal text-xs">
//               {currentIsLoading ? <ActivityIndicator size="small" /> : currentEmptyMessage}
//             </Label>
//             <TouchableOpacity onPress={() => router.push('/patient-records/new')}>
//               <Label className="font-normal text-xs text-teal-500 underline">
//                 Register New Patient
//               </Label>
//             </TouchableOpacity>
//           </View>
//         }
//       />
//     </View>
//   );
// }