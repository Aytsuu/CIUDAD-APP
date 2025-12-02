import React from "react";
import { useCameraDevice, Camera } from "react-native-vision-camera";
import { View, StyleSheet, Text } from "react-native";
import { supabase } from "@/lib/supabase";
import { postDocumentData } from "../rest-api/authPostAPI";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import NetInfo from "@react-native-community/netinfo";
import { useRegistrationTypeContext } from "@/contexts/RegistrationTypeContext";

export type CAVIDCamHandle = {
  capturePhoto: () => Promise<boolean | undefined>;
};

// Configuration constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export const CaptureAndVerifyID = React.forwardRef<CAVIDCamHandle>(
  (props, ref) => {
    // Initialization
    const { type } = useRegistrationTypeContext();
    const { getValues } = useRegistrationFormContext();
    const isActive = React.useRef<boolean>(true);
    const device = useCameraDevice("back");
    const camera = React.useRef<Camera>(null);
    const [hasPermission, setHasPermission] = React.useState<boolean | null>(
      null
    );
    const [connectionState, setConnectionState] =
      React.useState<string>("disconnected");
    const [isOnline, setIsOnline] = React.useState(true);

    // Monitor actual network state
    React.useEffect(() => {
      const unsubscribe = NetInfo.addEventListener((state) => {
        const online = state.isConnected ?? false;
        setIsOnline(online);
        console.log("Network state:", online ? "Online" : "Offline");
      });

      // Get initial state
      NetInfo.fetch().then((state) => {
        setIsOnline(state.isConnected ?? false);
      });

      return () => unsubscribe();
    }, []);

    React.useEffect(() => {
      const requestCameraPermission = async () => {
        const status = await Camera.requestCameraPermission();
        setHasPermission(status === "granted");
      };
      requestCameraPermission();
    }, []);

    // Retry utility function
    const withRetry = async <T,>(
      operation: () => Promise<T>,
      maxRetries: number = MAX_RETRIES
    ): Promise<T> => {
      let lastError: Error;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation();
        } catch (error) {
          lastError = error as Error;
          console.log(`Attempt ${attempt}/${maxRetries} failed:`, error);

          if (attempt < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_DELAY * attempt)
            );
          }
        }
      }

      throw lastError!;
    };
    // Monitor connection state
    React.useEffect(() => {
      const channel = supabase.channel("connection-monitor");

      const subscription = channel
        .on("system", { event: "DISCONNECTED" }, () => {
          setConnectionState("disconnected");
          console.log("Disconnected from Supabase");
        })
        .on("system", { event: "CONNECTED" }, () => {
          setConnectionState("connected");
          console.log("Connected to Supabase");
        })
        .on("system", { event: "RECONNECT" }, () => {
          setConnectionState("reconnecting");
          console.log("Reconnecting to Supabase");
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }, []);

    // Monitor network state
    React.useEffect(() => {
      const unsubscribe = NetInfo.addEventListener((state) => {
        console.log(
          "Network state:",
          state.isConnected ? "Connected" : "Disconnected"
        );
        if (!state.isConnected) {
          console.log("No network connection");
        }
      });

      return () => unsubscribe();
    }, []);

    // Cleanup on unmount
    React.useEffect(() => {
      return () => {
        isActive.current = false;
      };
    }, []);

    React.useImperativeHandle(ref, () => ({
      capturePhoto: async (): Promise<boolean | undefined> => {
        try {
          if (!camera.current) {
            throw new Error("Camera not ready");
          }

          // Capture photo
          const photo = await camera.current.takePhoto();
          const photoUri = `file://${photo?.path}`;

          // Send data for processing
          try {
            const values =
              type == "business"
                ? getValues("businessRespondent")
                : (getValues("personalInfoSchema") as any);

            const formData = new FormData();
            formData.append("image", {
              uri: photoUri,
              type: "image/jpeg",
              name: "id_document.jpg",
            } as any);

            formData.append('lname', type == "business" ? values.br_lname.toUpperCase().trim() : values.per_lname.toUpperCase().trim())
            formData.append('fname', type == "business" ? values.br_fname.toUpperCase().trim() : values.per_fname.toUpperCase().trim())
            formData.append('dob', type == "business" ? values.br_dob.toUpperCase().trim() : values.per_dob.toUpperCase().trim())
            if(type == "business" && values?.br_mname != "")
              formData.append('mname', values.br_mname.toUpperCase().trim())
            else if (values?.per_mname != "")
              formData.append('mname', values.per_mname.toUpperCase().trim())

            const result = await postDocumentData(formData)
            return result;

          } catch (postError) {
            console.log("Error sending document data:", postError);
            return false;
          }
        } catch (error) {
          console.log("Capture and verification failed:", error);
          return false;
        }
      },
    }));

    if (!device || !hasPermission) {
      return (
        <View className="w-screen h-screen bg-white items-center justify-center">
          {!device && <Text>Camera device not found</Text>}
          {!hasPermission && <Text>Camera permission required</Text>}
        </View>
      );
    }

    return (
      <View className="w-screen h-screen bg-white items-center justify-center overflow-hidden">
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

        {/* Connection status indicator (optional) */}
        {!isOnline && (
          <View className="absolute top-10 right-10 bg-red-500 px-3 py-1 rounded">
            <Text className="text-white text-xs">
              Offline - No internet connection
            </Text>
          </View>
        )}
      </View>
    );
  }
);
