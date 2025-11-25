import React from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import {
  Dimensions,
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
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Plus } from "@/lib/icons/Plus";
import { useDrawer } from "@/contexts/DrawerContext";

export const AddressDrawer = () => {
  // ===================== STATE INITIALIZATION =====================
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
  const { closeDrawer } = useDrawer();

  const { append } = useFieldArray({
    control: control,
    name: "personalInfoSchema.per_addresses.list",
  });

  const barangay = useWatch({
    control,
    name: "personalInfoSchema.per_addresses.new.add_barangay",
  });

  // ===================== SIDE EFFECTS =====================
  React.useEffect(() => {
    if (
      barangay?.trim().toLowerCase() === "san roque" ||
      barangay?.trim().toLowerCase() === "ciudad"
    ) {
      setValue(
        "personalInfoSchema.per_addresses.new.add_barangay",
        "SAN ROQUE (CIUDAD)"
      );
    }

    if (barangay?.trim().toLowerCase() === "san roque (ciudad)") {
      setIsInternalAddress(true);
    } else if (barangay != undefined) {
      setIsInternalAddress(false);
    }
  }, [barangay]);

  React.useEffect(() => {
    setIsInternalAddress(true);
  }, []);

  // ===================== HANDLERS =====================
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

    const list = getValues("personalInfoSchema.per_addresses.list") || [];
    const values = getValues("personalInfoSchema.per_addresses.new");
    const alreadyAdded = list.some(
      (address) =>
        address.add_province.toLowerCase() ==
          values.add_province.toLowerCase() &&
        address.add_city.toLowerCase() == values.add_city.toLowerCase() &&
        address.add_barangay.toLowerCase() ==
          values.add_barangay.toLowerCase() &&
        address.add_external_sitio.toLowerCase() ==
          values.add_external_sitio.toLowerCase() &&
        address.sitio.toLowerCase() == values.sitio.toLowerCase() &&
        address.add_street.toLowerCase() == values.add_street.toLowerCase()
    );

    if (alreadyAdded) {
      Alert.alert("Address already exist!");
      return;
    }

    append({
      ...values,
      sitio: values.sitio ? values.sitio : "",
      add_street: values.add_street ? values.add_street.toUpperCase() : ""
    } as any);
    handleClose();
  };

  const handleClose = () => {
    resetField("personalInfoSchema.per_addresses.new");
    closeDrawer();
  };

  // ===================== RENDER =====================
  return (
    <BottomSheetScrollView
      contentContainerStyle={{
        paddingHorizontal: 4,
        paddingBottom: 15,
      }}
      showsVerticalScrollIndicator={false}
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

      {/* Drawer Footer */}
      <View className="py-4 border-t border-gray-200">
        <View className="flex-row justify-between gap-3">
          <TouchableOpacity
            className="px-8 border py-2 border-gray-300 rounded-full items-center"
            onPress={handleClose}
          >
            <Text className="text-gray-700">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row justify-center gap-2 py-2 px-8 bg-blue-500 rounded-full items-center"
            onPress={handleSave}
          >
            <Plus size={18} className="text-white"/>
            <Text className="text-white text-sm">Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetScrollView>
  );
};
