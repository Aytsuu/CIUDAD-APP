import React from "react";
import { useFieldArray } from "react-hook-form";
import {
  Dimensions,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  Alert,
} from "react-native";
import { FormInput } from "@/components/ui/form/form-input";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { useGetSitio } from "@/screens/_global_queries/Retrieve";
import { FormSelect } from "@/components/ui/form/form-select";
import { formatSitio } from "@/helpers/formatSitio";
import { useToastContext } from "@/components/ui/toast";
import { Drawer } from "@/components/ui/drawer";
import { capitalizeAllFields } from "@/helpers/capitalize";

export const AddressDrawer = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const { toast } = useToastContext();
  const { height: screenHeight } = Dimensions.get("window");
  const { control, trigger, watch, getValues, resetField, setValue } =
    useRegistrationFormContext();
  const { data: sitioList, isLoading } = useGetSitio();
  const [isInternalAddress, setIsInternalAddress] =
    React.useState<boolean>(false);
  const formattedSitio = React.useMemo(
    () => formatSitio(sitioList),
    [sitioList]
  );

  const { append } = useFieldArray({
    control: control,
    name: "personalInfoSchema.per_addresses.list",
  });

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "personalInfoSchema.per_addresses.new.add_barangay") {
        const barangay =
          value.personalInfoSchema?.per_addresses?.new?.add_barangay;

        if (barangay?.trim().toLowerCase() === "san roque" || 
            barangay?.trim().toLowerCase() === "ciudad")
          setValue('personalInfoSchema.per_addresses.new.add_barangay', "San Roque (ciudad)")

        if (barangay && barangay.trim().toLowerCase() === "san roque (ciudad)") {
          setIsInternalAddress(true);
        } else {
          setIsInternalAddress(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  React.useEffect(() => {
    const barangay = getValues(
      "personalInfoSchema.per_addresses.new.add_barangay"
    );
    if (barangay && barangay.trim().toLowerCase() === "san roque (ciudad)") {
      setIsInternalAddress(true);
    } else {
      setIsInternalAddress(false);
    }
  }, [getValues("personalInfoSchema.per_addresses.new.add_barangay")]);

  const handleSave = async () => {
    const formIsValid = await trigger([
      "personalInfoSchema.per_addresses.new.add_province",
      "personalInfoSchema.per_addresses.new.add_city",
      "personalInfoSchema.per_addresses.new.add_barangay",
      isInternalAddress
        ? "personalInfoSchema.per_addresses.new.sitio"
        : "personalInfoSchema.per_addresses.new.add_external_sitio",
      "personalInfoSchema.per_addresses.new.add_street",
    ]);

    if (!formIsValid) {
      return;
    }

    const list = getValues("personalInfoSchema.per_addresses.list");
    const values = getValues("personalInfoSchema.per_addresses.new");
    const alreadyAdded = list.some(
      (address) =>
        address.add_province == values.add_province &&
        address.add_city == values.add_city &&
        address.add_barangay == values.add_barangay &&
        address.add_external_sitio == values.add_external_sitio &&
        address.sitio == values.sitio &&
        address.add_street == values.add_street
    );

    if (alreadyAdded) {
      Alert.alert("Address already exist!");
      // toast.error("Address already exist!");
      // handleClose();
      return;
    }

    append({
      ...capitalizeAllFields(values),
      sitio: values.sitio ? values.sitio.toLowerCase() : ''
    } as any);
    handleClose();
  };

  const handleClose = () => {
    resetField("personalInfoSchema.per_addresses.new");
    onClose();
  };

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
            name="personalInfoSchema.per_addresses.new.add_province"
          />
          <FormInput
            control={control}
            label="City"
            name="personalInfoSchema.per_addresses.new.add_city"
          />
          <FormInput
            control={control}
            label="Barangay"
            name="personalInfoSchema.per_addresses.new.add_barangay"
          />
          {isInternalAddress ? (
            <FormSelect
              control={control}
              label="Sitio"
              name="personalInfoSchema.per_addresses.new.sitio"
              options={formattedSitio}
            />
          ) : (
            <FormInput
              control={control}
              label="Sitio"
              name="personalInfoSchema.per_addresses.new.add_external_sitio"
            />
          )}
          <FormInput
            control={control}
            label="Street"
            name="personalInfoSchema.per_addresses.new.add_street"
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
