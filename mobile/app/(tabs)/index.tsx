import { View, Text, Platform } from 'react-native';
import "@/global.css"
import AnimalBites from '@/screens/animal-bites/AnimalBites';

export default function HomeScreen() {
  return (
    <View>
      <AnimalBites />
        <Text>Welcome!</Text>
      </View>
  );
}

