import "@/global.css";
import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { FormSelect } from "@/components/ui/form/form-select";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { X } from "@/lib/icons/X";
import { useToastContext } from "@/components/ui/toast";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { CaptureAndVerifyID, CAVIDCamHandle } from "./CaptureAndVerifyID";
import PageLayout from "@/screens/_PageLayout";

const idOptions: { label: string; value: string }[] = [
  { label: "Driver's License", value: "Driver's License" },
  { label: "UMID", value: "UMID" },
  { label: "Philhealth ID", value: "Philhealth ID" },
  { label: "Passport", value: "Passport" },
  { label: "SSS ID", value: "SSS ID" },
  { label: "Voter's ID", value: "Voter's ID" },
  { label: "National ID", value: "National ID" },
  { label: "HDMF (Pag-ibig ID)", value: "HDMF (Pag-ibig ID)" },
  { label: "Other", value: "Other" },
];

export default function UploadID() {
  const router = useRouter();
  const { toast } = useToastContext();
  const { control, watch, reset } = useRegistrationFormContext();
  const [isScanning, setIsScanning] = React.useState<boolean>(false);
  const [scanStatus, setScanStatus] = React.useState<string>("");
  const [isCaptureMode, setIsCaptureMode] = React.useState<boolean>(true);
  const cameraRef = React.useRef<CAVIDCamHandle>(null);

  React.useEffect(() => {
    const subscription = watch((value, { name, type }) => {
    if (name === 'uploadIdSchema.selected') {
      const hasSelected = value.uploadIdSchema?.selected !== "";
      if (hasSelected) {
        console.log('camera mode');
        setIsCaptureMode(true);
      }
    }
  });
  
  return () => subscription.unsubscribe();
  }, [watch])

  const attemptIDCapture = React.useCallback(async () => {
    if (!cameraRef.current || isScanning) {
      return;
    }

    setIsScanning(true);
    setScanStatus("Scanning your ID card...");

    try {
      const matched = await cameraRef.current.capturePhoto();
      console.log(matched)
      if (matched) {
        router.push({
          pathname: "/(auth)/take-a-photo",
          params: {
            kyc_id: +matched
          }
        });
      } else {
        setScanStatus("Matching Failed.");
      }
    } finally {
      setIsScanning(false);
    }
  }, [isScanning]);

  const handleClose = () => {
    reset();
    router.replace("/(auth)");
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-gray-900 text-[13px]">
          Resident Records
        </Text>
      }
      rightAction={
        <ConfirmationModal
          title="Exit Registration"
          description="Are you sure you want to exit? Your progress will be lost."
          trigger={<X size={20} className="text-gray-700" />}
          variant="destructive"
          onPress={handleClose}
        />
      }
    >
      <View className="flex-1 justify-between gap-6 px-5">
        <View className="flex-1 gap-6">
            {/* Upload ID Section */}
            <View className="flex-1 relative">
              <CaptureAndVerifyID ref={cameraRef} />
              {/* Status Overlay */}
              {(isScanning || scanStatus) && (
                <View className="absolute bottom-32 left-0 right-0 items-center px-6">
                  <View className="bg-black bg-opacity-75 rounded-2xl px-6 py-4 max-w-sm">
                    {isScanning && (
                      <View className="flex-row items-center justify-center mb-2">
                        <ActivityIndicator size="small" color="white" />
                        <Text className="text-white ml-2 font-medium">
                          Scanning...
                        </Text>
                      </View>
                    )}

                    <Text className="text-white text-center text-sm">
                      {scanStatus}
                    </Text>
                  </View>
                </View>
              )}
            </View>
            <View className="mt-4 p-3 bg-blue-50 rounded-lg">
              <Text className="text-sm font-medium text-blue-900 mb-1">
                📸 Scanning Tips:
              </Text>
              <Text className="text-sm text-blue-800">
                • Ensure all text is clearly readable{"\n"}• Avoid glare and
                shadows{"\n"}• Include all four corners of the ID
              </Text>
            </View>

            {/* Bottom Controls */}
            <View className="flex-row justify-center items-center space-x-4">
              {/* Manual Capture Button */}
              <TouchableOpacity
                onPress={attemptIDCapture}
                className={`flex-1 max-w-xs py-4 rounded-2xl bg-blue-600 active:bg-blue-700}`}
              >
                <View className="flex-row items-center justify-center">
                  {isScanning ? (
                    <ActivityIndicator size="small" color="gray" />
                  ) : (
                    <Text className="text-white font-semibold text-lg">
                      Capture ID
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
        </View>
      </View>
    </PageLayout>
  );
}
