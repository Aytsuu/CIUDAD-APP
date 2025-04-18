import React, { useEffect, useRef } from 'react';
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
  const isActive = useRef(true);
  const lastDetectionTime = useRef(0);
  const device = useCameraDevice('front');
  const { detectFaces } = useFaceDetector({
    performanceMode: 'fast',
    landmarkMode: 'all',
    contourMode: 'all',
    classificationMode: 'none',
    minFaceSize: 0.5,
  } as FaceDetectionOptions);

  useEffect(() => {
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
      console.log("Processing detected face...");
      
      // Reconstruct the face object with frame dimensions
      const face: Face = {
        ...serializableFace,
        bounds: {
          ...serializableFace.bounds,
          // Add any additional properties if needed
        },
      };

      const frame: Frame = {
        width: frameWidth,
        height: frameHeight,
        // Add other required Frame properties
      } as Frame;

      const validFace = isFaceFullyVisibleAndAccurate(face, frame);
      console.log("Face validity:", validFace);
    } catch (error) {
      console.error("Error processing face:", error);
    }
  });

  const isFaceFullyVisibleAndAccurate = (face: Face, frame: Frame): boolean => {
    if (!face || !frame) {
      console.log("Missing face or frame data");
      return false;
    }

    const { bounds } = face;
    console.log("Face bounds:", bounds);

    const normalizedX = bounds.x / frame.width;
    const normalizedY = bounds.y / frame.height;
    const normalizedWidth = bounds.width / frame.width;
    const normalizedHeight = bounds.height / frame.height;

    const isFullyVisible = (
      normalizedX > 0.1 && 
      normalizedX + normalizedWidth < 0.9 &&
      normalizedY > 0.1 && 
      normalizedY + normalizedHeight < 0.9
    );

    const isFacingCamera = (
      Math.abs(face.yawAngle) < 15 &&
      Math.abs(face.pitchAngle) < 15 &&
      Math.abs(face.rollAngle) < 15
    );

    const isLargeEnough = bounds.width > 100 && bounds.height > 100;

    console.log("Face validation:", {
      isFullyVisible,
      isFacingCamera,
      isLargeEnough,
      angles: {
        yaw: face.yawAngle,
        pitch: face.pitchAngle,
        roll: face.rollAngle
      }
    });

    return isFullyVisible && isFacingCamera && isLargeEnough;
  };

  const frameProcessor = useFrameProcessor((frame: Frame) => {
    'worklet';
    if (!isActive.current) return;
    
    if (frame.timestamp % 5 !== 0) return;
    
    const faces = detectFaces(frame);
    console.log(`Detected ${faces.length} faces in frame processor`);

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
            <TouchableWithoutFeedback>
              <View className="flex h-[200px] rounded-md bg-white border border-gray-200 items-center justify-center">
                <Camera
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={isActive.current}
                  frameProcessor={frameProcessor}
                  pixelFormat="yuv"
                />
              </View>
            </TouchableWithoutFeedback>
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