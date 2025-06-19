import "@/global.css"
import type { ReactNode } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  View,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { router } from "expo-router"

// Get screen dimensions
const { width, height } = Dimensions.get("window")

// Responsive scaling function
const getResponsiveSize = (size: number) => {
  const scaleFactor = width / 375 // Base width
  const scaledSize = size * Math.min(scaleFactor, 1.2)
  return Math.round(scaledSize)
}

// Responsive sizes as numbers (for inline styles)
const responsiveSizes = {
  textXs: getResponsiveSize(12),
  textSm: getResponsiveSize(14),
  textBase: getResponsiveSize(16),
  textLg: getResponsiveSize(18),
  textXl: getResponsiveSize(20),
  text2xl: getResponsiveSize(22),
  text3xl: getResponsiveSize(24),

  spacing1: getResponsiveSize(4),
  spacing2: getResponsiveSize(8),
  spacing3: getResponsiveSize(12),
  spacing4: getResponsiveSize(16),
  spacing5: getResponsiveSize(20),
  spacing6: getResponsiveSize(24),
}

// Navigation button component
const NavigationButton = ({
  text,
  onPress,
  style = "default",
  icon,
}: {
  text: string
  onPress: () => void
  style?: "default" | "primary" | "danger" | "ghost"
  icon?: ReactNode
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      paddingHorizontal: responsiveSizes.spacing2,
      paddingVertical: responsiveSizes.spacing1,
    }

    switch (style) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: "#007AFF",
          borderRadius: responsiveSizes.spacing2,
          paddingHorizontal: responsiveSizes.spacing4,
          paddingVertical: responsiveSizes.spacing2,
        }
      case "danger":
        return {
          ...baseStyle,
          backgroundColor: "#FF3B30",
          borderRadius: responsiveSizes.spacing2,
          paddingHorizontal: responsiveSizes.spacing4,
          paddingVertical: responsiveSizes.spacing2,
        }
      case "ghost":
        return baseStyle
      default:
        return baseStyle
    }
  }

  const getTextStyle = () => {
    const baseStyle = {
      fontSize: responsiveSizes.textBase,
    }

    switch (style) {
      case "primary":
      case "danger":
        return {
          ...baseStyle,
          color: "white",
          fontFamily: "PoppinsMedium",
        }
      default:
        return {
          ...baseStyle,
          color: "black",
          fontFamily: "PoppinsRegular",
        }
    }
  }

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={getButtonStyle()}>
        <View className="flex-row items-center" style={{ gap: responsiveSizes.spacing1 }}>
          {icon}
          <Text style={getTextStyle()}>{text}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

// Loading component
const LoadingOverlay = ({ message = "Loading..." }: { message?: string }) => (
  <View className="absolute inset-0 bg-white/80 flex-1 justify-center items-center z-50">
    <ActivityIndicator size="large" color="#007AFF" />
    <Text
      className="text-gray-600 font-PoppinsRegular text-center"
      style={{
        fontSize: responsiveSizes.textSm,
        marginTop: responsiveSizes.spacing2,
      }}
    >
      {message}
    </Text>
  </View>
)

// Error component
const ErrorDisplay = ({
  title = "Something went wrong",
  message,
  onRetry,
  onDismiss,
}: {
  title?: string
  message?: string
  onRetry?: () => void
  onDismiss?: () => void
}) => (
  <View className="flex-1 justify-center items-center" style={{ paddingHorizontal: responsiveSizes.spacing6 }}>
    <Text
      className="font-PoppinsSemiBold text-red-600 text-center"
      style={{
        fontSize: responsiveSizes.textXl,
        marginBottom: responsiveSizes.spacing2,
      }}
    >
      {title}
    </Text>
    {message && (
      <Text
        className="font-PoppinsRegular text-gray-600 text-center"
        style={{
          fontSize: responsiveSizes.textSm,
          marginBottom: responsiveSizes.spacing4,
        }}
      >
        {message}
      </Text>
    )}
    <View className="flex-row" style={{ gap: responsiveSizes.spacing3 }}>
      {onRetry && (
        <TouchableWithoutFeedback onPress={onRetry}>
          <View
            className="bg-blue-500 rounded-lg"
            style={{
              paddingHorizontal: responsiveSizes.spacing6,
              paddingVertical: responsiveSizes.spacing3,
            }}
          >
            <Text className="text-white font-PoppinsMedium">Retry</Text>
          </View>
        </TouchableWithoutFeedback>
      )}
      {onDismiss && (
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View
            className="border border-gray-300 rounded-lg"
            style={{
              paddingHorizontal: responsiveSizes.spacing6,
              paddingVertical: responsiveSizes.spacing3,
            }}
          >
            <Text className="text-gray-700 font-PoppinsMedium">Dismiss</Text>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  </View>
)

export interface ScreenLayoutProps {
  children: ReactNode

  // Header Configuration
  header?: string | ReactNode
  description?: string | ReactNode
  headerAlign?: "left" | "center" | "right"
  headerComponent?: ReactNode

  // Navigation Configuration
  showNavigation?: boolean
  showBackButton?: boolean
  showExitButton?: boolean
  backButtonText?: string
  exitButtonText?: string
  backButtonStyle?: "default" | "primary" | "danger" | "ghost"
  exitButtonStyle?: "default" | "primary" | "danger" | "ghost"
  onBackPress?: () => void
  onExitPress?: () => void
  customLeftAction?: ReactNode
  customRightAction?: ReactNode
  headerBetweenAction?: ReactNode
  customNavigation?: ReactNode

  // Layout Configuration
  scrollable?: boolean
  keyboardAvoiding?: boolean
  fullScreen?: boolean
  contentPadding?: "none" | "small" | "medium" | "large"
  backgroundColor?: string

  // Safe Area Configuration
  safeAreaEdges?: ("top" | "bottom" | "left" | "right")[]

  // Status Bar Configuration
  statusBarStyle?: "default" | "light-content" | "dark-content"
  statusBarBackgroundColor?: string

  // State Management
  loading?: boolean
  loadingMessage?: string
  error?: {
    title?: string
    message?: string
    onRetry?: () => void
    onDismiss?: () => void
  }

  // Footer Configuration
  footer?: ReactNode
  stickyFooter?: boolean

  // Floating Elements
  floatingElement?: ReactNode

  // Scroll Configuration
  scrollViewProps?: any
  contentContainerStyle?: any

  // Animation
  animationType?: "none" | "slide" | "fade"

  // Theme
  theme?: "light" | "dark" | "auto"

  // Accessibility
  accessibilityLabel?: string
  testID?: string
}

export default function ScreenLayout({
  children,

  // Header Configuration
  header,
  description,
  headerAlign = "center",
  headerComponent,

  // Navigation Configuration
  showNavigation = true,
  showBackButton = true,
  showExitButton = true,
  backButtonText = "Back",
  exitButtonText = "Exit",
  backButtonStyle = "default",
  exitButtonStyle = "default",
  onBackPress,
  onExitPress,
  customLeftAction,
  customRightAction,
  headerBetweenAction,
  customNavigation,

  // Layout Configuration
  scrollable = true,
  keyboardAvoiding = true,
  fullScreen = false,
  contentPadding = "large",
  backgroundColor = "bg-white",

  // Safe Area Configuration
  safeAreaEdges = ["top", "bottom", "left", "right"],

  // Status Bar Configuration
  statusBarStyle = "dark-content",
  statusBarBackgroundColor,

  // State Management
  loading = false,
  loadingMessage,
  error,

  // Footer Configuration
  footer,
  stickyFooter = false,

  // Floating Elements
  floatingElement,

  // Scroll Configuration
  scrollViewProps = {},
  contentContainerStyle = {},

  // Accessibility
  accessibilityLabel,
  testID,
}: ScreenLayoutProps) {
  // Handle back press
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress()
    } else {
      router.back()
    }
  }

  // Handle exit press
  const handleExitPress = () => {
    if (onExitPress) {
      onExitPress()
    } else {
      router.push("/")
    }
  }

  // Get content padding as inline style
  const getContentPadding = () => {
    switch (contentPadding) {
      case "none":
        return {}
      case "small":
        return { padding: responsiveSizes.spacing2 }
      case "large":
        return { padding: responsiveSizes.spacing5 }
      default:
        return { padding: responsiveSizes.spacing4 }
    }
  }

  // Get header alignment
  const getHeaderAlignment = () => {
    switch (headerAlign) {
      case "center":
        return "text-center"
      case "right":
        return "text-right"
      default:
        return "text-left"
    }
  }

  // Main content component
  const MainContent = () => (
    <View className="flex-1 pt-1" style={fullScreen ? {} : getContentPadding()}>
      {/* Custom Header Component */}
      {headerComponent && headerComponent}

      {/* Default Header */}
      {!headerComponent && (header || description) && (
        <View style={{ marginBottom: responsiveSizes.spacing2 }}>
          {header && (
            <View className={getHeaderAlignment()}>
              {typeof header === "string" ? (
                <Text
                  className="text-black font-PoppinsSemiBold"
                  style={{
                    fontSize: responsiveSizes.text2xl,
                    marginBottom: responsiveSizes.spacing2,
                  }}
                >
                  {header}
                </Text>
              ) : (
                header
              )}
            </View>
          )}

          {description && (
            <View className={getHeaderAlignment()}>
              {typeof description === "string" ? (
                <Text
                  className="text-black font-PoppinsRegular opacity-70"
                  style={{
                    fontSize: responsiveSizes.textSm,
                  }}
                >
                  {description}
                </Text>
              ) : (
                description
              )}
            </View>
          )}
        </View>
      )}

      {/* Error Display */}
      {error && (
        <ErrorDisplay title={error.title} message={error.message} onRetry={error.onRetry} onDismiss={error.onDismiss} />
      )}

      {/* Main Content */}
      {!error && children}
    </View>
  )

  // Wrapper component based on scrollable prop
  const ContentWrapper = ({ children: wrapperChildren }: { children: ReactNode }) => {
    if (!scrollable) {
      return <View className="flex-1">{wrapperChildren}</View>
    }

    return (
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          ...contentContainerStyle,
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        {...scrollViewProps}
      >
        {wrapperChildren}
      </ScrollView>
    )
  }

  // Keyboard avoiding wrapper
  const KeyboardWrapper = ({ children: keyboardChildren }: { children: ReactNode }) => {
    if (!keyboardAvoiding) {
      return <>{keyboardChildren}</>
    }

    return (
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {keyboardChildren}
      </KeyboardAvoidingView>
    )
  }

  return (
    <SafeAreaView
      className={`flex-1 ${backgroundColor}`}
      edges={safeAreaEdges}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {/* Status Bar */}
      <StatusBar barStyle={statusBarStyle} backgroundColor={statusBarBackgroundColor} />

      <KeyboardWrapper>
        {/* Custom Navigation */}
        {customNavigation && customNavigation}

        {/* Default Navigation */}
        {!customNavigation && showNavigation && (
          <View
            className="flex-row justify-between items-center"
            style={{
              paddingHorizontal: responsiveSizes.spacing2,
              paddingVertical: responsiveSizes.spacing4,
            }}
          >
            {/* Left Action */}
            {customLeftAction ? (
              customLeftAction
            ) : showBackButton ? (
              <NavigationButton text={backButtonText} onPress={handleBackPress} style={backButtonStyle} />
            ) : (
              <View />
            )}

            {/* Right Action */}
            {headerBetweenAction && (
              headerBetweenAction
            )}
            {/* Right Action */}
            {customRightAction ? (
              customRightAction
            ) : showExitButton ? (
              <NavigationButton text={exitButtonText} onPress={handleExitPress} style={exitButtonStyle} />
            ) : (
              <View />
            )}
          </View>
        )}

        <ContentWrapper>
          <MainContent />

          {/* Non-sticky Footer */}
          {footer && !stickyFooter && (
            <View style={{ marginTop: responsiveSizes.spacing4 }}>{footer}</View>
          )}
        </ContentWrapper>

        {/* Sticky Footer */}
        {footer && stickyFooter && (
          <View
            className="border-t border-gray-100"
            style={{
              paddingHorizontal: responsiveSizes.spacing4,
              paddingVertical: responsiveSizes.spacing3,
            }}
          >
            {footer}
          </View>
        )}
      </KeyboardWrapper>

      {/* Floating Element */}
      {floatingElement && (
        <View
          className="absolute z-40"
          style={{
            bottom: responsiveSizes.spacing4,
            right: responsiveSizes.spacing4,
          }}
        >
          {floatingElement}
        </View>
      )}

      {/* Loading Overlay */}
      {loading && <LoadingOverlay message={loadingMessage} />}
    </SafeAreaView>
  )
}
