import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Syringe, Pill, Baby, Dog } from 'lucide-react-native';
import { useAnimalBiteCount, usePatientPostpartumCount, usePatients } from '../restful-api/patientsrecord/queries/patientsFetchQueries';
import { useRouter } from 'expo-router'; // Import useRouter from expo-router

// Type definitions
type Patient = {
  pat_id: string;
  pat_type: 'Resident' | 'Non-Resident';
  personal_info: {
    per_fname: string;
    per_lname: string;
  };
};

const PatientCard: React.FC<{ patient: Patient }> = ({ patient }) => {
  const router = useRouter();
  const { data: animalbiteCount, isLoading: isLoadingAnimalBite } = useAnimalBiteCount(patient.pat_id);
  const { data: postpartumCount, isLoading: isLoadingPostpartum } = usePatientPostpartumCount(patient.pat_id);

  const handleViewDetails = () => {
    // router.push(`/patient-detail/${patient.pat_id}`); 
  };

  const serviceCounts = [
    { icon: <Syringe size={18} color="#2563eb" />, count: 0, name: 'Vaccination' }, // Replace with actual API call if available
    { icon: <Pill size={18} color="#9333ea" />, count: 0, name: 'Medicine' }, // Replace with actual API call if available
    { icon: <Pill size={18} color="#10b981" />, count: 0, name: 'First Aid' }, // Replace with actual API call if available
    { icon: <Baby size={18} color="#ec4899" />, count: postpartumCount || 0, name: 'Postpartum', loading: isLoadingPostpartum },
    { icon: <Dog size={18} color="#3b82f6" />, count: animalbiteCount || 0, name: 'Animal Bite', loading: isLoadingAnimalBite },
  ];

  return (
    <TouchableOpacity 
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
      onPress={handleViewDetails}
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-800">
          {patient.personal_info.per_fname} {patient.personal_info.per_lname}
        </Text>
        <View className={`py-1 px-3 rounded-full ${patient.pat_type === 'Resident' ? 'bg-blue-100' : 'bg-yellow-100'}`}>
          <Text className={`text-xs font-medium ${patient.pat_type === 'Resident' ? 'text-blue-800' : 'text-yellow-800'}`}>
            {patient.pat_type}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {serviceCounts.map((service, index) => (
          service.count > 0 && (
            <View key={index} className="flex-row items-center bg-gray-50 py-1.5 px-3 rounded-full">
              {service.icon}
              <Text className="text-sm text-gray-700 ml-1.5">
                {service.name} ({service.loading ? '...' : service.count})
              </Text>
            </View>
          )
        ))}

        {serviceCounts.every(service => service.count === 0) && (
          <Text className="text-sm text-gray-500 italic">No services availed</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const PatientsRecordScreen = () => {
  const { data: patients, isLoading, isError, error } = usePatients();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-base text-gray-700">Loading patients...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <View className="bg-red-50 p-4 rounded-lg items-center">
          <Text className="text-lg font-medium text-red-600 mb-1">Error loading data</Text>
          <Text className="text-sm text-gray-600 text-center">
            {error?.message || 'Failed to load patient records'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-900">Patients Records</Text>
        <Text className="text-sm text-gray-600">View all patients and their availed services</Text>
      </View>

      <FlatList
        data={patients}
        keyExtractor={(item) => item.pat_id}
        renderItem={({ item }) => <PatientCard patient={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Text className="text-gray-500">No patients found</Text>
          </View>
        }
      />
    </View>
  );
};

export default PatientsRecordScreen;
