import "@/global.css";

import React from 'react';
import { View, Text, TouchableWithoutFeedback, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from "@/components/ui/button";
import Layout from "../_layout";
import { Plus } from '@/lib/icons/Plus';
import { useForm } from "@/app/(auth)/FormContext"; // Import the form context
import { DependentInfo } from "@/form-schema/registration-schema"; // Import the DependentInfo type

export default function Dependent() {
  const router = useRouter();
  const { formData } = useForm(); // Access form data from context

  const handleProceed = () => {
    router.push('/register-completion'); 
  };

  const handleAddDependent = () => {
    router.push('/add-dependent'); 
  };

  // Function to handle viewing a dependent
  const handleViewDependent = (dependent: DependentInfo) => {
    console.log("Viewing dependent:", dependent);
    // Example: router.push(`/view-dependent/${dependent.id}`); // If you have an ID
  };

  // Render each dependent
  const renderDependent = ({ item }: { item: DependentInfo }) => (
    <TouchableOpacity onPress={() => handleViewDependent(item)}>
      <View className="p-4 border-b border-gray-200">
        <Text className="font-PoppinsMedium text-[16px]">
          {item.firstName} {item.lastName}
        </Text>
        <Text className="text-muted-foreground">
          {item.dob} • {item.sex}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Layout
        header={'Dependents'}
        description={'Optional'}
    >
        <View className="flex-1 gap-10">

            {/* List of Dependents */}
            {formData.dependentInformation.length > 0 ? (
              <FlatList
                data={formData.dependentInformation}
                renderItem={renderDependent}
                keyExtractor={(item, index) => index.toString()}
              />
            ) : (
              // Blank White Area with "Add Dependent" Button
              <TouchableWithoutFeedback onPress={handleAddDependent}>
                <View className="flex-1 justify-center items-center">
                  <View className="flex-row gap-3">
                    <Plus className="text-muted-foreground"/> 
                    <Text className="text-muted-foreground font-PoppinsMedium text-[16px]">
                      Add Dependent
                    </Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )}

            {/* Action Button */}
            <View className="">
                <Button
                    onPress={handleProceed}
                    className="bg-primaryBlue native:h-[57px]"
                >
                    <Text className="text-white font-PoppinsMedium text-[16px]">Next</Text>
                </Button>
            </View>
        </View>
    </Layout>
  );
}