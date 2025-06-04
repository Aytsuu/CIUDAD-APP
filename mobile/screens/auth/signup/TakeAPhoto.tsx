import React from "react";
import _ScreenLayout from "@/screens/_ScreenLayout";
import "react-native-get-random-values";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { FaceDetectionCam, FaceDetectionCamHandle } from "./FaceDetectionCam";
import RegisterCompletion from "./RegisterCompletion";

export default function TakeAPhoto() {
  const [isValid, setIsValid] = React.useState<boolean>(false);
  const [photo, setPhoto] = React.useState<Uint8Array | null>(null);
  const cameraRef = React.useRef<FaceDetectionCamHandle>(null);

  React.useEffect(() => {
    const capture = async () => {
      if(!cameraRef.current || !isValid) return;

      const photo = await cameraRef.current.capturePhoto();
      setPhoto(photo);
    }

    capture();
  }, [isValid])

  return (
    <>
      {photo ? (
        <RegisterCompletion 
          photo={photo}
          setPhoto={setPhoto}
        />
      ) : (
        <_ScreenLayout header={""} description={""}>
          <View className="flex-1 justify-between gap-7">
            <View className="flex-1 items-center justify-center bg-lightBlue-2 rounded-md gap-3 p-4">
              <FaceDetectionCam
                ref={cameraRef}
                setIsValid={setIsValid}
                isValid={isValid}
              />
              {isValid ? (
                <Text className="text-green-600 text-center">
                  Valid face detected
                </Text>
              ) : (
                <Text className="text-red-600 text-center">
                  Please show your full face
                </Text>
              )}
            </View>
          </View>
        </_ScreenLayout>
      )}
    </>
  );
}
