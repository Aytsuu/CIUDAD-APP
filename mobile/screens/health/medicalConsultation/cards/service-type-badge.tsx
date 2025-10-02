// components/service-type-badge.tsx
import React from "react";
import { Text, View } from "react-native";

interface ServiceTypeBadgeProps {
  type: string;
  size?: "sm" | "md" | "lg";
}

export const ServiceTypeBadge: React.FC<ServiceTypeBadgeProps> = ({ 
  type, 
  size = "sm" 
}) => {
  const getServiceTypeColor = (serviceType: string) => {
    const colors: { [key: string]: { text: string; bg: string } } = {
      'Family Planning': { text: 'text-purple-700', bg: 'bg-purple-100' },
      'Medical Consultation': { text: 'text-blue-700', bg: 'bg-blue-100' },
      'Health Profiling': { text: 'text-green-700', bg: 'bg-green-100' },
      'Prenatal': { text: 'text-pink-700', bg: 'bg-pink-100' },
      'Consultation': { text: 'text-blue-700', bg: 'bg-blue-100' },
      'Emergency': { text: 'text-red-700', bg: 'bg-red-100' },
      'Follow-up': { text: 'text-green-700', bg: 'bg-green-100' },
      'Routine': { text: 'text-purple-700', bg: 'bg-purple-100' },
      'Vaccination': { text: 'text-yellow-700', bg: 'bg-yellow-100' },
      'default': { text: 'text-gray-700', bg: 'bg-gray-100' }
    };
    
    return colors[serviceType] || colors.default;
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-2 py-1";
      case "md":
        return "px-3 py-1.5";
      case "lg":
        return "px-4 py-2";
      default:
        return "px-2 py-1";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-xs";
      case "md":
        return "text-sm";
      case "lg":
        return "text-base";
      default:
        return "text-xs";
    }
  };

  const colors = getServiceTypeColor(type);
  const sizeClasses = getSizeClasses();
  const textSize = getTextSize();

  return (
    <View className={`rounded-full ${colors.bg} ${sizeClasses}`}>
      <Text className={`font-medium ${colors.text} ${textSize}`}>
        {type}
      </Text>
    </View>
  );
};

// Export the color function for standalone use if needed
export const getServiceTypeColor = (serviceType: string): string => {
  const colors: { [key: string]: string } = {
    'Family Planning': 'text-purple-700 bg-purple-100',
    'Medical Consultation': 'text-blue-700 bg-blue-100',
    'Health Profiling': 'text-green-700 bg-green-100',
    'Prenatal': 'text-pink-700 bg-pink-100',
    'Consultation': 'text-blue-700 bg-blue-100',
    'Emergency': 'text-red-700 bg-red-100',
    'Follow-up': 'text-green-700 bg-green-100',
    'Routine': 'text-purple-700 bg-purple-100',
    'Vaccination': 'text-yellow-700 bg-yellow-100',
    'default': 'text-gray-700 bg-gray-100'
  };
  
  return colors[serviceType] || colors.default;
};