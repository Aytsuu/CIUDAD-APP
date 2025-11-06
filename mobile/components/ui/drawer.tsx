import { X } from "@/lib/icons/X";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import React, { useCallback, RefObject, useMemo } from "react";
import { View, TouchableOpacity, Text, Animated, Dimensions, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const Drawer = ({
  children,
  header,
  description,
  visible,
  onClose,
  showCloseButton = true,
  showHeaderSpacing = true,
}: {
  header?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
  showHeaderSpacing?: boolean;
}) => {
  const { height: screenHeight } = Dimensions.get("window");
  const slideAnim = React.useRef(new Animated.Value(screenHeight)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 5,
        friction: 20,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => onClose();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity
        className="flex-1 bg-black/50"
        activeOpacity={1}
        onPress={handleClose}
      >
        {/* Drawer Container */}
        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl flex-1"
          style={{
            transform: [{ translateY: slideAnim }],
            maxHeight: screenHeight * 0.85,
            elevation: 20,
          }}
        >
          {/* Remove the TouchableOpacity wrapper that was blocking scroll events */}
          <View className="flex-1">
            {/* Drawer Handle */}
            <View className="items-center py-4">
              <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>
            
            {/* Drawer Header */}
            {(header || description) && (
              <View className="px-6 mb-4">
                <View
                  className={showHeaderSpacing ? "flex-row justify-between items-center mb-2" : "mb-2"}
                >
                  <Text className="text-lg font-PoppinsSemiBold text-gray-900">
                    {header}
                  </Text>

                  {showCloseButton && (
                    <TouchableOpacity
                      onPress={handleClose}
                      className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                    >
                      <Ionicons name="close" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  )}
                </View>

                {description && (
                  <Text className="text-sm font-PoppinsRegular text-gray-600">
                    {description}
                  </Text>
                )}
              </View>
            )}

            {/* Drawer Content */}
            {children}
            </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// Drawer Trigger Component
export const DrawerTrigger = ({
  bottomSheetRef,
  children,
}: {
  bottomSheetRef: RefObject<BottomSheet | null>;
  children: React.ReactNode;
}) => {
  const handleOpen = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, [bottomSheetRef]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleOpen}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {children}
    </TouchableOpacity>
  );
};

// Drawer View Component
export const DrawerView = ({
  bottomSheetRef,
  index = -1,
  enablePanDownToClose = true,
  customHeader = false,
  removeBackdrop = false,
  title,
  description,
  children,
  snapPoints = ["25", "70%"]
}: {
  bottomSheetRef: RefObject<BottomSheet | null>;
  index?: number
  removeBackdrop?: boolean
  enablePanDownToClose?: boolean
  snapPoints?: any,
  customHeader?: boolean;
  title?: string;
  description?: string;
  children: React.ReactNode;
}) => {
  const insets = useSafeAreaInsets()

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
  }, [bottomSheetRef]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      enablePanDownToClose={enablePanDownToClose}
      snapPoints={snapPoints}
      index={index}
      backdropComponent={removeBackdrop ? () => (<></>) : renderBackdrop}
      bottomInset={insets.bottom}
      backgroundStyle={{
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#D1D5DB",
        width: 40,
        height: 4,
      }}
    >
      <View style={{ flex: 1, padding: 8 }}>
        <View className="flex-1 px-4">
          {!customHeader && (
            <View className="mb-4">
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-lg font-semibold text-gray-900">
                    {title}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={20} className="text-gray-600" />
                </TouchableOpacity>
              </View>
              <Text className="text-sm text-gray-600">{description}</Text>
            </View>
          )}
          {children}
        </View>
      </View>
    </BottomSheet>
  );
}