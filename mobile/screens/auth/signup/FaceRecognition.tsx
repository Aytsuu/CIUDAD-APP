import React from "react";
import {
  useCameraDevice,
  Camera,
} from "react-native-vision-camera";
import { View, StyleSheet } from "react-native";
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

            try {
              const values = type == "business" ? 
                        getValues('businessRespondent') : 
                        getValues('personalInfoSchema') as any
              
              const formData = new FormData();
              formData.append("image", {
                uri: photoUri,
                type: "image/jpeg",
                name: "face_image.jpg",
              } as any);
  
              formData.append('lname', type == "business" ? values.br_lname.toUpperCase().trim() : values.per_lname.toUpperCase().trim())
              formData.append('fname', type == "business" ? values.br_fname.toUpperCase().trim() : values.per_fname.toUpperCase().trim())
              formData.append('dob', type == "business" ? values.br_dob.toUpperCase().trim() : values.per_dob.toUpperCase().trim())
              if(type == "business" && values?.br_mname != "")
                formData.append('mname', values.br_mname.toUpperCase().trim())
              else if (values?.per_mname != "")
                formData.append('mname', values.per_mname.toUpperCase().trim())
  
              const result = await postFaceData(formData)
              return result;

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
