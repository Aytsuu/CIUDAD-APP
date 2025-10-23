import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
} from "react-native";
import { Trash2, Eye, X, Gavel } from "lucide-react-native";

interface ComplaintActionsDrawerProps {
  visible: boolean;
  onClose: () => void;
  onTrackRequest: () => void;
  onSummon: () => void;
  onDelete: () => void;
  complaintTitle?: string;
}

const ComplaintActionsDrawer: React.FC<ComplaintActionsDrawerProps> = ({
  visible,
  onClose,
  onTrackRequest,
  onSummon,
  onDelete,
  complaintTitle = "Complaint",
}) => {
  const translateY = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy > 5 && Math.abs(gestureState.dx) < 50;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        onClose();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    },
  });

  const handleActionPress = (action: () => void) => {
    onClose();
    // Small delay to allow drawer to close before executing action
    setTimeout(action, 150);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50">
        {/* Background touchable to close */}
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Drawer */}
        <Animated.View
          style={{
            transform: [{ translateY }],
          }}
          className="bg-white rounded-t-3xl"
          {...panResponder.panHandlers}
        >
          {/* Drag Handle */}
          <View className="items-center py-4">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Header */}
          <View className="px-6 pb-4 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  Complaint Actions
                </Text>
                <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
                  {complaintTitle}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center ml-3"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Actions */}
          <View className="p-6 pb-8">
            {/* Track Request */}
            <TouchableOpacity
              className="flex-row items-center p-4 rounded-xl bg-blue-50 mb-3"
              onPress={() => handleActionPress(onTrackRequest)}
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
                <Eye size={20} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-blue-900 font-semibold text-base">
                  Track Request
                </Text>
                <Text className="text-blue-700 text-sm mt-1">
                  View complaint details and status
                </Text>
              </View>
            </TouchableOpacity>

            {/* Summon */}
            <TouchableOpacity
              className="flex-row items-center p-4 rounded-xl bg-yellow-50 mb-3"
              onPress={() => handleActionPress(onSummon)}
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-amber-100 rounded-full items-center justify-center mr-4">
                <Gavel size={24} color="#D97706" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  Request for Summon
                </Text>
                <Text className="text-sm text-gray-600">
                  Official summons for dispute resolution
                </Text>
              </View>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              className="flex-row items-center p-4 rounded-xl bg-red-50"
              onPress={() => handleActionPress(onDelete)}
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
                <Trash2 size={20} color="#DC2626" />
              </View>
              <View className="flex-1">
                <Text className="text-red-900 font-semibold text-base">
                  Delete Complaint
                </Text>
                <Text className="text-red-700 text-sm mt-1">
                  Permanently remove this complaint
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Safe area padding for devices with home indicator */}
          <View style={{ height: 20 }} />
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ComplaintActionsDrawer;
