"use client"

import type React from "react"
import { createContext, useContext, type ReactNode, useRef, useEffect } from "react"
import { useState, useCallback } from "react"
import { Animated, SafeAreaView, Text, TouchableOpacity, View } from "react-native"
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react-native"

interface ToastContextType {
  toast: {
    success: (message: string, duration?: number, position?: "top") => void
    error: (message: string, duration?: number, position?: "top") => void
    warning: (message: string, duration?: number, position?: "top") => void
    info: (message: string, duration?: number, position?: "top") => void
  }
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider")
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

interface ToastConfig {
  message: string
  type?: "success" | "error" | "warning" | "info"
  duration?: number
  position?: "top"
}

const useToast = () => {
  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null)
  const [visible, setVisible] = useState(false)

  const showToast = useCallback((config: ToastConfig) => {
    setToastConfig(config)
    setVisible(true)
  }, [])

  const hideToast = useCallback(() => {
    setVisible(false)
    setTimeout(() => {
      setToastConfig(null)
    }, 300)
  }, [])

  const toast = {
    success: (message: string, duration?: number, position?: "top") =>
      showToast({ message, type: "success", duration, position }),
    error: (message: string, duration?: number, position?: "top") =>
      showToast({ message, type: "error", duration, position }),
    warning: (message: string, duration?: number, position?: "top") =>
      showToast({ message, type: "warning", duration, position }),
    info: (message: string, duration?: number, position?: "top") =>
      showToast({ message, type: "info", duration, position }),
  }

  return {
    toast,
    toastConfig,
    visible,
    hideToast,
  }
}

const ToastIcon = ({ type }: { type?: string }) => {
  const iconProps = { size: 18, strokeWidth: 2 }

  switch (type) {
    case "success":
      return <CheckCircle {...iconProps} color="#059669" />
    case "error":
      return <XCircle {...iconProps} color="#DC2626" />
    case "warning":
      return <AlertTriangle {...iconProps} color="#D97706" />
    default:
      return <Info {...iconProps} color="#2563EB" />
  }
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toast, toastConfig, visible, hideToast } = useToast()

  const translateY = useRef(new Animated.Value(-100)).current
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    if (visible && toastConfig) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()

      const timer = setTimeout(() => {
        hideToastAnimated()
      }, toastConfig.duration || 4000)

      return () => clearTimeout(timer)
    }
  }, [visible, toastConfig])

  const hideToastAnimated = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast()
    })
  }

  const getToastStyles = (type?: string) => {
    const baseStyle = {
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginHorizontal: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
    }

    switch (type) {
      case "success":
        return {
          ...baseStyle,
          backgroundColor: "#F0FDF4",
          borderColor: "#BBF7D0",
        }
      case "error":
        return {
          ...baseStyle,
          backgroundColor: "#FEF2F2",
          borderColor: "#FECACA",
        }
      case "warning":
        return {
          ...baseStyle,
          backgroundColor: "#FFFBEB",
          borderColor: "#FED7AA",
        }
      default:
        return {
          ...baseStyle,
          backgroundColor: "#EFF6FF",
          borderColor: "#BFDBFE",
        }
    }
  }

  const getTextColor = (type?: string) => {
    switch (type) {
      case "success":
        return "#065F46"
      case "error":
        return "#991B1B"
      case "warning":
        return "#92400E"
      default:
        return "#1E40AF"
    }
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {visible && (
        <View 
          className="absolute inset-0" 
          pointerEvents="box-none"
          style={{ zIndex: 9999 }} // Ensure it's above other content
        >
          <SafeAreaView className="flex-1" pointerEvents="box-none">
            <View className="absolute left-0 right-0 top-10" pointerEvents="box-none">
              <Animated.View
                style={[
                  getToastStyles(toastConfig?.type),
                  {
                    transform: [{ translateY }, { scale }],
                    opacity,
                    marginTop: 10
                  },
                ]}
                pointerEvents="auto" // Allow touches on the toast itself
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-3">
                    <ToastIcon type={toastConfig?.type} />
                    <Text
                      className="ml-3 text-sm font-medium flex-1"
                      style={{ color: getTextColor(toastConfig?.type) }}
                      numberOfLines={2}
                    >
                      {toastConfig?.message}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={hideToastAnimated}
                    className="p-1 rounded-full"
                    style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
                  >
                    <X size={14} color={getTextColor(toastConfig?.type)} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </SafeAreaView>
        </View>
      )}
    </ToastContext.Provider>
  )
} 