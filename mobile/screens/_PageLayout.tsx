import React from "react"
import { View, Text, TouchableOpacity, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface PageLayoutProps {
  children: React.ReactNode
  // Header configuration
  showHeader?: boolean
  headerTitle?: React.ReactNode
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  // Style customization
  contentPadding?: number
}

export default function PageLayout({
  children,
  showHeader = true,
  headerTitle,
  leftAction,
  rightAction,
  contentPadding = 16
}: PageLayoutProps) {
  // Responsive header height based on screen size
  const getResponsiveHeaderHeight = () => {
    if (screenWidth < 375) {
      // Small screens (iPhone SE, etc.)
      return 56
    } else if (screenWidth < 768) {
      // Mobile screens
      return 60
    } else {
      // Tablet screens
      return 72
    }
  }

  // Responsive font sizes
  const getResponsiveFontSize = () => {
    if (screenWidth < 375) {
      return 16
    } else if (screenWidth < 768) {
      return 18
    } else {
      return 20
    }
  }

  // Responsive padding
  const getResponsivePadding = () => {
    if (screenWidth < 375) {
      return 12
    } else if (screenWidth < 768) {
      return 16
    } else {
      return 20
    }
  }

  const responsiveHeaderHeight = getResponsiveHeaderHeight()
  const responsiveFontSize = getResponsiveFontSize()
  const responsivePadding = getResponsivePadding()

  return (
    <SafeAreaView className="flex-1">
      {showHeader && (
        <View
          className="border-none shadow-none"
          style={{
            height: responsiveHeaderHeight,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: responsivePadding,
            elevation: 2,
          }}
        >
          {/* Left Action */}
          {leftAction}
          {/* Header Title */}
          {headerTitle}
          {/* Right Action */}
          {rightAction}
        </View>
      )}

      {/* Content Area */}
      <View
        style={{
          flex: 1,
          paddingTop: showHeader ? responsivePadding : 0,
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  )
}