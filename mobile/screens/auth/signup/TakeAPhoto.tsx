import React from 'react';
import Layout from './_layout';
import { useRegistrationFormContext } from '@/contexts/RegistrationFormContext';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Camera, Frame, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { Face, useFaceDetector, FaceDetectionOptions } from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { addPersonal, addRequest } from './restful-api/signupPostAPI';

export default function App() {
  const router = useRouter();
  const { getValues } = useRegistrationFormContext();
  const isActive = React.useRef<boolean>(true);
  const lastDetectionTime = React.useRef(0);
  const device = useCameraDevice('front');
  const [isValid, setIsValid] = React.useState<boolean>(false);
  
  const { detectFaces } = useFaceDetector({
    performanceMode: 'fast',
    landmarkMode: 'none',
    contourMode: 'none',
    classificationMode: 'none',
    minFaceSize: 0.7,
  } as FaceDetectionOptions);

  React.useEffect(() => {
    return () => {
      isActive.current = false;
    };
  }, []);
  
  const handleDetectedFaces = Worklets.createRunOnJS((serializableFace: any, frameWidth: number, frameHeight: number) => {
    if (!isActive.current) return;
    
    // Throttle to prevent excessive logging
    const now = Date.now();
    if (now - lastDetectionTime.current < 300) return;
    lastDetectionTime.current = now;

    try {
      // Reconstruct the face object with frame dimensions
      const face: Face = {
        ...serializableFace,
        bounds: {
          ...serializableFace.bounds,
          // Add any additional properties if needed
        },
      };

      const validFace = isFaceFullyVisibleAndAccurate(face, frameWidth, frameHeight);
      console.log("Face validity:", validFace);
      setIsValid(validFace);
    } catch (err) {
      console.log(err);

    }
  });

  const handleNoFaceDetected = Worklets.createRunOnJS(() => {
    setIsValid(false);
  });

  const isFaceFullyVisibleAndAccurate = (face: Face, frameWidth: number, frameHeight: number): boolean => {
    if (!face || !frameWidth || !frameHeight) {
      console.log("Missing face or frame data");
      return false;
    }

    const { bounds } = face;
    // const normalizedX = bounds.x / frameWidth;
    // const normalizedY = bounds.y / frameHeight;
    // const normalizedWidth = bounds.width / frameWidth;
    // const normalizedHeight = bounds.height / frameHeight;

    // const isFullyVisible = (
    //   normalizedX > 0.1 && 
    //   normalizedX + normalizedWidth < 0.9 &&
    //   normalizedY > 0.1 && 
    //   normalizedY + normalizedHeight < 0.9
    // );

    const isFacingCamera = (
      Math.abs(face.yawAngle) < 15 &&
      Math.abs(face.pitchAngle) < 15 &&
      Math.abs(face.rollAngle) < 15
    );

    const isLargeEnough = bounds.width > 100 && bounds.height > 100;

    console.log("Face validation:", {
  
      isFacingCamera,
      isLargeEnough,
      angles: {
        yaw: face.yawAngle,
        pitch: face.pitchAngle,
        roll: face.rollAngle
      }
    });

    return isFacingCamera && isLargeEnough;
  };

  const frameProcessor = useFrameProcessor((frame: Frame) => {
    'worklet';

    if (!isActive.current) return;
    if (frame.timestamp % 10 !== 0) return;
  
    const faces = detectFaces(frame);

    if(faces.length === 0) {
      handleNoFaceDetected();
      return;
    }

    if (faces.length === 1) {
      const face = faces[0];

      // Create a serializable version of the face data
      const serializableFace: any = {
        bounds: {
          x: face.bounds.x,
          y: face.bounds.y,
          width: face.bounds.width,
          height: face.bounds.height,
        },
        yawAngle: face.yawAngle,
        pitchAngle: face.pitchAngle,
        rollAngle: face.rollAngle,
        leftEyeOpenProbability: face.leftEyeOpenProbability,
        rightEyeOpenProbability: face.rightEyeOpenProbability,
        smilingProbability: face.smilingProbability,
      };

      // Only process if face meets minimum size requirements
      if (face.bounds.width > 100 && face.bounds.height > 100) {
        handleDetectedFaces(serializableFace, frame.width, frame.height);
      }
    }
  }, [handleDetectedFaces, detectFaces]);

  const submit = async () => {  
    const values = getValues();
    const personalId = await addPersonal(values);
    const res = await addRequest(personalId);
  };

  if (!device) {
    return (
      <Layout header={'Take A Photo'} description={''}>
        <View className="flex-1 justify-center items-center">
          <Text className="text-black/80 font-PoppinsRegular text-[15px]">
            Camera device not found
          </Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout header={'Take A Photo'} description={''}>
      <View className="flex-1 justify-between gap-7">
        <View className="flex-1 gap-7">
          <View className="flex bg-lightBlue-2 rounded-md gap-3 p-4">
            <Text className="text-black/80 font-PoppinsRegular text-[15px]">
              Please ensure the photo is clear.
            </Text>
              <View className="flex h-[200px] rounded-md bg-white border border-gray-200 items-center justify-center">
                <Camera
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={isActive.current}
                  frameProcessor={frameProcessor}
                  pixelFormat="yuv"
                />
              </View>
              {isValid ? (<Text>Valid face detected</Text>): (
                <Text>No valid face detected</Text>
              )}
          </View>
        </View>

        <View>
          <Button
            onPress={submit}
            className="bg-primaryBlue native:h-[57px]"
          >
            <Text className="text-white font-bold text-[16px]">Submit</Text>
          </Button>
        </View>
      </View>
    </Layout>
  );
}