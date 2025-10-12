import { ChevronDown } from "@/lib/icons/ChevronDown"
import React, { useState, useRef, useCallback } from "react"
import { View, Text, TouchableOpacity, Dimensions, StatusBar, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface PageLayoutProps {
  children: React.ReactNode
  wrapScroll?: boolean
  // Header configuration
  showHeader?: boolean
  headerTitle?: React.ReactNode
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  headerBackgroundColor?: string
  // Footer configuration
  footer?: React.ReactNode
  showFooter?: boolean
  footerBackgroundColor?: string
  // Style customization
  contentPadding?: number
  backgroundColor?: string
  // Status bar configuration
  statusBarStyle?: 'default' | 'light-content' | 'dark-content'
  statusBarBackgroundColor?: string
  // Scroll indicator configuration
  showScrollIndicator?: boolean
  scrollIndicatorColor?: string
  scrollIndicatorPosition?: 'right' | 'center'
}

export default function PageLayout({
  children,
  wrapScroll = true,
  showHeader = true,
  headerTitle,
  leftAction,
  rightAction,
  headerBackgroundColor = 'bg-transparent',
  footer,
  showFooter = false,
  footerBackgroundColor = 'bg-white',
  backgroundColor = 'bg-transparent',
  showScrollIndicator = true,
  scrollIndicatorColor = 'bg-black/30',
  scrollIndicatorPosition = 'right',
}: PageLayoutProps) {
  const scrollViewRef = useRef<ScrollView>(null)
  const [isScrollable, setIsScrollable] = useState(false)
  const [showScrollArrow, setShowScrollArrow] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  // Responsive header height based on screen size
  const getResponsiveHeaderHeight = () => {
    if (screenWidth < 375) {
      return 60
    } else if (screenWidth < 768) {
      return 60
    } else {
      return 70
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

  // Determine if footer should be shown
  const shouldShowFooter = showFooter || !!footer

  // Handle scroll events
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent
    const currentScrollY = contentOffset.y
    const maxScroll = contentSize.height - layoutMeasurement.height
    
    setScrollY(currentScrollY)
    
    // Show arrow only if there's more content to scroll (not at bottom)
    const isNearBottom = currentScrollY >= maxScroll - 50 // 50px threshold
    setShowScrollArrow(maxScroll > 0 && !isNearBottom)
  }, [])

  // Handle content size change to determine if content is scrollable
  const handleContentSizeChange = useCallback((contentWidth: number, contentHeight: number) => {
    // Get the available height (screen height minus header and footer)
    let availableHeight = screenHeight
    // if (showHeader) {
    //   availableHeight -= responsiveHeaderHeight + 50 // Add some buffer for status bar
    // }
    // if (shouldShowFooter) {
    //   availableHeight -= responsiveFooterHeight
    // }

    const scrollable = contentHeight > availableHeight
    setIsScrollable(scrollable)
    setShowScrollArrow(scrollable)
  }, [showHeader, shouldShowFooter, responsiveHeaderHeight, responsiveFooterHeight])

  // Handle scroll indicator press - scroll down by viewport height
  const handleScrollIndicatorPress = useCallback(() => {
    if (scrollViewRef.current) {
      // Scroll down by approximately one screen height
      const scrollAmount = screenHeight
      const newScrollY = scrollY + scrollAmount

      scrollViewRef.current.scrollTo({
        y: newScrollY,
        animated: true,
      })
    }
  }, [scrollY])

  // Get scroll indicator position styles
  const getScrollIndicatorPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      bottom: shouldShowFooter ? responsiveFooterHeight + 20 : 30,
      zIndex: 1000,
    }

    if (scrollIndicatorPosition === 'center') {
      return {
        ...baseStyles,
        left: screenWidth / 2 - 25, // Center horizontally (assuming 50px width)
      }
    } else {
      return {
        ...baseStyles,
        right: responsivePadding + 10,
      }
    }
  }

  return (
    <View className={`flex-1 ${backgroundColor}`}>
      {/* Header that extends to status bar */}
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

      {/* Content Area with ScrollView */}
      <SafeAreaView 
        edges={showHeader ? ['bottom'] : ['bottom']} 
        className="flex-1"
      >
        {wrapScroll ? (
          <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{
            paddingTop: 0,
            paddingBottom: shouldShowFooter ? responsivePadding : 0,
          }}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        ) : (
          children
        )}

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
        {wrapScroll && showScrollIndicator && showScrollArrow && isScrollable && (
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