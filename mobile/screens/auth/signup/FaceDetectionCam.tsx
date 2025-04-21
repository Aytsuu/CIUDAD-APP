import React, { forwardRef, useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, Text, View } from 'react-native';
import { Camera, Frame, useCameraDevice, PhotoFile, useFrameProcessor } from 'react-native-vision-camera';
import { Face, useFaceDetector, FaceDetectionOptions } from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core';

type Props = {
  isValid: boolean;
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
};

export type FaceDetectionCamHandle = {
  capturePhoto: () => Promise<PhotoFile | null>;
};

export const FaceDetectionCam = forwardRef<FaceDetectionCamHandle, Props>((props, ref) => {
  const { isValid, setIsValid } = props;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isActive = React.useRef<boolean>(true);
  const lastDetectionTime = React.useRef(0);
  const device = useCameraDevice('front');
  const camera = React.useRef<Camera>(null);
  const circleSize = React.useRef(Math.min(screenWidth * 0.8, screenHeight * 0.5)).current;
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Request camera permission
  useEffect(() => {
    const requestCameraPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    };

    requestCameraPermission();
  }, []);

  const { detectFaces } = useFaceDetector({
    performanceMode: 'accurate',
    landmarkMode: 'all',
    contourMode: 'none',
    classificationMode: 'all',
    minFaceSize: 0.5,
    trackingEnabled: true
  } as FaceDetectionOptions);

  React.useEffect(() => {
    const detectionInterval = setInterval(() => {
      // Force re-initialization every 10 seconds
      isActive.current = true;
    }, 10000);
  
    return () => {
      isActive.current = false;
      clearInterval(detectionInterval);
    };
  }, []);
  
  const handleDetectedFaces = Worklets.createRunOnJS((serializableFace: any) => {
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

      const validFace = isFaceFullyVisibleAndAccurate(face);
      setIsValid(validFace);
    } catch (err) {
      console.log(err);
    }
  });

  const handleNoFaceDetected = Worklets.createRunOnJS(() => {
    setIsValid(false);
  });

  const isFaceFullyVisibleAndAccurate = (face: any): boolean => {
    if (!face) return false;
  
    const { bounds, width: frameWidth, height: frameHeight } = face;
    
    const scaleX = screenWidth / frameWidth;
    const scaleY = screenHeight / frameHeight;

    // Convert face bounds to screen coordinates
    const faceScreenX = face.bounds.x * scaleX + (face.bounds.width * scaleX) / 2;
    const faceScreenY = face.bounds.y * scaleY + (face.bounds.height * scaleY) / 2;
    
    const isCentered = (
      Math.abs(faceScreenX - screenWidth / 2) < screenWidth * 0.25 &&
      Math.abs(faceScreenY - screenHeight / 2) < screenHeight * 0.25
    );
    
    // Check face orientation (not slanted)
    const isGoodOrientation = (
      Math.abs(face.yawAngle) < 10 &&  // More strict yaw angle
      Math.abs(face.pitchAngle) < 10 &&  // More strict pitch
      Math.abs(face.rollAngle) < 5  // Very strict roll (no head tilt)
    );
  
    // Check face size 
    const isLargeEnough = bounds.width > 100 && bounds.height > 100;

    // Check facial features
    const eyesVisible = (
      face.leftEyeOpenProbability > 0.7 &&
      face.rightEyeOpenProbability > 0.7
    );
  
    // Enhanced mouth detection
    const mouthDetected = (
      face.mouthBottomPosition !== undefined &&
      face.mouthLeftPosition !== undefined &&
      face.mouthRightPosition !== undefined
    );
  
    return (
      isGoodOrientation &&
      isCentered &&
      isLargeEnough &&
      eyesVisible &&
      mouthDetected
    );
  };

  const frameProcessor = useFrameProcessor((frame: Frame) => {
    'worklet';

    if (!isActive.current) return;
    if (frame.timestamp % 3 !== 0) return;
  
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
        mouthBottomPosition: face.landmarks?.MOUTH_BOTTOM,
        mouthLeftPosition: face.landmarks?.MOUTH_LEFT,
        mouthRightPosition: face.landmarks?.MOUTH_RIGHT,
        width: frame.width,
        height: frame.height
      };

      // Only process if face meets minimum size requirements
      if (face.bounds.width > 100 && face.bounds.height > 100) {
        handleDetectedFaces(serializableFace);
      }
    }
  }, [handleDetectedFaces, detectFaces]);

  // Expose capturePhoto via ref
  React.useImperativeHandle(ref, () => ({
    capturePhoto: async () => {
      if (camera.current && isValid) {
        try {
          const photo = await camera.current.takePhoto({
            flash: 'off',
            enableShutterSound: false,
          });

          // Verify the captured photo
          if (!photo.path || photo.path.length === 0) {
            throw new Error('Invalid photo path');
          }

          return photo;
        } catch (error) {
          console.error('Failed to capture photo:', error);
          return null;
        }
      }
      return null;
    }
  }));

  if (!device) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-black/80 font-PoppinsRegular text-[15px]">
          Camera device not found
        </Text>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-black/80 font-PoppinsRegular text-[15px]">
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-black/80 font-PoppinsRegular text-[15px]">
          Camera permission not granted
        </Text>
      </View>
    );
  }

  return (
    <View style={{width: circleSize, height: circleSize }} className={` rounded-full ${isValid ? 'border-green-500' : 'border-red-500'}
                      border-4 bg-white items-center justify-center overflow-hidden mb-4`}
    >
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive.current}
        frameProcessor={frameProcessor}
        pixelFormat="yuv"
        photo={true}
        photoQualityBalance='quality'
        outputOrientation='device'
        enableZoomGesture={false}
        isMirrored={true}
      />
    </View>
  );
});