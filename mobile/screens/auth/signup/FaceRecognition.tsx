import React from "react";
import {
  useCameraDevice,
  Camera,
} from "react-native-vision-camera";
import { View, StyleSheet, Image } from "react-native";
import { supabase } from "@/lib/supabase";
import * as FileSystem from 'expo-file-system';
import { RealtimeChannel } from "@supabase/supabase-js";
import { postFaceData } from "../rest-api/authPostAPI";

export type FaceRecognitionCamHandle = {
  capturePhoto: () => Promise<Record<string, any> | null | undefined>;
};

export type FaceRecognitionProps = {
  kyc_id: number
}

export const FaceRecognition = React.forwardRef<FaceRecognitionCamHandle, FaceRecognitionProps>(
  (props, ref) => {
    const { kyc_id } = props;
    const isActive = React.useRef<boolean>(true);
    const device = useCameraDevice("front");
    const camera = React.useRef<Camera>(null);
    const [hasPermission, setHasPermission] = React.useState<boolean | null>(
      null
    );

    React.useEffect(() => {
      const requestCameraPermission = async () => {
        const status = await Camera.requestCameraPermission();
        setHasPermission(status === "granted");
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

            // Add timeout mechanism
            const withTimeout = (promise: Promise<any>, ms: number) => {
              const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
              );
              return Promise.race([promise, timeout]);
            };

            let subscription: RealtimeChannel;

            try {
              const result = await withTimeout(
                new Promise<{ success: boolean }>(
                  async (resolve) => {
                    // Setup subscription first
                    subscription = supabase
                      .channel(`face-detection`)
                      .on(
                        "postgres_changes",
                        {
                          event: "UPDATE",
                          schema: "public",
                          table: "face_detection_request",
                          filter: `id=eq.${kyc_id}`,
                        },
                        async (payload) => {
                          if (payload.new.status === "processed") {
                            subscription.unsubscribe();
                            
                          } else {
                            subscription.unsubscribe();
                            resolve({ success: false });
                          }
                        }
                      )
                      .subscribe((status, err) => {
                        if (err) console.error("Subscription error:", err);
                        if (status) console.log("Status:", status)
                      });

                    // Trigger the processing
                    await postFaceData({
                      kyc_id: kyc_id,
                      image: `data:image/jpeg;base64,${base64Data}`,
                    });
                  }
                ),
                5000
              );

              return result.success ? result.success : null;
            } catch (err) {
              console.log("Detection error:", err);
              return null;
            } 
          } catch (error) {
            console.log("Capture failed:", error);
            return null;
          }
        }
        return null;
      },
    }));

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
          isMirrored={true}
        />
      </View>
    );
    }
  }
  
);
