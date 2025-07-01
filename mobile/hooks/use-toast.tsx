"use client"

import { useState, useCallback } from "react"

export interface ToastConfig {
  message: string
  type?: "success" | "error" | "warning" | "info"
  duration?: number
  position?: "top" | "bottom"
}

export const useToast = () => {
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
    success: (message: string, duration?: number, position?: "top" | "bottom") =>
      showToast({ message, type: "success", duration, position }),
    error: (message: string, duration?: number, position?: "top" | "bottom") =>
      showToast({ message, type: "error", duration, position }),
    warning: (message: string, duration?: number, position?: "top" | "bottom") =>
      showToast({ message, type: "warning", duration, position }),
    info: (message: string, duration?: number, position?: "top" | "bottom") =>
      showToast({ message, type: "info", duration, position }),
  }

  return {
    toast,
    toastConfig,
    visible,
    hideToast,
  }
}
