import "@/global.css";
import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import { CAVIDCamHandle, CaptureAndVerifyID } from "./CaptureAndVerifyID";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshCcw } from "@/lib/icons/RefreshCcw";

export default function ScanID({ params }: { params: Record<string, any> }) {

  // State management
  const [isScanning, setIsScanning] = React.useState<boolean>(false);
  const [scanStatus, setScanStatus] = React.useState<string>("");
  const [showInstructions, setShowInstructions] = React.useState<boolean>(true);
  const [showLandscapePrompt, setShowLandscapePrompt] = React.useState<boolean>(true);
  const [captureAttempts, setCaptureAttempts] = React.useState<number>(0);
  
  const cameraRef = React.useRef<CAVIDCamHandle>(null);
  const instructionsAnim = React.useRef(new Animated.Value(1)).current;
  const landscapePromptAnim = React.useRef(new Animated.Value(1)).current;

  // Auto-hide instructions after first capture attempt
  React.useEffect(() => {
    if (captureAttempts > 0 && showInstructions) {
      Animated.timing(instructionsAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowInstructions(false));
    }
  }, [captureAttempts, showInstructions]);

  // Auto-hide landscape prompt after 5 seconds or first capture
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (showLandscapePrompt) {
        Animated.timing(landscapePromptAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowLandscapePrompt(false));
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (captureAttempts > 0 && showLandscapePrompt) {
      Animated.timing(landscapePromptAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowLandscapePrompt(false));
    }
  }, [captureAttempts, showLandscapePrompt]);

  const attemptIDCapture = React.useCallback(async () => {
    if (!cameraRef.current || isScanning) {
      return;
    }

    setIsScanning(true);
    setCaptureAttempts(prev => prev + 1);
    setScanStatus("Analyzing your ID...");

    try {
      const matched = await cameraRef.current.capturePhoto();
      if (matched) {
        setScanStatus("✅ ID verified successfully!");
        setTimeout(() => {
          params?.next(matched);
        }, 1000);
      } else {
        setScanStatus("❌ Could not verify ID. Please try again.");
        setTimeout(() => {
          setScanStatus("");
        }, 3000);
      }
    } catch (error) {
      setScanStatus("❌ Something went wrong. Please try again.");
      setTimeout(() => {
        setScanStatus("");
      }, 3000);
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, params]);

  const getStatusColor = () => {
    if (scanStatus.includes("✅")) return "bg-green-600";
    if (scanStatus.includes("❌")) return "bg-red-600";
    return "bg-blue-600";
  };

  const dismissLandscapePrompt = () => {
    Animated.timing(landscapePromptAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowLandscapePrompt(false));
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1">
        {/* Camera Section */}
        <View className="flex-1 relative">
          <CaptureAndVerifyID ref={cameraRef} />

          {/* Landscape Orientation Prompt */}
          {showLandscapePrompt && (
            <Animated.View 
              style={{ opacity: landscapePromptAnim }}
              className="absolute top-20 left-0 right-0 items-center z-10"
            >
              <View className="px-4 py-3">
                <View className="flex-row items-center justify-center mb-1 gap-2">
                  <RefreshCcw size={16} className="text-white"/>
                  <Text className="text-white font-semibold text-sm">
                    Turn to Landscape
                  </Text>
                </View>
                <Text className="text-white text-center text-xs">
                  For best results, rotate your phone horizontally
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Status Overlay */}
          {scanStatus && (
            <View className="absolute left-6 right-6 items-center" style={{ top: 50 }}>
              <View className={`${getStatusColor()} rounded-xl px-6 py-4 max-w-sm`}>
                {isScanning && (
                  <View className="flex-row items-center justify-center mb-2">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white ml-2 font-medium">
                      Processing...
                    </Text>
                  </View>
                )}
                <Text className="text-white text-center text-sm font-medium">
                  {scanStatus}
                </Text>
              </View>
            </View>
          )}

          {/* Capture Button */}
          <View className="absolute bottom-2 left-0 right-0 items-center" style={{ bottom: 50 }}>
              <TouchableOpacity
                onPress={attemptIDCapture}
                disabled={isScanning}
                className={`w-16 h-16 rounded-full items-center justify-center ${
                  isScanning 
                    ? 'bg-gray-400' 
                    : scanStatus.includes("✅")
                      ? 'bg-green-600 active:bg-green-700'
                      : 'bg-blue-600 active:bg-blue-700'
                } shadow-lg`}
              >
                {isScanning && (
                  <ActivityIndicator size="small" color="white" />
                )}
              </TouchableOpacity>
          </View>    
        </View> 
      </View>
    </SafeAreaView>
  );
}