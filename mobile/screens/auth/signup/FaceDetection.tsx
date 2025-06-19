import React from "react";
import {
  useCameraDevice,
  Camera,
} from "react-native-vision-camera";
import { View, StyleSheet, Image } from "react-native";
import { supabase } from "@/lib/supabase";
import * as ImageManipulator from "expo-image-manipulator";
import { RealtimeChannel } from "@supabase/supabase-js";
import { postFaceData } from "./restful-api/signupPostAPI";

export type FaceDetectionCamHandle = {
  capturePhoto: () => Promise<Uint8Array | null | undefined>;
};

export const FaceDetection = React.forwardRef<FaceDetectionCamHandle>(
  (props, ref) => {
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

            // Get image dimensions first
            const { width: imgWidth, height: imgHeight } = await Image.getSize(photoUri);

            // Calculate crop values in pixels
            const cropHeight = imgHeight * 0.60; // 50% of height

            const compressedImage = await ImageManipulator.manipulateAsync(
              photoUri,
              [{
                crop: {
                  originX: 0,        // Start from left edge
                  originY: 0,    // Start 25% from top (centers face better)
                  width: imgWidth,    // Use full width
                  height: cropHeight,    // Crop to square aspect ratio
                }}, 
                { resize: { width: 1080 }}
              ],
              {
                compress: 0.8,
                format: ImageManipulator.SaveFormat.JPEG,
                base64: true,
              }
            );

            // Add timeout mechanism
            const withTimeout = (promise: Promise<any>, ms: number) => {
              const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
              );
              return Promise.race([promise, timeout]);
            };

            const { data, error } = await supabase
              .from("face_detection_request")
              .insert([
                {
                  image: compressedImage.base64,
                  status: "pending",
                },
              ])
              .select();

            if (error) throw error;

            const requestId = data[0].id;
            let subscription: RealtimeChannel;

            try {
              const result = await withTimeout(
                new Promise<{ success: boolean; arrayBuffer?: Uint8Array }>(
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
                          filter: `id=eq.${requestId}`,
                        },
                        (payload) => {
                          if (payload.new.status === "processed") {
                            subscription.unsubscribe();
                            if (payload.new.faces_detected > 0) {
                              if (!compressedImage.base64) {
                                throw new Error("Compressed image base64 data is undefined");
                              }
                              resolve({
                                success: true,
                                arrayBuffer: Uint8Array.from(
                                  atob(compressedImage.base64),
                                  (c) => c.charCodeAt(0)
                                ),
                              });
                            } else {
                              resolve({ success: false });
                            }
                          } else if (payload.new.status === "error") {
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
                      id: requestId,
                      image: compressedImage.base64,
                    });
                  }
                ),
                5000
              );

              console.log("Detection result:", result.success);
              return result.success ? result.arrayBuffer : null;
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
