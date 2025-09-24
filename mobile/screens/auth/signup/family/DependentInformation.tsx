import { ConfirmationModal } from "@/components/ui/confirmationModal";
import PageLayout from "@/screens/_PageLayout";
import { router } from "expo-router";
import { ScrollView, TouchableOpacity, Text, View, Alert } from "react-native";
import { useFieldArray } from "react-hook-form";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { Plus } from '@/lib/icons/Plus';
import React from "react";
import PersonalInformation from "../PersonalInformation";
import { useToastContext } from "@/components/ui/toast";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { X } from "@/lib/icons/X";
import { UserRound } from "@/lib/icons/UserRound";
import { Pen } from "@/lib/icons/Pen";
import { Trash } from "@/lib/icons/Trash";
import { capitalizeAllFields } from "@/helpers/capitalize";
import { useProgressContext } from "@/contexts/ProgressContext";

export default function DependentInformation() {
  const { toast } = useToastContext();
  const [dependents, setDependents] = React.useState<Record<string, any>[]>([]);
  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const { control, getValues, watch, resetField, setValue } = useRegistrationFormContext();
  const { append, remove, update } = useFieldArray({
    control: control,
    name: 'dependentInfoSchema.list'
  })

  const {
    completeStep
  } = useProgressContext();

  console.log(watch("dependentInfoSchema.list"))

  React.useEffect(() => {
    const dependents = watch("dependentInfoSchema.list")
    if(dependents.length > 0) {
      setDependents(dependents)
    }
  }, [watch("dependentInfoSchema.list")])


  const resetNewDependentFields = () => {
    // reset field except addresses
    resetField("dependentInfoSchema.new.per_lname");
    resetField("dependentInfoSchema.new.per_fname");
    resetField("dependentInfoSchema.new.per_mname");
    resetField("dependentInfoSchema.new.per_suffix");
    resetField("dependentInfoSchema.new.per_dob");
    resetField("dependentInfoSchema.new.per_sex");
    resetField("dependentInfoSchema.new.per_status");
    resetField("dependentInfoSchema.new.per_religion");
    resetField("dependentInfoSchema.new.per_edAttainment");
    resetField("dependentInfoSchema.new.per_contact");
  }


  const addDependent = async () => {
    const values = getValues('dependentInfoSchema.new');
    
    if (editingIndex !== null) {
      // Update existing dependent
      update(editingIndex, values);
      setEditingIndex(null);
    } else {
      // Add new dependent
      append({
        ...capitalizeAllFields(values) as any,
        role: 'Dependent'
      });
    }
    
    resetNewDependentFields()
    setShowForm(false);
    
    // Show success feedback
    toast.success(
      editingIndex !== null ? "Dependent updated successfully" : "Dependent added successfully"
    );
  };

  const editDependent = (index: number) => {
    const dependent = dependents[index];
    setEditingIndex(index);
    
    // Populate form with existing data
    Object.keys(dependent).forEach(key => {
      setValue(`dependentInfoSchema.new.${key}` as any, dependent[key]);
    });
    
    setShowForm(true);
  };

  const removeDependent = (index: number) => {
    Alert.alert(
      "Remove Dependent",
      "Are you sure you want to remove this dependent?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => {
            remove(index);
            Alert.alert("Success", "Dependent removed successfully");
          }
        }
      ]
    );
  };

  const formatName = (dependent: any) => {
    const { per_fname, per_mname, per_lname, per_suffix } = dependent;
    let fullName = `${per_fname || ''} ${per_mname ? per_mname + ' ' : ''}${per_lname || ''}`;
    if (per_suffix) fullName += ` ${per_suffix}`;
    return fullName.trim();
  };

  const formatAge = (dob: string) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const submit = () => {
    completeStep(6)
    router.replace("/registration/family/register-new");
  }

  const ListPage = (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Add Dependents</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-5">
          {/* Progress indicator */}
          <View className="mb-4">
            <Text className="text-gray-600 text-sm">
              {dependents.length} dependent{dependents.length !== 1 ? 's' : ''} added
            </Text>
          </View>

          {/* Dependent list */}
          {dependents.map((dependent: any, index: number) => (
            <View key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <UserRound size={16} className="text-gray-600 mr-2" />
                  <Text className="text-gray-900 font-medium flex-1" numberOfLines={1}>
                    {formatName(dependent)}
                  </Text>
                </View>
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => editDependent(index)}
                    className="p-2 mr-2"
                    accessibilityLabel={`Edit ${formatName(dependent)}`}
                  >
                    <Pen size={16} className="text-blue-600" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeDependent(index)}
                    className="p-2"
                    accessibilityLabel={`Remove ${formatName(dependent)}`}
                  >
                    <Trash size={16} className="text-red-600" />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600 text-sm">
                  {dependent.per_sex || 'N/A'}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {dependent.per_dob ? `Age: ${formatAge(dependent.per_dob)}` : 'Age: N/A'}
                </Text>
              </View>
            </View>
          ))}

          {/* Add dependent button */}
          <TouchableOpacity
            className="flex-row items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg mb-4"
            onPress={() => setShowForm(true)}
            accessibilityLabel="Add new dependent"
          >
            <Plus className="text-blue-600 mr-2"/>
            <Text className="text-blue-600 font-medium">New</Text>
          </TouchableOpacity>

          {/* Continue button */}
          {dependents.length > 0 && (
            <TouchableOpacity
              className="bg-blue-600 p-4 rounded-lg items-center mt-4"
              onPress={submit}
              accessibilityLabel="Continue to next step"
            >
              <Text className="text-white font-medium">Continue</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </PageLayout>
  )

  const FormPage = (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => setShowForm(false)}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Dependent Information</Text>}
      rightAction={<View className="w-10 h-10"/>}
    >
      <ScrollView className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <PersonalInformation 
          params={{
            name: 'dependentInfoSchema.new',
            buttonLabel: editingIndex !== null ? 'Update Dependent' : 'Add Dependent',
            submit: addDependent,
          }}
        />
      </ScrollView>
    </PageLayout>
  )

  return showForm ? FormPage : ListPage
}