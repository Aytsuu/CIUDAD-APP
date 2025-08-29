// import React from "react"
// import {
//   useCameraDevice,
//   Camera,
// } from "react-native-vision-camera";
// import { View, StyleSheet, Text } from "react-native";
// import { supabase } from "@/lib/supabase";
// import * as FileSystem from 'expo-file-system'
// import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
// import { postDocumentData } from "../rest-api/authPostAPI";
// import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
// import NetInfo from '@react-native-community/netinfo';

// export type CAVIDCamHandle = {
//   capturePhoto: () => Promise<number | null>;
// }

// // Configuration constants
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 2000;
// const OPERATION_TIMEOUT = 45000; // 45 seconds
// const SUBSCRIPTION_TIMEOUT = 30000; // 30 seconds

// export const CaptureAndVerifyID = React.forwardRef<CAVIDCamHandle>(
//   (props, ref) => {
//     const { getValues } = useRegistrationFormContext();
//     const isActive = React.useRef<boolean>(true);
//     const device = useCameraDevice("back");
//     const camera = React.useRef<Camera>(null);
//     const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);
//     const [connectionState, setConnectionState] = React.useState<string>('disconnected');
//     const [isOnline, setIsOnline] = React.useState(true);

//     // Monitor actual network state
//     React.useEffect(() => {
//       const unsubscribe = NetInfo.addEventListener(state => {
//         const online = state.isConnected ?? false;
//         setIsOnline(online);
//         console.log('Network state:', online ? 'Online' : 'Offline');
//       });

//       // Get initial state
//       NetInfo.fetch().then(state => {
//         setIsOnline(state.isConnected ?? false);
//       });

//       return () => unsubscribe();
//     }, []);

//     React.useEffect(() => {
//       const requestCameraPermission = async () => {
//         const status = await Camera.requestCameraPermission();
//         setHasPermission(status === "granted")
//       };
//       requestCameraPermission();
//     }, []);

//     // Retry utility function
//     const withRetry = async <T,>(
//       operation: () => Promise<T>,
//       maxRetries: number = MAX_RETRIES
//     ): Promise<T> => {
//       let lastError: Error;
      
//       for (let attempt = 1; attempt <= maxRetries; attempt++) {
//         try {
//           return await operation();
//         } catch (error) {
//           lastError = error as Error;
//           console.log(`Attempt ${attempt}/${maxRetries} failed:`, error);
          
//           if (attempt < maxRetries) {
//             await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
//           }
//         }
//       }
      
//       throw lastError!;
//     };

//     // Timeout utility function
//     const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
//       const timeout = new Promise<never>((_, reject) => 
//         setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
//       );
//       return Promise.race([promise, timeout]);
//     };

//     // Create stable subscription
//     const createStableSubscription = (
//       request_id: number,
//       onUpdate: (payload: RealtimePostgresChangesPayload<any>) => void
//     ): RealtimeChannel => {
//       return supabase
//         .channel(`kyc-processor-${request_id}-${Date.now()}`)
//         .on(
//           "postgres_changes",
//           {
//             event: "UPDATE",
//             schema: "public",
//             table: "kyc_record",
//             filter: `kyc_id=eq.${request_id}`
//           },
//           onUpdate
//         );
//     };

//     // Subscribe with retry mechanism
//     const subscribeWithRetry = async (
//       channel: RealtimeChannel,
//       maxRetries: number = MAX_RETRIES
//     ): Promise<void> => {
//       return withRetry(async () => {
//         channel.subscribe();
//         // Optionally, you can check channel's current state if needed
//         // For now, we assume subscribe() resolves if successful
//         console.log("Subscription successful");
//         return;
//       }, maxRetries);
//     };

//     // Monitor connection state
//     React.useEffect(() => {
//       const channel = supabase.channel('connection-monitor');
      
//       const subscription = channel
//         .on('system', { event: 'DISCONNECTED' }, () => {
//           setConnectionState('disconnected');
//           console.log('Disconnected from Supabase');
//         })
//         .on('system', { event: 'CONNECTED' }, () => {
//           setConnectionState('connected');
//           console.log('Connected to Supabase');
//         })
//         .on('system', { event: 'RECONNECT' }, () => {
//           setConnectionState('reconnecting');
//           console.log('Reconnecting to Supabase');
//         })
//         .subscribe();

//       return () => {
//         subscription.unsubscribe();
//       };
//     }, []);

//     // Monitor network state
//     React.useEffect(() => {
//       const unsubscribe = NetInfo.addEventListener(state => {
//         console.log('Network state:', state.isConnected ? 'Connected' : 'Disconnected');
//         if (!state.isConnected) {
//           console.log('No network connection');
//         }
//       });

//       return () => unsubscribe();
//     }, []);

//     // Cleanup on unmount
//     React.useEffect(() => {
//       return () => {
//         isActive.current = false;
//       };
//     }, []);

//     React.useImperativeHandle(ref, () => ({
//       capturePhoto: async (): Promise<number | null> => {
//         try {
//           return await withRetry(async () => {
//             if (!camera.current) {
//               throw new Error("Camera not ready");
//             }

//             // Capture photo
//             const photo = await camera.current.takePhoto();
//             const photoUri = `file://${photo?.path}`;
//             const base64Data = await FileSystem.readAsStringAsync(photoUri, {
//               encoding: FileSystem.EncodingType.Base64
//             });

//             // Insert KYC record
//             const { data, error } = await supabase
//               .from("kyc_record")
//               .insert([{ 
//                 id_document_front: `data:image/jpeg;base64,${base64Data}` 
//               }])
//               .select();

//             if (error) {
//               console.log("Supabase insert error:", JSON.stringify(error, null, 2));
//               throw error;
//             }

//             const request_id = data[0].kyc_id;
//             console.log("KYC record created with ID:", request_id);

//             // Set up real-time subscription with timeout
//             return await withTimeout(
//               new Promise<number | null>(async (resolve, reject) => {
//                 let subscription: RealtimeChannel | null = null;
//                 let subscriptionTimeoutId: NodeJS.Timeout;

//                 const cleanup = () => {
//                   if (subscription) {
//                     subscription.unsubscribe();
//                     console.log("Subscription cleaned up");
//                   }
//                   if (subscriptionTimeoutId) {
//                     clearTimeout(subscriptionTimeoutId);
//                   }
//                 };

//                 try {
//                   // Create subscription
//                   subscription = createStableSubscription(
//                     request_id,
//                     (payload) => {
//                       console.log("Received update:", payload.new);
                      
//                       if (payload.new.document_info_match === true &&
//                           payload.new.id_has_face === true) {
//                         cleanup();
//                         console.log("KYC verification successful");
//                         resolve(request_id);
//                       } else {
//                         cleanup();
//                         console.log("KYC verification failed");
//                         resolve(null);
//                       }
//                     }
//                   );

//                   // Subscribe with retry
//                   await subscribeWithRetry(subscription);
//                   console.log("Successfully subscribed to channel");

//                   // Send data for processing
//                   try {
//                     await postDocumentData({
//                       kyc_id: request_id,
//                       lname: getValues('personalInfoSchema.per_lname').toUpperCase().trim(),
//                       fname: getValues('personalInfoSchema.per_fname').toUpperCase().trim(),
//                       dob: getValues('personalInfoSchema.per_dob'),
//                       image: `data:image/jpeg;base64,${base64Data}`
//                     });
//                     console.log("Document data sent for processing");
//                   } catch (postError) {
//                     console.log("Error sending document data:", postError);
//                     cleanup(); // unsubscribe & clear timeout
//                     resolve(null); // stop waiting
//                     return; // exit early
//                   }

//                   // Set timeout for the subscription to receive updates
//                   subscriptionTimeoutId = setTimeout(() => {
//                     cleanup();
//                     console.log("Subscription timeout - no update received");
//                     resolve(null);
//                   }, SUBSCRIPTION_TIMEOUT);

//                 } catch (subscriptionError) {
//                   cleanup();
//                   console.log("Subscription setup failed:", subscriptionError);
//                   resolve(null);
//                 }
//               }),
//               OPERATION_TIMEOUT
//             );

//           });
//         } catch (error) {
//           console.log("Capture and verification failed:", error);
//           return null;
//         }
//       }
//     }));

//     if (!device || !hasPermission) {
//       return (
//         <View className="w-screen h-screen bg-white items-center justify-center">
//           {!device && <Text>Camera device not found</Text>}
//           {!hasPermission && <Text>Camera permission required</Text>}
//         </View>
//       );
//     }

//     return (
//       <View className="w-screen h-screen bg-white items-center justify-center overflow-hidden">
//         <Camera
//           ref={camera}
//           style={StyleSheet.absoluteFill}
//           device={device}
//           isActive={isActive.current}
//           pixelFormat="yuv"
//           photo={true}
//           photoQualityBalance="quality"
//           outputOrientation="device"
//           enableZoomGesture={false}
//         />
        
//         {/* Connection status indicator (optional) */}
//         {!isOnline && (
//           <View className="absolute top-10 right-10 bg-red-500 px-3 py-1 rounded">
//             <Text className="text-white text-xs">Offline - No internet connection</Text>
//           </View>
//         )}
//       </View>
//     );
//   }
// );