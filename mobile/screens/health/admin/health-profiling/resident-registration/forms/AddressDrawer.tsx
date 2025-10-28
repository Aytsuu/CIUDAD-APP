import React from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import {
  Dimensions,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  Alert,
} from "react-native";
import { FormInput } from "@/components/ui/form/form-input";
import { useGetSitio } from "@/screens/_global_queries/Retrieve";
import { FormSelect } from "@/components/ui/form/form-select";
import { formatSitio } from "@/helpers/formatSitio";
import { Drawer } from "@/components/ui/drawer";

export const AddressDrawer = ({
  visible,
  onClose,
  control,
  trigger,
  getValues,
  resetField,
  setValue
}: {
  visible: boolean;
  onClose: () => void;
  control: any;
  trigger: any;
  getValues: any;
  resetField: any;
  setValue: any;
}) => {
  // ===================== STATE INITIALIZATION =====================
  const { height: screenHeight } = Dimensions.get("window");
  const { data: sitioList, isLoading } = useGetSitio();
  const [isInternalAddress, setIsInternalAddress] =
    React.useState<boolean>(false);
  const formattedSitio = React.useMemo(
    () => formatSitio(sitioList),
    [sitioList]
  );

  const { append } = useFieldArray({
    control: control,
    name: "personalSchema.per_addresses.list",
  });

  const barangay = useWatch({
    control,
    name: "personalSchema.per_addresses.new.add_barangay"
  })
  
  // ===================== SIDE EFFECTS =====================
  React.useEffect(() => {
    if (barangay?.trim().toLowerCase() === "san roque" || 
        barangay?.trim().toLowerCase() === "ciudad") {
      setValue('personalSchema.per_addresses.new.add_barangay', "SAN ROQUE (CIUDAD)");
    }

    if (barangay?.trim().toLowerCase() === "san roque (ciudad)") {
      setIsInternalAddress(true);
    } else if(barangay != undefined) {
      setIsInternalAddress(false);
    }
  }, [barangay]);

  React.useEffect(() => {
    setIsInternalAddress(true)
  }, []);

  // ===================== HANDLERS =====================
  const handleSave = async () => {
    const formIsValid = await trigger([
      "personalSchema.per_addresses.new.add_province",
      "personalSchema.per_addresses.new.add_city",
      "personalSchema.per_addresses.new.add_barangay",
      isInternalAddress
        ? "personalSchema.per_addresses.new.sitio"
        : "personalSchema.per_addresses.new.add_external_sitio",
      "personalSchema.per_addresses.new.add_street",
    ]);
    
    if (!formIsValid) {
      return;
    }

    const list = getValues("personalSchema.per_addresses.list") || [];
    const values = getValues("personalSchema.per_addresses.new");
    const alreadyAdded = list.some(
      (address: any) =>
        address.add_province.toLowerCase() == values.add_province.toLowerCase() &&
        address.add_city.toLowerCase() == values.add_city.toLowerCase() &&
        address.add_barangay.toLowerCase() == values.add_barangay.toLowerCase() &&
        address.add_external_sitio.toLowerCase() == values.add_external_sitio.toLowerCase() &&
        address.sitio.toLowerCase() == values.sitio.toLowerCase() &&
        address.add_street.toLowerCase() == values.add_street.toLowerCase()
    );

    if (alreadyAdded) {
      Alert.alert("Address already exist!");
      return;
    }

    append({
      ...values,
      sitio: values.sitio ? values.sitio: ''
    } as any);
    handleClose();
  };

  const handleClose = () => {
    resetField("personalSchema.per_addresses.new");
    onClose();
  };

  // ===================== RENDER =====================
  return (
    <Drawer 
      header="Add Address" 
      description="Provide your complete address details"
      visible={visible} onClose={handleClose}
    >
      {/* Drawer Content */}
      <ScrollView
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: screenHeight * 0.6 }}
      >
        <View className="space-y-4 mb-8">
          <FormInput
            control={control}
            label="Province"
            name="personalSchema.per_addresses.new.add_province"
            upper={true}
          />
          <FormInput
            control={control}
            label="City"
            name="personalSchema.per_addresses.new.add_city"
            upper={true}
          />
          <FormInput
            control={control}
            label="Barangay"
            name="personalSchema.per_addresses.new.add_barangay"
            upper={true}
          />
          {isInternalAddress ? (
            <FormSelect
              control={control}
              label="Sitio"
              name="personalSchema.per_addresses.new.sitio"
              options={formattedSitio}
            />
          ) : (
            <FormInput
              control={control}
              label="Sitio"
              name="personalSchema.per_addresses.new.add_external_sitio"
            />
          )}
          <FormInput
            control={control}
            label="Street"
            name="personalSchema.per_addresses.new.add_street"
            upper={true}
          />
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
          <TouchableOpacity
            className="flex-1 py-3 bg-blue-500 rounded-lg items-center"
            onPress={handleSave}
          >
            <Text className="text-white font-PoppinsMedium">Save Address</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Drawer>
  );
};
