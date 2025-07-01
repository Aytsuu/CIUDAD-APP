import React from 'react';
import { View } from 'react-native';
import { AntDesign, MaterialIcons, FontAwesome, FontAwesome6, Feather } from '@expo/vector-icons';

interface IconSymbolProps {
  size: number;
  name: string;
  color: string;
}

export const IconSymbol: React.FC<IconSymbolProps> = ({ size, name, color }) => {
  const renderIcon = () => {
    // Parse the icon name to determine which icon library to use
    if (name.includes('feather')) {
      const iconName = name.replace('.feather', '') as keyof typeof Feather.glyphMap;
      return <Feather name={iconName} size={size} color={color} />;
    } else if (name.includes('FontAwesome6')) {
      const iconName = name.replace('.FontAwesome6', '') as keyof typeof FontAwesome6.glyphMap;
      return <FontAwesome6 name={iconName} size={size} color={color} />;
    } else if (name.includes('FontAwesome')) {
      const iconName = name.replace('.FontAwesome', '') as keyof typeof FontAwesome.glyphMap;
      return <FontAwesome name={iconName} size={size} color={color} />;
    } else if (name.includes('MaterialIcons')) {
      const iconName = name.replace('.MaterialIcons', '') as keyof typeof MaterialIcons.glyphMap;
      return <MaterialIcons name={iconName} size={size} color={color} />;
    } else {
      // Default to AntDesign
      const iconName = name as keyof typeof AntDesign.glyphMap;
      return <AntDesign name={iconName} size={size} color={color} />;
    }
  };

  return <View>{renderIcon()}</View>;
}; 