import { X } from "@/lib/icons/X";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import React, { useCallback, RefObject, useMemo } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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