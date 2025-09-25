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
  // Footer configuration
  footer?: React.ReactNode
  showFooter?: boolean
  footerBackgroundColor?: string
  // Style customization
  contentPadding?: number
  backgroundColor?: string
}

export default function PageLayout({
  children,
  showHeader = true,
  headerTitle,
  leftAction,
  rightAction,
  footer,
  showFooter = false,
  footerBackgroundColor = 'bg-white',
  backgroundColor = 'bg-transparent',
  showScrollIndicator = true,
  scrollIndicatorColor = 'bg-black/30',
  scrollIndicatorPosition = 'right',
}: PageLayoutProps) {
  // Responsive header height based on screen size
  const getResponsiveHeaderHeight = () => {
    if (screenWidth < 375) {
      // Small screens (iPhone SE, etc.)
      return 40
    } else if (screenWidth < 768) {
      // Mobile screens
      return 40
    } else {
      // Tablet screens
      return 60
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

  // Responsive footer height
  const getResponsiveFooterHeight = () => {
    if (screenWidth < 375) {
      return 80
    } else if (screenWidth < 768) {
      return 88
    } else {
      return 96
    }
  }

  const responsiveHeaderHeight = getResponsiveHeaderHeight()
  const responsiveFontSize = getResponsiveFontSize()
  const responsivePadding = getResponsivePadding()
  const responsiveFooterHeight = getResponsiveFooterHeight()

  // Determine if footer should be shown (either showFooter is true or footer content is provided)
  const shouldShowFooter = showFooter || !!footer

  return (
    <SafeAreaView className={`flex-1 ${backgroundColor} pt-4`}>
      {showHeader && (
        <View className={`${headerBackgroundColor}`}>
          <SafeAreaView edges={['top']} />
          <View
            className="border-none shadow-none"
            style={{
              height: responsiveHeaderHeight,
              position: 'relative',
              paddingHorizontal: responsivePadding,
              elevation: 2,
            }}
          >
            {/* Left and Right Actions Container */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '100%',
                zIndex: 1,
              }}
            >
              {/* Left Action */}
              <View style={{ alignItems: 'flex-start' }}>
                {leftAction}
              </View>
              
              {/* Right Action */}
              <View style={{ alignItems: 'flex-end' }}>
                {rightAction}
              </View>
            </View>

            {/* Absolutely Centered Title */}
            {headerTitle && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 0,
                  // Prevent title from interfering with touch events on actions
                  pointerEvents: 'none',
                }}
              >
                <View style={{ pointerEvents: 'auto' }}>
                  {headerTitle}
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Content Area */}
      <View
        style={{
          flex: 1,
          paddingTop: showHeader ? responsivePadding : 0,
          paddingBottom: shouldShowFooter ? responsivePadding : 0,
        }}
      >
        {children}
      </View>

        {/* Footer */}
        {shouldShowFooter && (
          <View
            className={`border-t border-gray-200 ${footerBackgroundColor}`}
            style={{
              minHeight: responsiveFooterHeight,
              paddingHorizontal: responsivePadding,
              paddingVertical: responsivePadding,
              justifyContent: 'center',
            }}
          >
            {footer}
          </View>
        )}

        {/* Floating Scroll Indicator */}
        {wrapScroll && showScrollIndicator && showScrollArrow && (
          <View style={getScrollIndicatorPositionStyles()}>
            <TouchableOpacity
              onPress={handleScrollIndicatorPress}
              className={`${scrollIndicatorColor} rounded-full`}
              style={{
                width: 45,
                height: 45,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              activeOpacity={1}
            >
              {/* Down Arrow Icon */}
              <ChevronDown size={26} className="text-white" />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  )
}