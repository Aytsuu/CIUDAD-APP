// import React from 'react';
// import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
// import { X } from "lucide-react-native";
// import { Button } from '@/components/ui/button';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import _ScreenLayout from '@/screens/_ScreenLayout';
// // import DialogLayout from "@/components/ui/dialog/dialog-layout";
// // import WasteReportResolved from "./waste-illegal-dumping-update";
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { ChevronLeft } from 'lucide-react-native';

// export default function WasteIllegalDumpingDetails() {
//   // Get all params from the route
//   const params = useLocalSearchParams();
//   const router = useRouter();
  
//   // Parse all params
//   const {
//     rep_id,
//     rep_matter,
//     rep_location,
//     rep_add_details,
//     rep_violator,
//     rep_complainant,
//     rep_contact,
//     rep_status,
//     rep_date,
//     rep_date_resolved,
//     rep_resolved_img,
//     sitio_name,
//     waste_report_file
//   } = params;

//   // Parse the waste_report_file array
//   const parsedFiles = waste_report_file ? JSON.parse(waste_report_file as string) : [];

//   const isResolved = !!rep_date_resolved || rep_status === "resolved";

//   const getStatusStyle = () => {
//     switch (String(rep_status)?.toLowerCase()) {
//       case 'pending':
//         return 'bg-orange-100 text-orange-800 border-orange-500';
//       case 'resolved':
//         return 'bg-green-100 text-green-800 border-green-500';
//       default:
//         return 'bg-gray-100 text-gray-800 border-gray-500';
//     }
//   };

//   const formatDate = (dateString: string) => {
//     if (!dateString) return "N/A";
    
//     const date = new Date(dateString);
//     const options: Intl.DateTimeFormatOptions = {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     };
    
//     return date.toLocaleString('en-US', options);
//   };

//   return (
//     <_ScreenLayout
//       headerBetweenAction={<Text className="text-[18px] font-semibold">Report Details</Text>}
//       showExitButton={true}
//       showBackButton={false}
//       customRightAction={
//         <TouchableOpacity onPress={() => router.back()}>
//             <X size={16} className="text-black" />
//         </TouchableOpacity>
//       }

//       footer={

//         <TouchableOpacity
//             disabled={isResolved}
//             onPress={() => router.push({
//                 pathname: "/",
//                 params: { rep_id: String(rep_id) }
//             })}
//             className={`py-3 rounded-md border self-center w-full items-center ${
//                 isResolved
//                 ? "bg-gray-200"
//                 : "bg-green-100 border-green-500"
//             }`}
//         >
//             <Text className={`text-md ${
//                 isResolved ? "text-gray-500" : "text-green-800"
//             }`}>
//                 ✓ Mark as Resolved
//             </Text>
//         </TouchableOpacity>
//       }

//       stickyFooter={true}
//     >
//       <ScrollView className="p-4 pb-8">
//         {/* Header */}
//         <View className="items-center pb-10">
//           <View className="bg-gray-100 px-3 py-2 rounded-md">
//             <Text className="text-gray-800 text-center">{rep_matter}</Text>
//           </View>
//         </View>

//         {/* Body */}
//         <View className="flex-col">
//           {/* Images Container */}
//           <View className="w-full mb-4">
//             {/* Original Report Image */}
//             {parsedFiles[0]?.wrf_url && (
//                 <View className="relative mb-4">
//                     <Image
//                         source={{ uri: parsedFiles[0].wrf_url }}
//                         className="w-full aspect-video bg-gray-100 rounded-md border border-gray-100"
//                         resizeMode="cover"
//                     />
//                     <Text className="absolute top-2 left-2 bg-white/80 px-2 py-0.5 text-[14px] font-medium text-gray-700 rounded">
//                         Report Evidence
//                     </Text>
//                 </View>
//             )}
            
//             {/* Resolved Image - only show if exists */}
//             {rep_resolved_img && (
//                 <View className="relative">
//                     <Image
//                         source={{ uri: String(rep_resolved_img) }}
//                         className="w-full aspect-video bg-gray-100 rounded-md"
//                         resizeMode="cover"
//                     />
//                     <Text className="absolute top-2 left-2 bg-white/80 px-2 py-0.5 text-[14px] font-medium text-gray-700 rounded">
//                         Resolution Evidence
//                     </Text>
//                 </View>
//             )}
//           </View>

//           {/* Details Container */}
//           <View className="w-full">
//             <View className="flex-1">
//               <View className="flex-row justify-between mb-4">
//                 <View className="w-[48%]">
//                   <Text className="font-semibold text-gray-600 mb-1">Sitio</Text>
//                   <Text>{sitio_name}</Text>
//                 </View>
//                 <View className="w-[48%]">
//                   <Text className="font-semibold text-gray-600 mb-1">Location</Text>
//                   <Text>{rep_location}</Text>
//                 </View>
//               </View>

//               <View className="flex-row justify-between mb-4">
//                 <View className="w-[48%]">
//                   <Text className="font-semibold text-gray-600 mb-1">Contact Number</Text>
//                   <Text>{rep_contact}</Text>
//                 </View>
//                 <View className="w-[48%]">
//                   <Text className="font-semibold text-gray-600 mb-1">Violator</Text>
//                   <Text>{rep_violator || "Unknown"}</Text>
//                 </View>
//               </View>

//               <View className="flex-row justify-between mb-4">
//                 <View className="w-[48%]">
//                   <Text className="font-semibold text-gray-600 mb-1">Date and Time</Text>
//                   <Text>{formatDate(rep_date as string)}</Text>
//                 </View>
//                 <View className="w-[48%]">
//                   <Text className="font-semibold text-gray-600 mb-1">Report Status</Text>
//                   <View className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle()}`}>
//                     <Text>{rep_status || "No status provided"}</Text>
//                   </View>      
//                 </View>
//               </View>

//               {rep_date_resolved && (
//                 <View className="mb-4">
//                   <Text className="font-semibold text-gray-600 mb-1">Date & Time Resolved</Text>
//                   <Text>{formatDate(rep_date_resolved as string)}</Text>              
//                 </View>
//               )}

//               <View className="mb-4">
//                 <Text className="font-semibold text-gray-600 mb-1">Report Details</Text>
//                 <Text>{rep_add_details || "No additional details provided."}</Text>
//               </View>
//             </View>

//           </View>
//         </View>
//       </ScrollView>
//     </_ScreenLayout>
//   );
// }






//WITH MODAL PERO BATI
// import React, { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { View, Text, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
// import { X } from "lucide-react-native";
// import { Button } from '@/components/ui/button';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';
// import MultiImageUploader, {MediaFileType} from '@/components/ui/multi-media-upload';
// import _ScreenLayout from '@/screens/_ScreenLayout';
// // import DialogLayout from "@/components/ui/dialog/dialog-layout";
// // import WasteReportResolved from "./waste-illegal-dumping-update";
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { ChevronLeft } from 'lucide-react-native';

// export default function WasteIllegalDumpingDetails() {
//   // Get all params from the route
//   const params = useLocalSearchParams();
//   const router = useRouter();
  
//   // Parse all params
//   const {
//     rep_id,
//     rep_matter,
//     rep_location,
//     rep_add_details,
//     rep_violator,
//     rep_complainant,
//     rep_contact,
//     rep_status,
//     rep_date,
//     rep_date_resolved,
//     rep_resolved_img,
//     sitio_name,
//     waste_report_file
//   } = params;

//   // Parse the waste_report_file array
//   const parsedFiles = waste_report_file ? JSON.parse(waste_report_file as string) : [];

//   const [resolutionFiles, setResolutionFiles] = useState<MediaFileType[]>([]);
//   const [showResolutionModal, setShowResolutionModal] = useState(false);
//   const { setValue } = useForm();


//   useEffect(() => {
//     if (resolutionFiles.length > 0) {
//       setValue('rep_resolved_img', resolutionFiles[0].publicUrl || resolutionFiles[0].uri);
//     }
//   }, [resolutionFiles, setValue]);


//   const isResolved = !!rep_date_resolved || rep_status === "resolved";

//   const getStatusStyle = () => {
//     switch (String(rep_status)?.toLowerCase()) {
//       case 'pending':
//         return 'bg-orange-100 text-orange-800 border-orange-500';
//       case 'resolved':
//         return 'bg-green-100 text-green-800 border-green-500';
//       default:
//         return 'bg-gray-100 text-gray-800 border-gray-500';
//     }
//   };

//   const formatDate = (dateString: string) => {
//     if (!dateString) return "N/A";
    
//     const date = new Date(dateString);
//     const options: Intl.DateTimeFormatOptions = {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     };
    
//     return date.toLocaleString('en-US', options);
//   };


//   const handleMarkResolved = () => {
//     setShowResolutionModal(true);
//   };

//  const handleSubmitResolution = () => {
//     // Here you would typically submit the resolution data to your backend
//     // including the resolutionFiles array
//     setShowResolutionModal(false);
//     router.back(); // Or navigate to another screen
//   };

//   return (
//     <>
//       <_ScreenLayout
//         headerBetweenAction={<Text className="text-[18px] font-semibold">Report Details</Text>}
//         showExitButton={true}
//         showBackButton={false}
//         customRightAction={
//           <TouchableOpacity onPress={() => router.back()}>
//             <X size={16} className="text-black" />
//           </TouchableOpacity>
//         }
//         footer={
//           <TouchableOpacity
//             disabled={isResolved}
//             onPress={handleMarkResolved}
//             className={`py-3 rounded-md border self-center w-full items-center ${
//               isResolved
//               ? "bg-gray-200"
//               : "bg-green-100 border-green-500"
//             }`}
//           >
//             <Text className={`text-md ${
//               isResolved ? "text-gray-500" : "text-green-800"
//             }`}>
//               ✓ Mark as Resolved
//             </Text>
//           </TouchableOpacity>
//         }
//         stickyFooter={true}
//       >
//         <ScrollView className="p-4 pb-8">
//           {/* Header */}
//           <View className="items-center pb-10">
//             <View className="bg-gray-100 px-3 py-2 rounded-md">
//               <Text className="text-gray-800 text-center">{rep_matter}</Text>
//             </View>
//           </View>

//           {/* Body */}
//           <View className="flex-col">
//             {/* Images Container */}
//             <View className="w-full mb-4">
//               {/* Original Report Image */}
//               {parsedFiles[0]?.wrf_url && (
//                 <View className="relative mb-4">
//                   <Image
//                     source={{ uri: parsedFiles[0].wrf_url }}
//                     className="w-full aspect-video bg-gray-100 rounded-md border border-gray-100"
//                     resizeMode="cover"
//                   />
//                   <Text className="absolute top-2 left-2 bg-white/80 px-2 py-0.5 text-[14px] font-medium text-gray-700 rounded">
//                     Report Evidence
//                   </Text>
//                 </View>
//               )}
              
//               {/* Resolved Image - only show if exists */}
//               {rep_resolved_img && (
//                 <View className="relative">
//                   <Image
//                     source={{ uri: String(rep_resolved_img) }}
//                     className="w-full aspect-video bg-gray-100 rounded-md"
//                     resizeMode="cover"
//                   />
//                   <Text className="absolute top-2 left-2 bg-white/80 px-2 py-0.5 text-[14px] font-medium text-gray-700 rounded">
//                     Resolution Evidence
//                   </Text>
//                 </View>
//               )}
//             </View>

//             {/* Details Container */}
//             <View className="w-full">
//               <View className="flex-1">
//                 <View className="flex-row justify-between mb-4">
//                   <View className="w-[48%]">
//                     <Text className="font-semibold text-gray-600 mb-1">Sitio</Text>
//                     <Text>{sitio_name}</Text>
//                   </View>
//                   <View className="w-[48%]">
//                     <Text className="font-semibold text-gray-600 mb-1">Location</Text>
//                     <Text>{rep_location}</Text>
//                   </View>
//                 </View>

//                 <View className="flex-row justify-between mb-4">
//                   <View className="w-[48%]">
//                     <Text className="font-semibold text-gray-600 mb-1">Contact Number</Text>
//                     <Text>{rep_contact}</Text>
//                   </View>
//                   <View className="w-[48%]">
//                     <Text className="font-semibold text-gray-600 mb-1">Violator</Text>
//                     <Text>{rep_violator || "Unknown"}</Text>
//                   </View>
//                 </View>

//                 <View className="flex-row justify-between mb-4">
//                   <View className="w-[48%]">
//                     <Text className="font-semibold text-gray-600 mb-1">Date and Time</Text>
//                     <Text>{formatDate(rep_date as string)}</Text>
//                   </View>
//                   <View className="w-[48%]">
//                     <Text className="font-semibold text-gray-600 mb-1">Report Status</Text>
//                     <View className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle()}`}>
//                       <Text>{rep_status || "No status provided"}</Text>
//                     </View>      
//                   </View>
//                 </View>

//                 {rep_date_resolved && (
//                   <View className="mb-4">
//                     <Text className="font-semibold text-gray-600 mb-1">Date & Time Resolved</Text>
//                     <Text>{formatDate(rep_date_resolved as string)}</Text>              
//                   </View>
//                 )}

//                 <View className="mb-4">
//                   <Text className="font-semibold text-gray-600 mb-1">Report Details</Text>
//                   <Text>{rep_add_details || "No additional details provided."}</Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//         </ScrollView>
//       </_ScreenLayout>

//       {/* Resolution Modal */}
//       <Modal
//         visible={showResolutionModal}
//         animationType="slide"
//         onRequestClose={() => setShowResolutionModal(false)}
//       >
//         <_ScreenLayout
//           headerBetweenAction={<Text className="text-[18px] font-semibold">Add Resolution</Text>}
//           showExitButton={true}
//           showBackButton={false}
//           customRightAction={
//             <TouchableOpacity onPress={() => setShowResolutionModal(false)}>
//               <X size={16} className="text-black" />
//             </TouchableOpacity>
//           }
//           footer={
//             <TouchableOpacity
//               onPress={handleSubmitResolution}
//               className="py-3 rounded-md bg-primaryBlue self-center w-full items-center"
//               disabled={resolutionFiles.length === 0}
//             >
//               <Text className="text-white text-md">
//                 Submit Resolution
//               </Text>
//             </TouchableOpacity>
//           }
//           stickyFooter={true}
//         >
//           <ScrollView className="p-4 pb-8">
//             <View className="mb-4">
//               <Text className="text-[12px] font-PoppinsRegular pb-1">
//                 Add photo evidence of resolution
//               </Text>
//               <MultiImageUploader
//                 mediaFiles={resolutionFiles}
//                 setMediaFiles={setResolutionFiles}
//                 maxFiles={1}
//                 hideRemoveButton={false}
//               />
//             </View>

//             <View className="mb-4">
//               <Text className="text-[12px] font-PoppinsRegular pb-1">
//                 Additional notes (optional)
//               </Text>
//               {/* You would add a TextInput here for additional notes */}
//             </View>
//           </ScrollView>
//         </_ScreenLayout>
//       </Modal>
//     </>

//   );
// }





import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { X } from "lucide-react-native";
import MultiImageUploader, {MediaFileType} from '@/components/ui/multi-media-upload';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import _ScreenLayout from '@/screens/_ScreenLayout';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUpdateWasteReport } from '../queries/illegal-dump-update-queries';


export default function WasteIllegalDumpingDetails() {
  // Get all params from the route
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Parse all params
  const {
    rep_id,
    rep_matter,
    rep_location,
    rep_add_details,
    rep_violator,
    rep_complainant,
    rep_contact,
    rep_status,
    rep_date,
    rep_date_resolved,
    rep_resolved_img,
    sitio_name,
    waste_report_file
  } = params;

  // Parse the waste_report_file array
  const parsedFiles = waste_report_file ? JSON.parse(waste_report_file as string) : [];

  const [resolutionFiles, setResolutionFiles] = useState<MediaFileType[]>([]);
  const [showResolutionModal, setShowResolutionModal] = useState(false);


  const isResolved = !!rep_date_resolved || rep_status === "resolved";

  const getStatusStyle = () => {
    switch (String(rep_status)?.toLowerCase()) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleString('en-US', options);
  };
  
  //UPDATE MUTATION
//   const { mutate: updateRep } = useUpdateWasteReport(Number(rep_id));
    const { mutate: updateRep } = useUpdateWasteReport(Number(rep_id), () => {
        router.back();
    });


  const handleMarkResolved = () => {
    setShowResolutionModal(true);
  };


    const handleSubmitResolution = () => {
        if (resolutionFiles.length === 0) return; // Safety check
        
        const updateData = {
            rep_status: "resolved",
            rep_resolved_img: resolutionFiles[0].publicUrl || resolutionFiles[0].uri,
            rep_date_resolved: new Date().toISOString()
        };
        
        updateRep(updateData);
        console.log("UPDATE REPORT: ", updateData)

        setShowResolutionModal(false);
    };


  return (
    <>
      <_ScreenLayout
        headerBetweenAction={<Text className="text-[18px] font-semibold">Report Details</Text>}
        showExitButton={true}
        showBackButton={false}
        customRightAction={
          <TouchableOpacity onPress={() => router.back()}>
            <X size={16} className="text-black" />
          </TouchableOpacity>
        }
        footer={
          <TouchableOpacity
            disabled={isResolved}
            onPress={handleMarkResolved}
            className={`py-3 rounded-md border self-center w-full items-center ${
              isResolved
              ? "bg-gray-50 border-gray-200" 
              : "bg-green-100 border-green-500"
            }`}
          >
            <Text className={`text-md ${
              isResolved ? "text-gray-500" : "text-green-800"
            }`}>
              ✓ Mark as Resolved
            </Text>
          </TouchableOpacity>
        }
        stickyFooter={true}
      >
        <ScrollView className="p-4 pb-8">
          {/* Header */}
          <View className="items-center pb-10">
            <View className="bg-gray-100 px-3 py-2 rounded-md">
              <Text className="text-gray-800 text-center">{rep_matter}</Text>
            </View>
          </View>

          {/* Body */}
          <View className="flex-col">
            {/* Images Container */}
            <View className="w-full mb-4">
              {/* Original Report Image */}
              {parsedFiles[0]?.wrf_url && (
                <View className="relative mb-4">
                  <Image
                    source={{ uri: parsedFiles[0].wrf_url }}
                    className="w-full aspect-video bg-gray-100 rounded-md border border-gray-100"
                    resizeMode="cover"
                  />
                  <Text className="absolute top-2 left-2 bg-white/80 px-2 py-0.5 text-[14px] font-medium text-gray-700 rounded">
                    Report Evidence
                  </Text>
                </View>
              )}
              
              {/* Resolved Image - only show if exists */}
              {rep_resolved_img && (
                <View className="relative">
                  <Image
                    source={{ uri: String(rep_resolved_img) }}
                    className="w-full aspect-video bg-gray-100 rounded-md"
                    resizeMode="cover"
                  />
                  <Text className="absolute top-2 left-2 bg-white/80 px-2 py-0.5 text-[14px] font-medium text-gray-700 rounded">
                    Resolution Evidence
                  </Text>
                </View>
              )}
            </View>

            {/* Details Container */}
            <View className="w-full">
              <View className="flex-1">
                <View className="flex-row justify-between mb-4">
                  <View className="w-[48%]">
                    <Text className="font-semibold text-gray-600 mb-1">Sitio</Text>
                    <Text>{sitio_name}</Text>
                  </View>
                  <View className="w-[48%]">
                    <Text className="font-semibold text-gray-600 mb-1">Location</Text>
                    <Text>{rep_location}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between mb-4">
                  <View className="w-[48%]">
                    <Text className="font-semibold text-gray-600 mb-1">Contact Number</Text>
                    <Text>{rep_contact}</Text>
                  </View>
                  <View className="w-[48%]">
                    <Text className="font-semibold text-gray-600 mb-1">Violator</Text>
                    <Text>{rep_violator || "Unknown"}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between mb-4">
                  <View className="w-[48%]">
                    <Text className="font-semibold text-gray-600 mb-1">Date & Time</Text>
                    <Text>{formatDate(rep_date as string)}</Text>
                  </View>
                  <View className="w-[48%]">
                    <Text className="font-semibold text-gray-600 mb-1">Report Status</Text>
                    <View className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle()}`}>
                      <Text>{rep_status || "No status provided"}</Text>
                    </View>      
                  </View>
                </View>

                {rep_date_resolved && (
                  <View className="mb-4">
                    <Text className="font-semibold text-gray-600 mb-1">Date & Time Resolved</Text>
                    <Text>{formatDate(rep_date_resolved as string)}</Text>              
                  </View>
                )}

                <View className="mb-4">
                  <Text className="font-semibold text-gray-600 mb-1">Report Details</Text>
                  <Text>{rep_add_details || "No additional details provided."}</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </_ScreenLayout>

        <Modal
            visible={showResolutionModal}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setShowResolutionModal(false)}
        >
            <View className="flex-1 bg-black/50 justify-center px-5 pb-10">
                <View className="h-[43%] w-full bg-white rounded-lg overflow-hidden">
                    {/* Modal Header */}
                    <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                        <Text className="text-lg font-semibold">Add Resolution Image</Text>
                        <TouchableOpacity 
                            onPress={() => setShowResolutionModal(false)}
                            className="p-1"
                        >
                            <X size={20} className="text-black" />
                        </TouchableOpacity>
                    </View>

                    {/* Scrollable Modal Content */}
                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                        <Text className="text-md text-gray-600 mb-3">Upload photo evidence of resolution</Text>
                        <MultiImageUploader
                            mediaFiles={resolutionFiles}
                            setMediaFiles={setResolutionFiles}
                            maxFiles={1}
                            hideRemoveButton={false}
                        />

                        {/* Submit Button */}
                        <ConfirmationModal
                            trigger={
                                <TouchableOpacity
                                    className={`py-3 rounded-md mt-4 items-center ${
                                        isResolved ? "bg-gray-400" : "bg-blue-500"
                                    }`}
                                    disabled={isResolved}
                                >
                                    <Text className="text-white font-medium">Submit</Text>
                                </TouchableOpacity>
                            }
                            title="Confirm Save"
                            description="Are you sure you want to save these changes?"
                            actionLabel="Confirm"
                            onPress={handleSubmitResolution}
                        />                        
                    </ScrollView>
                </View>
            </View>
        </Modal>
    </>
  );
}