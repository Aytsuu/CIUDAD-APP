import { 
  StyleSheet, 
  Text, 
  View 
} from 'react-native'
import { 
  useEffect, 
  useState,
  useRef
} from 'react'
import {
  Camera,
  Frame,
  useCameraDevice,
  useFrameProcessor
} from 'react-native-vision-camera'
import { 
  Face,
  useFaceDetector,
  FaceDetectionOptions,
} from 'react-native-vision-camera-face-detector'
import { Worklets } from 'react-native-worklets-core'

export default function App() {
  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    // detection options
    performanceMode: 'fast',
    landmarkMode: 'all',
    contourMode: 'all',
    classificationMode: 'none',
    minFaceSize: 0.5,
  }).current

  const device = useCameraDevice('front')
  const { detectFaces } = useFaceDetector(faceDetectionOptions)

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission()
      console.log({ status })
    })()
  }, [device])

  const handleDetectedFaces = Worklets.createRunOnJS((faces: Face[], frame: Frame) => { 
    const validFaces = faces.filter(face => isFaceFullyVisibleAndAccurate(face, frame))
    if (validFaces.length > 0) {
      console.log('✅ Valid faces detected:', validFaces)
    } 
  })

  const isFaceFullyVisibleAndAccurate = (face: Face, frame: Frame): boolean => {
    // 1. Check if face bounds are within the frame (assuming frame is 0-1 normalized)
    const { bounds } = face

    const normalizedX = bounds.x / frame.width;
    const normalizedY = bounds.y / frame.height;
    const normalizedWidth = bounds.width / frame.width;
    const normalizedHeight = bounds.height / frame.height;

    const isFullyVisible = (
      normalizedX > 0.1 && normalizedX + normalizedWidth < 0.9 &&  // Not too close to edges
      normalizedY > 0.1 && normalizedY + normalizedHeight < 0.9
    )

    console.log({isFullyVisible: isFullyVisible})
  
    // 2. Check if face angles are within reasonable limits (looking roughly at camera)
    const isFacingCamera = (
      Math.abs(face.yawAngle) < 15 &&    // Not turned too far left/right
      Math.abs(face.pitchAngle) < 15 &&  // Not tilted too far up/down
      Math.abs(face.rollAngle) < 15      // Not tilted too far sideways
    )

    console.log({isFacingCamera: isFacingCamera})
  
    // 3. Optional: Check face size (adjust thresholds as needed)
    const isLargeEnough = bounds.width > 100 && bounds.height > 100
    console.log({isLargeEnough: isLargeEnough})
  
    return isFullyVisible && isFacingCamera && isLargeEnough
  }

  const frameProcessor = useFrameProcessor((frame: Frame) => {
    'worklet'
    const faces = detectFaces(frame)
    handleDetectedFaces(faces, frame)
  }, [handleDetectedFaces, detectFaces])

  return (
    <View style={{ flex: 1 }}>
      {!!device ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          pixelFormat="yuv"
        />
      ) : (
        <Text>No Device</Text>
      )}
    </View>
  )
}