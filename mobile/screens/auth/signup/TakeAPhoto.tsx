// import React from "react";
// import { Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
// import RegisterCompletion from "./individual/IndividualCompletion";
// import { FaceRecognitionCamHandle, FaceRecognition } from "./FaceRecognition";

// export default function TakeAPhoto({params} : {params: Record<string, any>}) {
//   const [isMatching, setIsMatching] = React.useState(false);
//   const [detectionStatus, setDetectionStatus] = React.useState<string>("");
//   const [retryCount, setRetryCount] = React.useState(0);
//   const [timerActive, setTimerActive] = React.useState(false);
//   const [timeRemaining, setTimeRemaining] = React.useState(30);
//   const cameraRef = React.useRef<FaceRecognitionCamHandle>(null);
//   console.log(params?.kyc_id)
//   const attemptFaceDetection = React.useCallback(async () => {
//     if (!cameraRef.current || isMatching) {
//       return;
//     }

//     setIsMatching(true);
//     setDetectionStatus("Looking for your face...");

//     try {
//       const matched = await cameraRef.current.capturePhoto();
//       console.log(matched);
//       if (matched) {
//         params?.complete()
//       } else {
//         setIsMatching(false);
//         setDetectionStatus(`Detection failed.`);
//       }
//     } finally {
//       setIsMatching(false);
//     }
//   }, [setIsMatching]);

//   const handleManualCapture = () => {
//     if (timerActive) return;
    
//     // Reset retry count when starting a new round
//     if (retryCount >= 3) {
//       setRetryCount(0);
//     }
    
//     attemptFaceDetection();
//   };

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   const isButtonDisabled = isMatching || timerActive;
//   const showTimerStatus = timerActive && timeRemaining > 0;

//   return (
//     <>
//       <SafeAreaView className="flex-1 bg-white">
//         <View className="flex-1">
//           {/* Header */}
//           <View className="px-6 py-4">
//             <Text className="text-2xl font-bold text-gray-800 text-center">
//               Take Your Photo
//             </Text>
//             <Text className="text-gray-600 text-center mt-2">
//               Position your face in the frame
//             </Text>
//           </View>

//           {/* Camera View */}
//           <View className="flex-1 relative">
//             <FaceRecognition kyc_id={+params?.kyc_id} ref={cameraRef} />
            
//             {/* Face Detection Overlay */}
//             <View className="absolute inset-0 pointer-events-none">
//               {/* Face Guide Frame */}
//               <View className="flex-1 items-center justify-center">
//                 <View className="w-64 h-80 border-2 border-white border-dashed rounded-3xl opacity-80">
//                   <View className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4 border-blue-500 rounded-tl-lg" />
//                   <View className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4 border-blue-500 rounded-tr-lg" />
//                   <View className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4 border-blue-500 rounded-bl-lg" />
//                   <View className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4 border-blue-500 rounded-br-lg" />
//                 </View>
//               </View>
//             </View>

//             {/* Status Overlay */}
//             {(isMatching || detectionStatus || showTimerStatus) && (
//               <View className="absolute bottom-32 left-0 right-0 items-center px-6">
//                 <View className="bg-black bg-opacity-75 rounded-2xl px-6 py-4 max-w-sm">
//                   {isMatching && (
//                     <View className="flex-row items-center justify-center mb-2">
//                       <ActivityIndicator size="small" color="white" />
//                       <Text className="text-white ml-2 font-medium">
//                         Detecting...
//                       </Text>
//                     </View>
//                   )}
                  
//                   {showTimerStatus && (
//                     <View className="items-center mb-2">
//                       <Text className="text-yellow-400 font-bold text-lg">
//                         {formatTime(timeRemaining)}
//                       </Text>
//                       <Text className="text-white text-xs">
//                         Please wait before trying again
//                       </Text>
//                     </View>
//                   )}
                  
//                   <Text className="text-white text-center text-sm">
//                     {detectionStatus}
//                   </Text>
//                 </View>
//               </View>
//             )}
//           </View>

//           {/* Bottom Controls */}
//           <View className="px-6 pb-8 pt-4 bg-white">
//             <View className="flex-row justify-center items-center space-x-4">
//               {/* Manual Capture Button */}
//               <TouchableOpacity
//                 onPress={handleManualCapture}
//                 disabled={isButtonDisabled}
//                 className={`flex-1 max-w-xs py-4 rounded-2xl ${
//                   isButtonDisabled 
//                     ? 'bg-gray-300' 
//                     : 'bg-blue-600 active:bg-blue-700'
//                 }`}
//               >
//                 <View className="flex-row items-center justify-center">
//                   {isMatching ? (
//                     <ActivityIndicator size="small" color="gray" />
//                   ) : timerActive ? (
//                     <Text className="text-gray-600 font-semibold text-lg">
//                       Wait {formatTime(timeRemaining)}
//                     </Text>
//                   ) : (
//                     <Text className="text-white font-semibold text-lg">
//                       Capture Face
//                     </Text>
//                   )}
//                 </View>
//               </TouchableOpacity>
//             </View>

//             {/* Attempt Counter */}
//             {(retryCount > 0) && !timerActive && (
//               <View className="mt-4 items-center">
//                 <Text className="text-gray-500 text-sm">
//                   Attempt {retryCount}/3
//                 </Text>
//               </View>
//             )}

//             {/* Tips */}
//             <View className="mt-6 px-4">
//               <Text className="text-gray-500 text-center text-sm font-medium mb-2">
//                 Tips for better detection:
//               </Text>
//               <View className="space-y-1">
//                 <Text className="text-gray-400 text-center text-xs">
//                   • Ensure good lighting on your face
//                 </Text>
//                 <Text className="text-gray-400 text-center text-xs">
//                   • Position your face within the frame
//                 </Text>
//                 <Text className="text-gray-400 text-center text-xs">
//                   • Keep your device steady
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </View>
//       </SafeAreaView>
//     </>
//   );
// }