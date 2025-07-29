// TodayScheduleWidget.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { format } from 'date-fns';
import { useGetServices, useGetUniqueServices } from './queries/schedulerFetchQueries'; 
import { DailySchedule, ServiceTimeSlots } from './schedule-types';

interface TodayScheduleWidgetProps {
  onViewWeeklySchedule: () => void;
}

export default function TodayScheduleWidget({ onViewWeeklySchedule }: TodayScheduleWidgetProps) {
  const { data: servicesFromDB = [], isLoading: servicesLoading, error: servicesError } = useGetUniqueServices();
  const { data: schedulersFromDB = [], isLoading: schedulersLoading } = useGetServices();

  const [dailySchedule, setDailySchedule] = useState<DailySchedule>({});
  const [services, setServices] = useState<string[]>([]);

  useEffect(() => {
    if (servicesFromDB.length > 0) {
      setServices(servicesFromDB);
    }
  }, [servicesFromDB]);

  useEffect(() => {
    if (schedulersFromDB.length > 0 && servicesFromDB.length > 0) {
      const today = new Date();
      const formattedToday = format(today, "yyyy-MM-dd");
      const currentDaily: DailySchedule = {};

      servicesFromDB.forEach(serviceName => {
        currentDaily[serviceName] = { AM: false, PM: false };
      });

      schedulersFromDB.forEach(scheduler => {
        if (currentDaily[scheduler.service]) {
          currentDaily[scheduler.service][scheduler.meridiem] = true;
        }
      });
      setDailySchedule(currentDaily);
    }
  }, [schedulersFromDB, servicesFromDB]);

  if (servicesLoading || schedulersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading today's schedule...</Text>
      </View>
    );
  }

  if (servicesError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading today's schedule.</Text>
      </View>
    );
  }

  const scheduledServices = services.filter((service) => {
    const serviceTimeSlots: ServiceTimeSlots = dailySchedule[service] || { AM: false, PM: false };
    return serviceTimeSlots.AM || serviceTimeSlots.PM;
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Today's Schedule</Text>
        <Text style={styles.cardSubtitle}>{format(new Date(), "EEEE, MMM d")}</Text>
      </View>
      <View style={styles.cardContent}>
        {scheduledServices.length > 0 ? (
          <View style={styles.serviceList}>
            {scheduledServices.map((service) => {
              const serviceTimeSlots: ServiceTimeSlots = dailySchedule[service] || { AM: false, PM: false };
              const activeSlots: string[] = [];
              if (serviceTimeSlots.AM) activeSlots.push("AM");
              if (serviceTimeSlots.PM) activeSlots.push("PM");

              return (
                <View key={service} style={styles.serviceItem}>
                  <Text style={styles.serviceName}>{service}</Text>
                  <View style={styles.badgeContainer}>
                    {activeSlots.map((slot) => (
                      <View key={slot} style={styles.badge}>
                        <Text style={styles.badgeText}>{slot}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.noServicesText}>No services scheduled for today.</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={onViewWeeklySchedule}>
          <Text style={styles.buttonText}>View Weekly Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cardContent: {
    padding: 16,
  },
  serviceList: {
    marginBottom: 10,
  },
  serviceItem: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#e0e7ff', // Equivalent to bg-blue-100
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#3b82f6', // Equivalent to text-blue-800
    fontWeight: 'bold',
  },
  noServicesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3b82f6', // A shade of blue for the button
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
