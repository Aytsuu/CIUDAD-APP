import React from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import ChildHealthHistoryDetail from '@/screens/health/admin/admin-childhealth/viewrecrods/Viewhistory';

export default function ChildHealthHistoryScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  // Log params for debugging
  console.log('ChildHealthHistoryScreen: Received params:', params);

  return (
    <ChildHealthHistoryDetail
      route={{
        params: {
          chrecId: params.chrecId as string || '',
          chhistId: params.chhistId as string || '',
        },
      }}
      navigation={navigation}
    />
  );
}