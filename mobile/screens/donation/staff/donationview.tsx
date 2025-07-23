import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { DonorSelect } from "../personalizedCompo/search_input";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ChevronLeft } from "lucide-react-native";
import ClerkDonateCreateSchema from "@/form-schema/donate-create-form-schema";
import {
  useGetDonations,
  useUpdateDonation,
  useGetPersonalList,
  type Donation,
} from "./queries";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import ScreenLayout from "@/screens/_ScreenLayout";
import { ConfirmationModal } from "@/components/ui/confirmationModal";

const DonationView = () => {
  const router = useRouter();
  const { don_num } = useLocalSearchParams();
  const { data: donations = [] } = useGetDonations();
  const { data: personalList = [] } = useGetPersonalList();
  const updateDonationMutation = useUpdateDonation();

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const donation = donations.find(
    (d: Donation) => d.don_num === don_num
  );

  const { control, handleSubmit, watch, setValue, reset } = useForm({
    resolver: zodResolver(ClerkDonateCreateSchema),
    defaultValues: {
      don_donor: "",
      per_id: null as number | null,
      don_item_name: "",
      don_qty: "",
      don_description: undefined,
      don_category: "",
      don_date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (donation) {
      reset({
        don_donor: donation.don_donor || "",
        don_item_name: donation.don_item_name || "",
        don_qty: donation.don_qty?.toString() || "",
        don_category: donation.don_category || "",
        don_description: donation.don_description || undefined,
        don_date: donation.don_date || new Date().toISOString().split("T")[0],
        per_id: donation.per_id || null,
      });
    }
  }, [donation, reset]);

  const donCategory = watch("don_category");
  const isMonetary = donCategory === "Monetary Donations";

  useEffect(() => {
    if (isMonetary && isEditing) {
      setValue("don_item_name", "");
    }
  }, [isMonetary, isEditing, setValue]);

  const handleSave = async (formData: any) => {
    if (!donation) return;

    setIsSubmitting(true);
    try {
      const payload = {
        don_num: donation.don_num,
        don_donor: formData.don_donor,
        don_item_name: formData.don_item_name,
        don_qty: formData.don_qty.toString(),
        don_category: formData.don_category,
        don_description: formData.don_description || null,
        don_date: formData.don_date,
      };

      await updateDonationMutation.mutateAsync({
        don_num: donation.don_num,
        donationInfo: payload,
      });

      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating donation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (donation) {
      let normalizedItemName = donation.don_item_name || "";

      if (donation.don_category === "Monetary Donations") {
        normalizedItemName =
          donation.don_item_name === "cash"
            ? "Cash"
            : donation.don_item_name === "cheque"
            ? "Cheque"
            : donation.don_item_name === "e-money"
            ? "E-money"
            : donation.don_item_name;
      }

      reset({
        don_donor: donation.don_donor || "",
        don_item_name: normalizedItemName,
        don_qty: donation.don_qty?.toString() || "",
        don_category: donation.don_category || "",
        don_description: donation.don_description || undefined,
        don_date: donation.don_date || new Date().toISOString().split("T")[0],
        per_id: donation.per_id || null,
      });
    }
    setIsEditing(false);
  };

  const moneyType = watch("don_item_name");

  if (!donation) {
    return (
      <ScreenLayout
        header="Donation Not Found"
        description={`Donation with ID ${don_num} not found`}
        showBackButton
        onBackPress={() => router.back()}
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Donation not found</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      showExitButton={false}
      headerAlign="left"
      scrollable={true}
      keyboardAvoiding={true}
      contentPadding="medium"
      headerBetweenAction={
        <Text className="text-[13px]">
          {isEditing ? "Edit Donation" : "View Donation"}
        </Text>
      }
      showBackButton
      onBackPress={() => router.back()}
    >
      <View className="space-y-4 p-5">
        <View className="relative">
          <Text className="text-sm font-medium mb-1">Donor Name</Text>
          <DonorSelect
            placeholder="Select donor or enter name"
            people={personalList}
            selectedDonor={watch("don_donor")}
            onSelect={(donorName) => {
              const selectedPerson = personalList.find(
                (p) => p.full_name === donorName
              );
              setValue("don_donor", donorName);
              setValue("per_id", selectedPerson?.per_id || null);
            }}
          />
          {!isEditing && (
            <TouchableOpacity
              className="absolute top-0 left-0 right-0 bottom-0"
              style={{ backgroundColor: "transparent" }}
              onPress={() => {}}
            />
          )}
        </View>

        <View className="relative">
          <Text className="text-sm font-medium mb-1">Category</Text>
          <FormSelect
            control={control}
            name="don_category"
            options={[
              { label: "Monetary Donations", value: "Monetary Donations" },
              { label: "Essential Goods", value: "Essential Goods" },
              { label: "Medical Supplies", value: "Medical Supplies" },
              { label: "Household Items", value: "Household Items" },
              {
                label: "Educational Supplies",
                value: "Educational Supplies",
              },
              {
                label: "Baby & Childcare Items",
                value: "Baby & Childcare Items",
              },
              {
                label: "Animal Welfare Items",
                value: "Animal Welfare Items",
              },
              {
                label: "Shelter & Homeless Aid",
                value: "Shelter & Homeless Aid",
              },
              {
                label: "Disaster Relief Supplies",
                value: "Disaster Relief Supplies",
              },
            ]}
          />
          {!isEditing && (
            <TouchableOpacity
              className="absolute top-0 left-0 right-0 bottom-0"
              style={{ backgroundColor: "transparent" }}
              onPress={() => {}}
            />
          )}
        </View>

        <View className="relative">
              <Text className="text-sm font-medium mb-1">
                {isMonetary ? "Money Type" : "Item Name"}
              </Text>
              {!isEditing ? (
                <FormInput
                  control={control}
                  name="don_item_name"
                  placeholder={isMonetary ? "Money Type" : "Item Name"}
                  editable={false}
                />
              ) : isMonetary ? (
                <FormSelect
                  control={control}
                  name="don_item_name"
                  options={[
                    { label: "Cash", value: "Cash" },
                    { label: "Cheque", value: "Cheque" },
                    { label: "E-money", value: "E-money" },
                  ]}
                />
              ) : (
                <FormInput
                  control={control}
                  name="don_item_name"
                  placeholder="Enter item name"
                />
              )}
              {!isEditing && (
                <TouchableOpacity
                  className="absolute top-0 left-0 right-0 bottom-0"
                  style={{ backgroundColor: "transparent" }}
                  onPress={() => {}}
                />
              )}
            </View>

        <View className="relative">
          <Text className="text-sm font-medium mb-1">
            {isMonetary ? "Amount" : "Quantity"}
          </Text>
          <FormInput
            control={control}
            name="don_qty"
            placeholder={isMonetary ? "Enter amount" : "Enter quantity"}
            keyboardType="numeric"
          />
          {!isEditing && (
            <TouchableOpacity
              className="absolute top-0 left-0 right-0 bottom-0"
              style={{ backgroundColor: "transparent" }}
              onPress={() => {}}
            />
          )}
        </View>

        <View className="relative">
          <Text className="text-sm font-medium mb-1">Description</Text>
          <FormInput
            control={control}
            name="don_description"
            placeholder="Enter description"
          />
          {!isEditing && (
            <TouchableOpacity
              className="absolute top-0 left-0 right-0 bottom-0"
              style={{ backgroundColor: "transparent" }}
              onPress={() => {}}
            />
          )}
        </View>

        <View className="relative">
          <Text className="text-sm font-medium mb-1">Donation Date</Text>
          <FormDateInput control={control} name="don_date" />
          {!isEditing && (
            <TouchableOpacity
              className="absolute top-0 left-0 right-0 bottom-0"
              style={{ backgroundColor: "transparent" }}
              onPress={() => {}}
            />
          )}
        </View>

        <View className="flex-row justify-end space-x-2 gap-3 mt-4">
          {isEditing ? (
            <>
              <TouchableOpacity
                className="px-6 py-3 bg-gray-200 rounded-lg flex-row items-center"
                onPress={handleCancel}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <ConfirmationModal
                trigger={
                  <TouchableOpacity
                    className="px-4 py-2 bg-blue-500 rounded-lg flex-row items-center"
                    disabled={isSubmitting}
                  >
                    <Text className="text-white">
                      {isSubmitting ? "Saving" : "Save"}
                    </Text>
                    {isSubmitting && (
                      <Loader2
                        size={16}
                        color="white"
                        className="ml-2 animate-spin"
                      />
                    )}
                  </TouchableOpacity>
                }
                title="Confirm Changes"
                description="Are you sure you want to save these changes?"
                actionLabel="Save"
                onPress={handleSubmit(handleSave)}
                loading={isSubmitting}
              />
            </>
          ) : (
             moneyType !== "E-money" && (
            <TouchableOpacity
              className="px-6 py-3 bg-blue-500 rounded-lg flex-row items-center"
              onPress={() => setIsEditing(true)}
            >
              <Text className="text-white text-lg font-medium">Edit</Text>
            </TouchableOpacity>
             )
          )}
        </View>
      </View>
    </ScreenLayout>
  );
};

export default DonationView;
