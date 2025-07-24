import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { AntDesign, Feather } from '@expo/vector-icons';
import { Home, Logs, Mail, CircleUserRound } from 'lucide-react-native';

const getIcon = (routeName: string, color: string) => {
  const iconProps = { color, size: 24, strokeWidth: 1.6 };
  
  switch (routeName) {
    case 'index':
      return <Home {...iconProps} />;
    case 'my-request':
      return <Logs {...iconProps} />;
    case 'inbox':
      return <Mail {...iconProps} />;
    case 'account':
      return <CircleUserRound {...iconProps} />;
    default:
      return null;
  }
};

export const NavigationBar = ({ state, descriptors, navigation } : {
  state: any; descriptors: any, navigation: any
}) => {
    const primaryColor = '#0891b2';
    const greyColor = '#737373';
  return (
    <View style={styles.tabbar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;
        if(['_sitemap', '+not-found'].includes(route.name)) return null;
        const isFocused = state.index === index;
        const iconColor = isFocused ? primaryColor : greyColor;
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };
        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };
        return (
          <TouchableOpacity
            key={route.name}
            style={styles.tabbarItem}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            {getIcon(route.name, iconColor)}
            <Text style={{
                color: iconColor,
                fontSize: 11
            }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  )
}
const styles = StyleSheet.create({
    tabbar: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 15,
        paddingBottom: 30,
    },
    tabbarItem: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }
})