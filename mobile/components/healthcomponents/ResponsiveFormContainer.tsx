import React from "react";
import { ScrollView, View, useWindowDimensions, ViewStyle, ScrollViewProps } from "react-native";

interface ResponsiveFormContainerProps {
  children: React.ReactNode;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: ViewStyle;
}

export function ResponsiveFormContainer({ 
  children, 
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
}: ResponsiveFormContainerProps) {
  const { width } = useWindowDimensions();

  // Responsive breakpoints
  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width < 768;
  const isLargeDevice = width >= 768;

  // Dynamic sizing
  const containerPadding = isLargeDevice ? 32 : isMediumDevice ? 20 : 16;
  const verticalPadding = isLargeDevice ? 32 : 24;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      contentContainerStyle={{
        paddingBottom: isLargeDevice ? 32 : 24,
        paddingHorizontal: isLargeDevice ? 40 : 0,
        ...contentContainerStyle,
      }}
    >
      <View style={{ paddingHorizontal: containerPadding, paddingVertical: verticalPadding }}>
        {children}
      </View>
    </ScrollView>
  );
}

// Hook for responsive sizing values
export function useResponsiveForm() {
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width < 768;
  const isLargeDevice = width >= 768;

  return {
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    // Layout
    containerPadding: isLargeDevice ? 32 : isMediumDevice ? 20 : 16,
    verticalPadding: isLargeDevice ? 32 : 24,
    maxWidth: isLargeDevice ? 600 : undefined,
    // Input sizing
    inputHeight: isSmallDevice ? 44 : 48,
    iconSize: isSmallDevice ? 18 : 20,
    // Typography
    fontSize: isSmallDevice ? 14 : 16,
    headingSize: isSmallDevice ? 15 : 16,
    smallTextSize: isSmallDevice ? 11 : 12,
    bodyTextSize: isSmallDevice ? 12 : 14,
    // Spacing
    marginBottom: isSmallDevice ? 16 : 20,
    sectionMargin: isSmallDevice ? 20 : 24,
    cardPadding: isSmallDevice ? 12 : 16,
    buttonPadding: isSmallDevice ? 12 : 16,
    // Button
    minButtonHeight: 48,
    buttonLayout: isLargeDevice ? 'row' : 'column' as 'row' | 'column',
  };
}

// Centered content wrapper for large screens
export function FormContentWrapper({ children }: { children: React.ReactNode }) {
  const { isLargeDevice } = useResponsiveForm();

  return (
    <View
      style={{
        maxWidth: isLargeDevice ? 600 : '100%',
        alignSelf: isLargeDevice ? 'center' : 'stretch',
        width: isLargeDevice ? '100%' : 'auto',
      }}
    >
      {children}
    </View>
  );
}
