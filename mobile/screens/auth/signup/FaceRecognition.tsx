import React from "react";
import {
  useCameraDevice,
  Camera,
} from "react-native-vision-camera";
import { View, StyleSheet } from "react-native";
import * as FileSystem from 'expo-file-system';
import { postFaceData } from "../rest-api/authPostAPI";
import { useRegistrationTypeContext } from "@/contexts/RegistrationTypeContext";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";

export type FaceRecognitionCamHandle = {
  capturePhoto: () => Promise<boolean | undefined>;
};

export type FaceRecognitionProps = {
  kyc_id: number
}

export const FaceRecognition = React.forwardRef<FaceRecognitionCamHandle, FaceRecognitionProps>(
  (_, ref) => {
    const { type } = useRegistrationTypeContext()
    const { getValues } = useRegistrationFormContext();
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
      capturePhoto: async (): Promise<boolean | undefined> => {
        if (camera.current) {
          try {
            const photo = await camera.current.takePhoto();
            const photoUri = `file://${photo?.path}`;
            const base64Data = await FileSystem.readAsStringAsync(photoUri, {
              encoding: FileSystem.EncodingType.Base64
            })

            try {
              const values = type == "individual" ? 
                          getValues('personalInfoSchema') : 
                          getValues('businessRespondent') as any
  
              switch(type) {
                case 'individual':
                  const residentMatchFace = await postFaceData({
                    lname: values.per_lname.toUpperCase().trim(),
                    fname: values.per_fname.toUpperCase().trim(),
                    ...(values.per_mname != "" && {mname: values.per_mname?.toUpperCase().trim()}),
                    dob: values.per_dob,
                    image: `data:image/jpeg;base64,${base64Data}`
                  });
  
                  return residentMatchFace
                case 'business':
                  const busRespondentMatchFace = await postFaceData({
                    lname: values.br_lname.toUpperCase().trim(),
                    fname: values.br_fname.toUpperCase().trim(),
                    ...(values.br_mname != "" && {mname: values.br_mname?.toUpperCase().trim()}),
                    dob: values.br_dob,
                    image: `data:image/jpeg;base64,${base64Data}`
                  });
  
                  return busRespondentMatchFace
              }
              
            } catch (err) {
              console.log(err)
            }
          } catch (error) {
            console.log("Capture failed:", error);
            return false;
          }
        }
        return false;
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
