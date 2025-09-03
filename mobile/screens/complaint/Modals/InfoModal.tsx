import { Modal, TouchableOpacity, View, Text } from "react-native";
import { Info } from "lucide-react-native";

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonColor?: string;
}

export const InfoModal = ({
  visible,
  onClose,
  title = "Information",
  description = "This is an information modal.",
  buttonText = "Got it",
  buttonColor = "bg-blue-600",
}: InfoModalProps) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          <View className=" flex flex-row justify-center gap-x-2 items-center mb-4">
            <Info color="#2563EB" />
            <Text className="text-lg font-semibold text-gray-900 text-center">
              {title}
            </Text>
          </View>

          <Text className="text-gray-600 text-center leading-6 mb-6">
            {description}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            className={`${buttonColor} py-3 rounded-xl`}
          >
            <Text className="text-white text-center font-medium text-base">
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
