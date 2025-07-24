import type React from "react"
import { useState, isValidElement, cloneElement } from "react"
import { Modal, View, Text, TouchableOpacity, Animated, Dimensions } from "react-native"

interface ConfirmationModalProps {
  trigger: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  variant?: "default" | "destructive"
  onPress?: () => void
  loading?: boolean
  loadingMessage?: string
}

const { width } = Dimensions.get("window")

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  trigger,
  title,
  description,
  actionLabel = "Confirm",
  variant = "default",
  onPress,
  loading,
  loadingMessage,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [scaleValue] = useState(new Animated.Value(0))
  const [opacityValue] = useState(new Animated.Value(0))

  const openModal = () => {
    setIsVisible(true)
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 200,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const closeModal = () => {
    setIsVisible(false)
    scaleValue.setValue(0);
    opacityValue.setValue(0);
  }

  const handleConfirm = () => {
    onPress?.()
    closeModal()
  }

  const renderTrigger = () => {
    if (isValidElement(trigger)) {
      return cloneElement(trigger as React.ReactElement<any>, {
        onPress: () => {
          trigger.props?.onPress?.()
          openModal()
        },
      })
    }

    return <TouchableOpacity onPress={openModal}>{trigger}</TouchableOpacity>
  }

  return (
    <>
      {renderTrigger()}

      <Modal transparent visible={isVisible} animationType="none" onRequestClose={closeModal} statusBarTranslucent>
        <Animated.View 
          className="flex-1 bg-black/60 justify-center items-center"
          style={{ opacity: opacityValue }}
        >
          <TouchableOpacity 
            className="flex-1 justify-center items-center px-6" 
            activeOpacity={1} 
            onPress={closeModal}
          >
            <Animated.View
              className="bg-white rounded-3xl p-0 shadow-2xl"
              style={[
                {
                  transform: [{ scale: scaleValue }],
                  width: width - 48,
                  maxWidth: 400,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 20 },
                  shadowOpacity: 0.25,
                  shadowRadius: 25,
                  elevation: 20,
                }
              ]}
            >
              <TouchableOpacity activeOpacity={1}>
                {/* Icon container */}
                <View className="items-center pt-8 pb-4">
                  <View 
                    className={`w-16 h-16 rounded-full justify-center items-center ${
                      variant === "destructive" ? "bg-red-50" : "bg-blue-50"
                    }`}
                  >
                    <Text 
                      className={`text-3xl font-semibold ${
                        variant === "destructive" ? "text-red-500" : "text-blue-500"
                      }`}
                    >
                      {variant === "destructive" ? "⚠" : "?"}
                    </Text>
                  </View>
                </View>

                {/* Content */}
                <View className="px-6 pb-6 items-center">
                  <Text className="text-xl font-bold text-gray-900 mb-2 text-center leading-7">
                    {title}
                  </Text>
                  <Text className="text-base text-gray-500 text-center leading-6">
                    {description}
                  </Text>
                </View>

                {/* Actions */}
                <View className="flex-row px-6 pb-6 gap-3">
                  <TouchableOpacity 
                    className="flex-1 py-3.5 px-5 rounded-xl bg-gray-50 border border-gray-200 items-center justify-center" 
                    onPress={closeModal} 
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-700 font-semibold text-base">
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-1 py-3.5 px-5 rounded-xl items-center justify-center shadow-sm ${
                      variant === "destructive" ? "bg-red-500" : "bg-primaryBlue"
                    }`}
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-semibold text-base">
                      {actionLabel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </>
  )
}