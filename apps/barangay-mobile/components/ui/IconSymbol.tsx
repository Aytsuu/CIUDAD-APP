// This file is a fallback for using MaterialIcons on Android and web.
// import Svg, { Path } from 'react-native-svg';
// import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';


// import MyRequestLogo from './src/assets/images/Category1.png'; // ang icon choy tiwasa

// Add your SFSymbol to MaterialIcons mappings here.
  
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
    'house.fill': { library: 'MaterialIcons', name: 'home' },
    'paperplane.fill': { library: 'MaterialIcons', name: 'send' },
    'chevron.left.forwardslash.chevron.right': { library: 'MaterialIcons', name: 'code' },
    'chevron.right': { library: 'MaterialIcons', name: 'chevron-right' },
    'home.feather': { library: 'Feather', name: 'home' }, // Feather icon
    'grid.feather': { library: 'Feather', name: 'grid' }, // Feather icon
    'circle-user.FontAwesome6': { library: 'FontAwesome6', name: 'circle-user' }, // Feather icon


  } as const;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mapping = MAPPING[name];

  if (!mapping) {
    console.warn(`Icon "${name}" not found in MAPPING.`);
    return null; // Fallback if icon is not defined
  }

  const { library, name: iconName } = mapping;

  if (library === 'MaterialIcons') {
    return (
      <MaterialIcons
        color={color}
        size={size}
        name={iconName}
        style={style}
      />
    );
  } else if (library === 'Feather') {
    return <Feather color={color} size={size} name={iconName} style={style} />;
  }
  else if (library === 'FontAwesome6') {
    return <FontAwesome6 color={color} size={size} name={iconName} style={style} />;
  }

  return null;
}