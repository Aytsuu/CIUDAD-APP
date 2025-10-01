import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { DonorSelect } from "../personalizedCompo/search_input";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ChevronLeft } from "lucide-react-native";
import ClerkDonateCreateSchema from "@/form-schema/donate-create-form-schema";
import {
  useGetDonations,
  useUpdateDonation,
  useGetPersonalList,
} from "./donation-queries";
import { Donation } from "../donation-types";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import ScreenLayout from "@/screens/_ScreenLayout";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import PageLayout from "@/screens/_PageLayout";
import { LoadingModal } from "@/components/ui/loading-modal";

const DonationView = () => {
  const router = useRouter();
  const { don_num } = useLocalSearchParams();
  const { data: donationsData = { results: [], count: 0 }, isLoading } = useGetDonations();
  const { data: personalList = [] } = useGetPersonalList();
  const updateDonationMutation = useUpdateDonation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Extract the donations array from the data structure
  const donations = donationsData.results || [];
  const donation = donations.find((d: Donation) => d.don_num === don_num);

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
      don_status: undefined,
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
        don_status: donation.don_status,
      });
    }
  }, [donation, reset]);

  const donCategory = watch("don_category");
  const isMonetary = donCategory === "Monetary Donations";

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
        don_status: formData.don_status,
      };

      await updateDonationMutation.mutateAsync({
        don_num: donation.don_num,
        donationInfo: payload,
      });

      setIsEditing(false);
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
        don_status: donation.don_status || undefined,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <>
        <PageLayout
          leftAction={
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={30} color="black" className="text-black" />
            </TouchableOpacity>
          }
          headerTitle={<Text>View Donation</Text>}
          rightAction={<View></View>}
        >
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600">Loading donation details...</Text>
          </View>
        </PageLayout>
        <LoadingModal visible={true} />
      </>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerTitle={<Text>{isEditing ? "Edit Donation" : "View Donation"}</Text>}
      rightAction={
        <TouchableOpacity>
          <ChevronLeft size={30} color="black" className="text-white" />
        </TouchableOpacity>
      }
      footer={<View>
          {isEditing ? (
            <>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 bg-white border border-primaryBlue py-3 rounded-lg"
                  onPress={handleCancel}
                >
                  <Text className="text-primaryBlue text-base font-semibold text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <ConfirmationModal
                  trigger={
                    <TouchableOpacity
                      className="flex-1 bg-primaryBlue py-3 rounded-lg flex-row justify-center items-center"
                      disabled={isSubmitting}
                    >
                      <Text className="text-white text-base font-semibold text-center">
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
              </View>
            </>
          ) : (
           (
              <TouchableOpacity
                className="bg-primaryBlue py-3 rounded-lg"
                onPress={() => setIsEditing(true)}
              >
                <Text className="text-white text-base font-semibold text-center">
                  Edit
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>}
    >
      <View className="space-y-4 p-4 flex-1">
        <Text className="text-sm font-medium mb-1">Condition</Text>
        <FormSelect
          control={control}
          name="don_status"
          options={[
            { label: "Stashed", value: "Stashed" },
            { label: "Allotted", value: "Allotted" },
          ]}
        />
        {!isEditing && (
          <TouchableOpacity
            className="absolute top-0 left-0 right-0 bottom-0"
            style={{ backgroundColor: "transparent" }}
            onPress={() => {}}
          />
        )}
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
            disabled={true}
          />
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
      </View>
    </PageLayout>
  );
};

export default DonationView;