import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, isLoading } = useAuth();

  // if (isLoading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  // Redirect based on auth state
  if (!user) {
    return <Redirect href="/(auth)" />;
  }
  return <Redirect href="/(auth)" />;
  // return <Redirect href="/(tabs)" />;
}