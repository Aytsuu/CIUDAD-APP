// import React, { useState } from "react";
// import { 
//   TouchableOpacity, 
//   View, 
//   Text, 
//   ScrollView, 
//   Alert 
// } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import {
//   ChevronLeft,
//   Calendar,
//   MapPin,
//   User,
//   Users,
//   FileText,
//   Clock,
//   Hash,
//   Gavel,
//   AlertCircle,
//   Heart,
//   Phone,
//   Mail,
//   Home,
// } from "lucide-react-native";
// import PageLayout from "@/screens/_PageLayout";

// // Type Definitions
// interface ResidentProfile {
//   full_name?: string;
//   first_name?: string;
//   middle_name?: string;
//   last_name?: string;
//   address?: string;
//   contact_number?: string;
//   email?: string;
// }

// interface PersonType {
//   res_profile?: ResidentProfile;
//   cpnt_name?: string;
//   cpnt_gender?: string;
//   cpnt_address?: string;
//   cpnt_relation_to_respondent?: string;
//   cpnt_number?: string | number;
//   cpnt_id?: string | number;
//   cpnt_contact?: string;
//   acsd_name?: string;
//   acsd_address?: string;
//   acsd_age?: string;
//   acsd_gender?: string;
//   acsd_description?: string;
//   acsd_id?: string | number;
//   acsd_contact?: string;
//   rp_id?: string | number;
// }

// interface ComplaintFile {
//   file_name?: string;
//   file_type?: string;
//   file_url?: string;
//   uploaded_at?: string;
//   file_id?: string | number;
// }

// interface ComplaintData {
//   comp_id?: string | number;
//   comp_incident_type?: string;
//   comp_status?: string;
//   comp_location?: string;
//   comp_datetime?: string;
//   comp_created_at?: string;
//   comp_allegation?: string;
//   complainant?: PersonType[];
//   accused_persons?: PersonType[];
//   complaint_files?: ComplaintFile[];
// }

// interface InfoRowProps {
//   icon: React.ComponentType<{ size?: number | string; className?: string }>;
//   label: string;
//   value?: string | number;
//   valueClass?: string;
// }

// interface PersonCardProps {
//   person: PersonType;
//   type?: string;
// }

// interface TabButtonProps {
//   title: string;
//   isActive: boolean;
//   onPress: () => void;
//   count?: number;
// }

// interface FileCardProps {
//   file: ComplaintFile;
//   index: number;
// }

// type ComplaintStatus = 'pending' | 'filed' | 'under investigation' | 'resolved' | 'closed';

// export default function ComplaintViewRequest(): JSX.Element {
//   const router = useRouter();
//   const { complaint } = useLocalSearchParams<{ complaint: string }>();
  
//   // State
//   const [activeComplainantTab, setActiveComplainantTab] = useState<number>(0);
//   const [activeAccusedTab, setActiveAccusedTab] = useState<number>(0);
//   const [isRequestingSummon, setIsRequestingSummon] = useState<boolean>(false);

//   // Parse complaint data
//   const data: ComplaintData | null = complaint ? JSON.parse(complaint) : null;

//   // Utility Functions
//   const formatDateTime = (dateString?: string): string => {
//     if (!dateString) return "Not specified";
//     try {
//       const date = new Date(dateString);
//       return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
//     } catch {
//       return dateString;
//     }
//   };

//   const getStatusColor = (status?: string): string => {
//     if (!status) return "text-gray-600 bg-gray-50 border-gray-200";
    
//     switch (status.toLowerCase() as ComplaintStatus) {
//       case "pending":
//         return "text-amber-600 bg-amber-50 border-amber-200";
//       case "filed":
//         return "text-blue-600 bg-blue-50 border-blue-200";
//       case "under investigation":
//         return "text-purple-600 bg-purple-50 border-purple-200";
//       case "resolved":
//         return "text-green-600 bg-green-50 border-green-200";
//       case "closed":
//         return "text-gray-600 bg-gray-50 border-gray-200";
//       default:
//         return "text-gray-600 bg-gray-50 border-gray-200";
//     }
//   };

//   const getStatusIcon = (status?: string): JSX.Element => {
//     if (!status) return <FileText size={16} className="text-gray-600" />;
    
//     switch (status.toLowerCase() as ComplaintStatus) {
//       case "pending":
//         return <Clock size={16} className="text-amber-600" />;
//       case "filed":
//         return <FileText size={16} className="text-blue-600" />;
//       case "under investigation":
//         return <AlertCircle size={16} className="text-purple-600" />;
//       case "resolved":
//         return <FileText size={16} className="text-green-600" />;
//       default:
//         return <FileText size={16} className="text-gray-600" />;
//     }
//   };

//   // Helper function to check if summon can be requested
//   const canRequestSummon = (status?: string): boolean => {
//     return status?.toLowerCase() === 'filed';
//   };
//   const handleRequestSummon = async (): Promise<void> => {
//     if (!data?.comp_id) return;

//     try {
//       setIsRequestingSummon(true);
      
//       const response = await fetch(`/api/complaints/${data.comp_id}/request-summon`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           complaint_id: data.comp_id,
//           request_type: 'summon',
//           timestamp: new Date().toISOString(),
//         }),
//       });

//       if (response.ok) {
//         Alert.alert(
//           "Summon Requested",
//           "The summon request has been successfully submitted. You will be notified of the proceedings.",
//           [{ text: "OK", style: "default" }]
//         );
//       } else {
//         throw new Error('Failed to request summon');
//       }
//     } catch (error) {
//       Alert.alert(
//         "Request Failed",
//         "Unable to submit summon request. Please try again later.",
//         [{ text: "OK", style: "default" }]
//       );
//     } finally {
//       setIsRequestingSummon(false);
//     }
//   };

//   // Component Definitions
//   const InfoRow: React.FC<InfoRowProps> = ({
//     icon: Icon,
//     label,
//     value,
//     valueClass = "text-gray-900",
//   }) => (
//     <View className="mb-4">
//       <View className="flex-row items-center mb-1">
//         <Icon size={16} className="text-gray-500 mr-2" />
//         <Text className="text-xs font-medium text-gray-500 uppercase">
//           {label}
//         </Text>
//       </View>
//       <Text className={`text-sm ml-6 ${valueClass}`}>
//         {value?.toString() || "Not specified"}
//       </Text>
//     </View>
//   );

//   const TabButton: React.FC<TabButtonProps> = ({ 
//     title, 
//     isActive, 
//     onPress, 
//     count = 0 
//   }) => (
//     <TouchableOpacity
//       onPress={onPress}
//       className={`px-4 py-2 rounded-full mr-2 ${
//         isActive ? 'bg-blue-500' : 'bg-gray-100'
//       }`}
//     >
//       <Text className={`font-medium text-sm ${
//         isActive ? 'text-white' : 'text-gray-600'
//       }`}>
//         {title} {count > 0 && `(${count})`}
//       </Text>
//     </TouchableOpacity>
//   );

//   const PersonCard: React.FC<PersonCardProps> = ({ person, type = "person" }) => {
//     const displayName = person.res_profile?.full_name || 
//                        person.cpnt_name || 
//                        person.acsd_name || 
//                        "Unknown";
    
//     const displayAddress = person.res_profile?.address || 
//                           person.cpnt_address || 
//                           person.acsd_address;
    
//     const displayContact = person.res_profile?.contact_number || 
//                           person.cpnt_contact || 
//                           person.acsd_contact;

//     return (
//       <View className="bg-white rounded-lg border border-gray-200 p-4">
//         {/* Header */}
//         <View className="flex-row items-center mb-4">
//           <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
//             <User size={20} className="text-blue-600" />
//           </View>
//           <View className="flex-1">
//             <Text className="font-semibold text-gray-900">{displayName}</Text>
//             {person.res_profile && (
//               <Text className="text-xs text-green-600">Registered Resident</Text>
//             )}
//           </View>
//         </View>

//         {/* Details */}
//         <View className="space-y-2">
//           {/* Basic Info */}
//           {person.res_profile?.first_name && (
//             <InfoRow icon={User} label="First Name" value={person.res_profile.first_name} />
//           )}
//           {person.res_profile?.middle_name && (
//             <InfoRow icon={User} label="Middle Name" value={person.res_profile.middle_name} />
//           )}
//           {person.res_profile?.last_name && (
//             <InfoRow icon={User} label="Last Name" value={person.res_profile.last_name} />
//           )}
          
//           {/* Gender */}
//           {(person.cpnt_gender || person.acsd_gender) && (
//             <InfoRow 
//               icon={User} 
//               label="Gender" 
//               value={person.cpnt_gender || person.acsd_gender} 
//             />
//           )}
          
//           {/* Age */}
//           {person.acsd_age && (
//             <InfoRow icon={User} label="Age" value={person.acsd_age} />
//           )}
          
//           {displayAddress && (
//             <InfoRow icon={Home} label="Address" value={displayAddress} />
//           )}
//           {displayContact && (
//             <InfoRow icon={Phone} label="Contact" value={displayContact} />
//           )}
//           {person.res_profile?.email && (
//             <InfoRow icon={Mail} label="Email" value={person.res_profile.email} />
//           )}
          
//           {/* Description */}
//           {person.acsd_description && (
//             <InfoRow 
//               icon={FileText} 
//               label="Description" 
//               value={person.acsd_description}
//               valueClass="text-gray-700"
//             />
//           )}
          
//           {person.cpnt_relation_to_respondent && (
//             <InfoRow 
//               icon={Heart} 
//               label="Relationship" 
//               value={person.cpnt_relation_to_respondent}
//               valueClass="text-purple-600"
//             />
//           )}
          
//           {/* Contact Number (separate from contact) */}
//           {(person.cpnt_number) && (
//             <InfoRow 
//               icon={Phone} 
//               label="Contact Number" 
//               value={person.cpnt_number} 
//             />
//           )}
          
//           {/* IDs */}
//           {person.rp_id && (
//             <InfoRow 
//               icon={Hash} 
//               label="Resident Profile ID" 
//               value={person.rp_id} 
//             />
//           )}
//           {(person.cpnt_id || person.acsd_id) && (
//             <InfoRow 
//               icon={Hash} 
//               label={`${type} ID`} 
//               value={person.cpnt_id || person.acsd_id} 
//             />
//           )}
//         </View>
//       </View>
//     );
//   };

//   const FileCard: React.FC<FileCardProps> = ({ file, index }) => (
//     <View className="bg-gray-50 rounded-lg p-4 mb-3">
//       <View className="flex-row items-center mb-3">
//         <FileText size={20} className="text-blue-600 mr-2" />
//         <Text className="font-medium text-gray-900">File {index + 1}</Text>
//       </View>
      
//       <View className="space-y-2">
//         {file.file_name && (
//           <InfoRow icon={FileText} label="Name" value={file.file_name} />
//         )}
//         {file.file_type && (
//           <InfoRow icon={FileText} label="Type" value={file.file_type} />
//         )}
//         {file.file_url && (
//           <InfoRow 
//             icon={FileText} 
//             label="URL" 
//             value={file.file_url}
//             valueClass="text-blue-600"
//           />
//         )}
//         {file.uploaded_at && (
//           <InfoRow 
//             icon={Clock} 
//             label="Uploaded" 
//             value={formatDateTime(file.uploaded_at)} 
//           />
//         )}
//       </View>
//     </View>
//   );

//   // Render Error State
//   if (!data) {
//     return (
//       <PageLayout
//         leftAction={
//           <TouchableOpacity
//             onPress={() => router.back()}
//             className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
//           >
//             <ChevronLeft size={20} className="text-gray-600" />
//           </TouchableOpacity>
//         }
//         headerTitle={<Text className="text-gray-900 font-medium">Complaint Details</Text>}
//         rightAction={<View className="w-10 h-10" />}
//       >
//         <View className="flex-1 justify-center items-center">
//           <AlertCircle size={48} className="text-gray-400 mb-4" />
//           <Text className="text-gray-500 text-center">No complaint data available</Text>
//         </View>
//       </PageLayout>
//     );
//   }

//   // Main Render
//   return (
//     <PageLayout
//       leftAction={
//         <TouchableOpacity
//           onPress={() => router.back()}
//           className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
//         >
//           <ChevronLeft size={20} className="text-gray-600" />
//         </TouchableOpacity>
//       }
//       headerTitle={<Text className="text-gray-900 font-medium">Complaint Details</Text>}
//       rightAction={<View className="w-10 h-10" />}
//     >
//       <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
//         <View className="p-4 space-y-6">
//           {/* Header Section */}
//           <View className="bg-white rounded-lg border border-gray-200 p-6">
//             <View className="mb-4">
//               <Text className="text-xl font-bold text-gray-900 mb-2">
//                 {data.comp_incident_type || "Incident"}
//               </Text>
              
//               <View className="flex-row items-center mb-3">
//                 {getStatusIcon(data.comp_status)}
//                 <View className={`ml-2 px-3 py-1 rounded-full border ${getStatusColor(data.comp_status)}`}>
//                   <Text className={`text-xs font-medium ${getStatusColor(data.comp_status).split(' ')[0]}`}>
//                     {data.comp_status || "Unknown Status"}
//                   </Text>
//                 </View>
//               </View>

//               {data.comp_id && (
//                 <Text className="text-sm text-gray-500">ID: {data.comp_id}</Text>
//               )}
//             </View>

//             {/* Summon Button - Only show if status is 'filed' */}
//             {canRequestSummon(data.comp_status) && (
//               <TouchableOpacity
//                 onPress={handleRequestSummon}
//                 disabled={isRequestingSummon}
//                 className={`bg-red-500 rounded-lg p-4 flex-row items-center justify-center ${
//                   isRequestingSummon ? 'opacity-50' : ''
//                 }`}
//               >
//                 <Gavel size={20} className="text-white mr-2" />
//                 <Text className="text-white font-semibold">
//                   {isRequestingSummon ? "Requesting..." : "Request Summon"}
//                 </Text>
//               </TouchableOpacity>
//             )}

//             {/* Status Messages */}
//             {data.comp_status?.toLowerCase() === "pending" && (
//               <View className="bg-amber-50 border border-amber-200 rounded-lg p-3">
//                 <Text className="text-amber-700 text-sm text-center">
//                   Complaint is still pending review. Summon request will be available once filed.
//                 </Text>
//               </View>
//             )}

//             {data.comp_status?.toLowerCase() === "resolved" && (
//               <View className="bg-gray-50 border border-gray-200 rounded-lg p-3">
//                 <Text className="text-gray-600 text-sm text-center">
//                   Summon request unavailable for resolved complaints
//                 </Text>
//               </View>
//             )}

//             {data.comp_status?.toLowerCase() === "closed" && (
//               <View className="bg-gray-50 border border-gray-200 rounded-lg p-3">
//                 <Text className="text-gray-600 text-sm text-center">
//                   Summon request unavailable for closed complaints
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* Complaint Details */}
//           <View className="bg-white rounded-lg border border-gray-200 p-6">
//             <Text className="text-lg font-semibold text-gray-900 mb-4">Details</Text>
            
//             <View className="space-y-3">
//               <InfoRow icon={MapPin} label="Location" value={data.comp_location} />
//               <InfoRow 
//                 icon={Calendar} 
//                 label="Incident Date" 
//                 value={formatDateTime(data.comp_datetime)} 
//               />
//               <InfoRow 
//                 icon={Clock} 
//                 label="Filed Date" 
//                 value={formatDateTime(data.comp_created_at)} 
//               />
//             </View>

//             {data.comp_allegation && (
//               <View className="mt-4 pt-4 border-t border-gray-100">
//                 <Text className="text-sm font-medium text-gray-500 mb-2">
//                   ALLEGATION
//                 </Text>
//                 <Text className="text-sm text-gray-900 leading-relaxed">
//                   {data.comp_allegation}
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* Complainants Section */}
//           <View className="bg-white rounded-lg border border-gray-200 p-6">
//             <View className="flex-row items-center mb-4">
//               <Users size={20} className="text-gray-600 mr-2" />
//               <Text className="text-lg font-semibold text-gray-900">
//                 Complainants ({data.complainant?.length || 0})
//               </Text>
//             </View>

//             {data.complainant?.length ? (
//               <>
//                 {data.complainant.length > 1 && (
//                   <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
//                     <View className="flex-row">
//                       {data.complainant.map((_, index) => (
//                         <TabButton
//                           key={index}
//                           title={`Person ${index + 1}`}
//                           isActive={activeComplainantTab === index}
//                           onPress={() => setActiveComplainantTab(index)}
//                         />
//                       ))}
//                     </View>
//                   </ScrollView>
//                 )}
//                 <PersonCard 
//                   person={data.complainant[activeComplainantTab]} 
//                   type="Complainant" 
//                 />
//               </>
//             ) : (
//               <View className="py-8 items-center">
//                 <Users size={32} className="text-gray-300 mb-2" />
//                 <Text className="text-gray-500">No complainants listed</Text>
//               </View>
//             )}
//           </View>

//           {/* Accused Persons Section */}
//           <View className="bg-white rounded-lg border border-gray-200 p-6">
//             <View className="flex-row items-center mb-4">
//               <Users size={20} className="text-gray-600 mr-2" />
//               <Text className="text-lg font-semibold text-gray-900">
//                 Accused Persons ({data.accused_persons?.length || 0})
//               </Text>
//             </View>

//             {data.accused_persons?.length ? (
//               <>
//                 {data.accused_persons.length > 1 && (
//                   <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
//                     <View className="flex-row">
//                       {data.accused_persons.map((_, index) => (
//                         <TabButton
//                           key={index}
//                           title={`Person ${index + 1}`}
//                           isActive={activeAccusedTab === index}
//                           onPress={() => setActiveAccusedTab(index)}
//                         />
//                       ))}
//                     </View>
//                   </ScrollView>
//                 )}
//                 <PersonCard 
//                   person={data.accused_persons[activeAccusedTab]} 
//                   type="Accused" 
//                 />
//               </>
//             ) : (
//               <View className="py-8 items-center">
//                 <Users size={32} className="text-gray-300 mb-2" />
//                 <Text className="text-gray-500">No accused persons listed</Text>
//               </View>
//             )}
//           </View>

//           {/* Files Section */}
//           <View className="bg-white rounded-lg border border-gray-200 p-6">
//             <View className="flex-row items-center mb-4">
//               <FileText size={20} className="text-gray-600 mr-2" />
//               <Text className="text-lg font-semibold text-gray-900">
//                 Files ({data.complaint_files?.length || 0})
//               </Text>
//             </View>

//             {data.complaint_files?.length ? (
//               data.complaint_files.map((file, index) => (
//                 <FileCard key={index} file={file} index={index} />
//               ))
//             ) : (
//               <View className="py-8 items-center">
//                 <FileText size={32} className="text-gray-300 mb-2" />
//                 <Text className="text-gray-500">No files attached</Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </ScrollView>
//     </PageLayout>
//   );
// }