import React from "react"
import {
  useCameraDevice,
  Camera,
} from "react-native-vision-camera";
import { View, StyleSheet, Image } from "react-native";
import { supabase } from "@/lib/supabase";
import * as FileSystem from 'expo-file-system'
import { RealtimeChannel } from "@supabase/supabase-js";
import { postDocumentData } from "../rest-api/authPostAPI";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";

export type CAVIDCamHandle = {
  capturePhoto: () => Promise<Record<string, any> | null | undefined>;
}

export const CaptureAndVerifyID = React.forwardRef<CAVIDCamHandle>(
  (props, ref) => {
    const { getValues } = useRegistrationFormContext();
    const isActive = React.useRef<boolean>(true);
    const device = useCameraDevice("back");
    const camera = React.useRef<Camera>(null);
    const [hasPermission, setHasPermission] = React.useState<boolean | null>(
      null
    );

    React.useEffect(() => {
      const requestCameraPermission = async () => {
        const status = await Camera.requestCameraPermission();
        setHasPermission(status === "granted")
      };
      requestCameraPermission();
    }, []);

    React.useImperativeHandle(ref, () => ({
      capturePhoto: async () => {
        if (camera.current) {
          try {
            const photo = await camera.current.takePhoto();
            const photoUri = `file://${photo?.path}`;
            const base64Data = await FileSystem.readAsStringAsync(photoUri, {
              encoding: FileSystem.EncodingType.Base64
            })

            // Timeout mechanism
            const withTimeout = (promise: Promise<any>, ms: number) => {
              const timeout = new Promise((_,reject) => 
                setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
              );
              return Promise.race([promise, timeout]);
            }

            const { data, error } = await supabase
              .from("kyc_record")
              .insert([
                {
                  id_document_front: `data:image/jpeg;base64,${base64Data}`
                }
              ])
              .select();
              
            if(error) {
              console.log("Full error details:", JSON.stringify(error, null, 2));
              throw error;
            }

            const request_id = data[0].kyc_id;
            let subscription: RealtimeChannel;

            try {
              const result = await withTimeout(
                new Promise<{success: boolean; kyc_id?: number}>(
                  async (resolve) => {
                    // Setup subscription
                    subscription = supabase
                      .channel(`kyc-processor`)
                      .on(
                        "postgres_changes",
                        {
                          event: "UPDATE",
                          schema: "public",
                          table: "kyc_record",
                          filter: `kyc_id=eq.${request_id}`
                        },
                        async (payload) => {
                          if(payload.new.document_info_match === true &&
                            payload.new.id_has_face === true
                          ){
                            subscription.unsubscribe();
                            
                            resolve({
                              success: true,
                              kyc_id: request_id
                            })
                          } else {
                            subscription.unsubscribe();
                            resolve({ success: false });
                          }
                        }
                      )
                      .subscribe((status, err) => {
                        if (err) console.error("Subscription error:", err);
                        if (status) console.log("Status:", status)
                      })
                    
                    try {
                      const request = await postDocumentData({
                        kyc_id: request_id,
                        lname: getValues('personalInfoSchema.per_lname').toUpperCase().trim(),
                        fname: getValues('personalInfoSchema.per_fname').toUpperCase().trim(),
                        dob: getValues('personalInfoSchema.per_dob'),
                        image: `data:image/jpeg;base64,${base64Data}`
                      })

                      console.log('post_result:', request)  
                    } catch (err) {
                      subscription.unsubscribe();
                      resolve({ success: false });
                      throw err;
                    }
                  }
                )
              , 30000)
              
              console.log("resolve:", result.success)
              return result.success ? result.kyc_id : false
            } catch (error) { 
              console.log("Detection error:", error);
              return null;
            }

          } catch(error) {
            console.log("Capture failed:", error);
            return null;
          }
        }
        return null;
      }
    }))

    if(device && hasPermission) {
      return (
      <View
        className={`w-screen h-screen bg-white items-center justify-center overflow-hidden`}
      >
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive.current}
          pixelFormat="yuv"
          photo={true}
          photoQualityBalance="quality"
          outputOrientation="device"
          enableZoomGesture={false}
        />
      </View>
    );
  }
})