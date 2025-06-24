import React from "react"
import { Control, useFieldArray, UseFormGetValues, UseFormResetField, UseFormTrigger } from "react-hook-form";
import { Animated, Dimensions, Modal, ScrollView, TouchableOpacity, View, Text, KeyboardAvoidingView, Alert } from "react-native"
import { FormInput } from "@/components/ui/form/form-input";
import { useToastContext } from "@/components/ui/toast";
import { z } from "zod";
import { complaintFormSchema } from "@/form-schema/complaint-schema";

export const AccusedDrawer = ({
  visible,
  control,
  trigger,
  getValues,
  resetField,
  onClose,
}: {
  visible: boolean;
  control: Control<z.infer<typeof complaintFormSchema>>
  trigger: UseFormTrigger<z.infer<typeof complaintFormSchema>>
  getValues: UseFormGetValues<z.infer<typeof complaintFormSchema>>
  resetField: UseFormResetField<z.infer<typeof complaintFormSchema>>;
  onClose: () => void;
}) => {
  const { toast } = useToastContext();
  const { height: screenHeight } = Dimensions.get("window")
  const slideAnim = React.useRef(new Animated.Value(screenHeight)).current

  const { append } = useFieldArray({
    control: control,
    name: "accused.list",
  });

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 5,
        friction: 20,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  const handleSave = async () => {
    const formIsValid = await trigger([
      "accused.new.accusedName"
    ])

    if(!formIsValid) {
      return;
    }

    const list = getValues('accused.list')
    const values = getValues('accused.new');
    const alreadyAdded = list.some((accused) => 
      accused.accusedName == values.accusedName
    )
    
    if(alreadyAdded) {
      Alert.alert("Address already exist!")
      // toast.error("Address already exist!");
      // handleClose();
      return;
    }

    append(values);
    toast.success("Added!");
    handleClose();

  }

  const handleClose = () => {
    resetField("accused.new")
    onClose();
  }

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="none" 
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={handleClose}>
        {/* Drawer Container */}
        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
          style={{
            transform: [{ translateY: slideAnim }],
            maxHeight: screenHeight * 0.9,
          }}
        >
          <TouchableOpacity activeOpacity={1}>
            {/* Drawer Handle */}
            <View className="items-center py-3">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Drawer Header */}
            <View className="flex-row justify-between items-center px-6 pb-4 border-b border-gray-200">
              <Text className="text-lg font-PoppinsSemiBold text-gray-800">Add Accused</Text>
            </View>

            {/* Drawer Content */}
            <ScrollView
              className="flex-1 px-6 py-4"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: screenHeight * 0.6 }}
            >
              <View className="space-y-4 mb-8">
                <FormInput control={control} label="Name" name="accused.new.accusedName"/>
              </View>
            </ScrollView>

            {/* Drawer Footer */}
            <View className="px-6 py-4 border-t border-gray-200">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 py-3 border border-gray-300 rounded-lg items-center"
                  onPress={handleClose}
                >
                  <Text className="text-gray-700 font-PoppinsMedium">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 py-3 bg-blue-500 rounded-lg items-center" onPress={handleSave}>
                  <Text className="text-white font-PoppinsMedium">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  )
}