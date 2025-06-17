import React from "react"
import { useFieldArray } from "react-hook-form";
import { Animated, Dimensions, Modal, ScrollView, TouchableOpacity, View, Text, KeyboardAvoidingView, Alert } from "react-native"
import { FormInput } from "@/components/ui/form/form-input";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { useGetSitio } from "@/screens/_global_queries/Retrieve";
import { FormSelect } from "@/components/ui/form/form-select";
import { formatSitio } from "@/helpers/formatSitio";
import { useToastContext } from "@/components/ui/toast";

export const AddressDrawer = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const { toast } = useToastContext();
  const { height: screenHeight } = Dimensions.get("window")
  const slideAnim = React.useRef(new Animated.Value(screenHeight)).current
  const { control, trigger, watch, getValues, resetField } = useRegistrationFormContext();
  const { data: sitioList, isLoading } = useGetSitio();
  const [isInternalAddress, setIsInternalAddress] = React.useState<boolean>(false);
  const formattedSitio = React.useMemo(() => formatSitio(sitioList), [sitioList])

  const { append } = useFieldArray({
    control: control,
    name: 'personalInfoSchema.per_addresses.list',
  });

  React.useEffect(() => {
  const subscription = watch((value, { name }) => {
    if (name === 'personalInfoSchema.per_addresses.new.add_barangay') {
      const barangay = value.personalInfoSchema?.per_addresses?.new?.add_barangay;
      if (barangay && barangay.toLowerCase() === "san roque") {
        setIsInternalAddress(true);
      } else {
        setIsInternalAddress(false);
      }
    }
  });
  
  return () => subscription.unsubscribe();
}, [watch]);

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
      'personalInfoSchema.per_addresses.new.add_province',
      'personalInfoSchema.per_addresses.new.add_city',
      'personalInfoSchema.per_addresses.new.add_barangay',
      (isInternalAddress ? 'personalInfoSchema.per_addresses.new.sitio' : 
        'personalInfoSchema.per_addresses.new.add_external_sitio'
      ),
      'personalInfoSchema.per_addresses.new.add_street'
    ])

    if(!formIsValid) {
      return;
    }

    const list = getValues('personalInfoSchema.per_addresses.list')
    const values = getValues('personalInfoSchema.per_addresses.new');
    const alreadyAdded = list.some((address) => 
      address.add_province == values.add_province &&
      address.add_city == values.add_city &&
      address.add_barangay == values.add_barangay &&
      address.add_external_sitio == values.add_external_sitio &&
      address.sitio == values.sitio &&
      address.add_street == values.add_street
    )
    
    if(alreadyAdded) {
      Alert.alert("Address already exist!")
      // toast.error("Address already exist!");
      // handleClose();
      return;
    }

    append(values);
    toast.success("Success!");
    handleClose();

  }

  const handleClose = () => {
    resetField("personalInfoSchema.per_addresses.new")
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
              <Text className="text-lg font-PoppinsSemiBold text-gray-800">Add Address</Text>
            </View>

            {/* Drawer Content */}
            <ScrollView
              className="flex-1 px-6 py-4"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: screenHeight * 0.6 }}
            >
              <View className="space-y-4 mb-8">
                <FormInput control={control} label="Province" name="personalInfoSchema.per_addresses.new.add_province"/>
                <FormInput control={control} label="City" name="personalInfoSchema.per_addresses.new.add_city"/>
                <FormInput control={control} label="Barangay" name="personalInfoSchema.per_addresses.new.add_barangay"/>
                {isInternalAddress ? (
                  <FormSelect 
                    control={control} 
                    label="Sitio" 
                    name="personalInfoSchema.per_addresses.new.sitio" 
                    options={formattedSitio} 
                    isInModal={true}
                  />) : (
                    <FormInput control={control} 
                      label="Sitio" 
                      name="personalInfoSchema.per_addresses.new.add_external_sitio"
                    />
                  )}
                <FormInput control={control} label="Street" name="personalInfoSchema.per_addresses.new.add_street" />
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
                  <Text className="text-white font-PoppinsMedium">Save Address</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  )
}