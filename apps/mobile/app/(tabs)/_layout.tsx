import { Tabs } from 'expo-router';
import { Home } from 'lucide-react-native';


export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '',
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ }) => <Home color={"#000"}/>,
        }}
      />
    </Tabs>
  );
}
