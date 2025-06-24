import React from "react"
import { Animated, Dimensions, Modal, ScrollView, TouchableOpacity, View, Text } from "react-native"
import { Ionicons } from '@expo/vector-icons'; 

export const SignupOptions = ({
  children,
  header,
  description,
  visible,
  onClose,
}: {
  header?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
}) => {
  const { height: screenHeight } = Dimensions.get("window")
  const slideAnim = React.useRef(new Animated.Value(screenHeight)).current

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 5,
        friction: 20,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  const handleClose = () => {
    onClose();
  }

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
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
          style={{
            transform: [{ translateY: slideAnim }],
            maxHeight: screenHeight * 0.85,
            elevation: 20,
          }}
        >
          <TouchableOpacity activeOpacity={1}>
            {/* Drawer Handle */}
            <View className="items-center py-4">
              <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>

            {/* Drawer Header */}
            <View className="px-6 pb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-PoppinsSemiBold text-gray-900">
                  {header}
                </Text>
                <TouchableOpacity 
                  onPress={handleClose}
                  className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <Text className="text-sm font-PoppinsRegular text-gray-600">
                {description}
              </Text>
            </View>

            {/* Drawer Content */}
            <ScrollView
              className="flex-1 px-6"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: screenHeight * 0.55 }}
            >
              {children}
            </ScrollView>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  )
}