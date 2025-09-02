import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { AntDesign, Feather } from '@expo/vector-icons';
import { Home, Logs, Mail, CircleUserRound } from 'lucide-react-native';
import HomeUnfocused from '@/assets/icons/tabs/home(unfocused).svg'
import HomeFocused from '@/assets/icons/tabs/home(focused).svg'
import MyRequestUnfocused from '@/assets/icons/tabs/myrequest(unfocused).svg'
import MyRequestFocused from '@/assets/icons/tabs/myrequest(focused).svg'
import InboxUnfocused from '@/assets/icons/tabs/inbox(unfocused).svg'
import InboxFocused from '@/assets/icons/tabs/inbox(focused).svg'
import UserUnfocused from '@/assets/icons/tabs/user(unfocused).svg'
import UserFocused from '@/assets/icons/tabs/user(focused).svg'


const getIcon = (routeName: string, isFocused: boolean) => {
  switch (routeName) {
    case 'index':
      return isFocused ? <HomeFocused /> : <HomeUnfocused />;
    case 'my-request':
      return isFocused ? <MyRequestFocused /> : <MyRequestUnfocused />;
    case 'inbox':
      return isFocused ? <InboxFocused /> : <InboxUnfocused />;
    case 'account':
      return isFocused ? <UserFocused /> : <UserUnfocused />;
    default:
      return null;
  }
};

export const NavigationBar = ({ state, descriptors, navigation } : {
  state: any; descriptors: any, navigation: any
}) => {
    const primaryColor = '#0084F0';
    const greyColor = '#3F3F3F';
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
            {getIcon(route.name, isFocused)}
            <Text style={{
                color: iconColor,
                fontSize: 10
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
        paddingVertical: 10,
        paddingBottom: 10,
        borderTopWidth: 0.2,
        borderTopColor: '#d2d2d2'
    },
    tabbarItem: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4
    }
})