// schedule-today.tsx (temporary test version)
import React, { useEffect, useState, useMemo } from 'react';
import { View, Text as RNText, TouchableOpacity, ActivityIndicator } from 'react-native'; // Use raw RN Text
import { format } from 'date-fns';
import { useGetScheduler, useGetServices } from './queries/schedulerFetchQueries';
import { useRouter } from 'expo-router';

interface ServiceTimeSlots {
  AM: boolean;
  PM: boolean;
}

interface DailySchedule {
  [serviceName: string]: ServiceTimeSlots;
}

export default function TodayScheduleWidget({ onViewWeeklySchedule }: { onViewWeeklySchedule?: () => void }) {
  const router = useRouter();
  const { data: servicesData = [], isLoading: servicesLoading, error: servicesError } = useGetServices();
  const { data: schedulersData = [], isLoading: schedulersLoading, error: schedulersError } = useGetScheduler();

  const [dailySchedule, setDailySchedule] = useState<DailySchedule>({});
  const [services, setServices] = useState<string[]>([]);

  const handleViewWeeklySchedule = () => {
    router.push('/admin/scheduler/schedule-weekly');
  };

  useEffect(() => {
    if (servicesData.length > 0) {
      const serviceNames = servicesData.map((s) => s.service_name);
      setServices(serviceNames);
    }
  }, [servicesData]);

  useEffect(() => {
    if (servicesData.length > 0) {
      const today = new Date();
      const todayDayName = format(today, 'EEEE');
      const currentDaily: DailySchedule = {};

      servicesData.forEach((service) => {
        currentDaily[service.service_name] = { AM: false, PM: false };
      });

      schedulersData.forEach((scheduler) => {
        if (scheduler.day === todayDayName && currentDaily[scheduler.service_name]) {
          currentDaily[scheduler.service_name][scheduler.meridiem] = true;
        }
      });

      setDailySchedule(currentDaily);
    }
  }, [schedulersData, servicesData]);

  const scheduledServices = useMemo(() => {
    return services.filter((serviceName) => {
      const serviceTimeSlots: ServiceTimeSlots = dailySchedule[serviceName] || { AM: false, PM: false };
      return serviceTimeSlots.AM || serviceTimeSlots.PM;
    });
  }, [services, dailySchedule]);

  if (servicesLoading || schedulersLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <RNText style={{ marginTop: 8, fontSize: 16, color: '#374151' }}>Loading...</RNText>
      </View>
    );
  }

  if (servicesError || schedulersError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#FEF2F2', borderRadius: 8 }}>
        <RNText style={{ fontSize: 16, color: '#DC2626', textAlign: 'center' }}>Unable to load schedule.</RNText>
        <TouchableOpacity
          style={{ marginTop: 16, backgroundColor: '#2563EB', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 }}
          onPress={() => {}}
        >
          <RNText style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>Retry</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 8, margin: 2, elevation: 3 }}>
      <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        <RNText style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937' }}>Today's Schedule</RNText>
        <RNText style={{ fontSize: 14, color: '#4B5563', marginTop: 4 }}>{format(new Date(), 'EEEE, MMM d')}</RNText>
      </View>
      <View style={{ padding: 14 }}>
        {scheduledServices.length > 0 ? (
          <View style={{ marginBottom: 8 }}>
            {scheduledServices.map((serviceName) => {
              const serviceTimeSlots: ServiceTimeSlots = dailySchedule[serviceName] || { AM: false, PM: false };
              const activeSlots: string[] = [];
              if (serviceTimeSlots.AM) activeSlots.push('AM');
              if (serviceTimeSlots.PM) activeSlots.push('PM');

              return (
                <View key={serviceName} style={{ marginBottom: 8 }}>
                  <RNText style={{ fontSize: 16, fontWeight: '500', color: '#1F2937' }}>{serviceName}</RNText>
                  <View style={{ flexDirection: 'row', marginTop: 4 }}>
                    {activeSlots.map((slot) => (
                      <View key={slot} style={{ backgroundColor: '#DBEAFE', borderRadius: 9999, paddingVertical: 4, paddingHorizontal: 8, marginRight: 4 }}>
                        <RNText style={{ fontSize: 12, fontWeight: 'bold', color: '#2563EB' }}>{slot}</RNText>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <RNText style={{ fontSize: 14, color: '#4B5563', textAlign: 'center', marginBottom: 8 }}>No services scheduled for today.</RNText>
        )}
        <TouchableOpacity
          style={{ backgroundColor: '#2563EB', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', marginTop: 8 }}
          onPress={handleViewWeeklySchedule}
        >
          <RNText style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>View Weekly Schedule</RNText>
        </TouchableOpacity>
      </View>
    </View>
  );
}