import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormField } from "@/components/ui/form/form";
import ClerkDonateViewSchema from "@/form-schema/donate-view-schema";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useUpdateDonation } from "./queries/donationUpdateQueries";
import {
  useGetPersonalList,
  useGetDonationById,
  useGetStaffList,
} from "./queries/donationFetchQueries";
import { ComboboxInput } from "@/components/ui/form/form-combobox-input";
import { ClerkDonateViewProps } from "./donation-types";
import { Spinner } from "@/components/ui/spinner";

function ClerkDonateView({ don_num, onSaveSuccess }: ClerkDonateViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isMonetary, setIsMonetary] = useState<boolean>(false);
  const {
    data: donation,
    isLoading: isDonationLoading,
    isFetching: isDonationFetching,
  } = useGetDonationById(don_num);
  const {
    data: personalList = [],
    isLoading: isPersonalLoading,
    isFetching: isPersonalFetching,
  } = useGetPersonalList();
  const { data: staffList = [], isLoading: isStaffLoading } = useGetStaffList();
  const { mutate: updateDonation, isPending } = useUpdateDonation();

  const form = useForm<z.infer<typeof ClerkDonateViewSchema>>({
    resolver: zodResolver(ClerkDonateViewSchema),
    defaultValues: {
      don_donor: "",
      don_item_name: "",
      don_qty: "",
      don_description: "",
      don_category: "",
      don_date: new Date().toISOString().split("T")[0],
      don_status: "Stashed",
      don_dist_head: null,
      don_dist_date: new Date().toISOString().split("T")[0],
    },
  });

  // Reset form when donation data is loaded
  useEffect(() => {
    if (donation) {
      form.reset({
        don_donor: donation.don_donor || "",
        don_item_name: donation.don_item_name || "",
        don_qty: donation.don_qty || "",
        don_description: donation.don_description || "",
        don_category: donation.don_category || "",
        don_date: donation.don_date || new Date().toISOString().split("T")[0],
        don_status:
          (donation.don_status as "Stashed" | "Allotted") || "Stashed",
        don_dist_head: donation.don_dist_head || null,
        don_dist_date: donation.don_dist_date || null,
      });
    }
  }, [donation, form]);

  const categoryWatch = form.watch("don_category");
  useEffect(() => {
    setIsMonetary(categoryWatch === "Monetary Donations");
    if (categoryWatch === "Monetary Donations") {
      form.setValue("don_item_name", donation?.don_item_name || "");
    }
  }, [categoryWatch, form, donation]);

  const handleConfirmSave = () => {
    const values = form.getValues();
    updateDonation(
      { don_num, donationInfo: values },
      {
        onSuccess: () => {
          setIsEditing(false);
          onSaveSuccess?.();
        },
      }
    );
  };

  // Show loading spinner while data is being fetched
  if (isDonationLoading || isPersonalLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 min-h-[400px]">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading donation details...</p>
      </div>
    );
  }

  // Show loading spinner while data is refetching/updating
  if (isDonationFetching || isPersonalFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-16 min-h-[400px]">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Updating donation information...</p>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="flex flex-col items-center justify-center py-16 min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Donation not found</p>
          <p className="text-sm text-gray-400">
            The donation record you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 h-auto p-2 rounded-lg overflow-auto">
      <Form {...form}>
        <form className="flex flex-col gap-4">
          {/* Show loading overlay when saving */}
          {isPending && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <Spinner size="lg" />
                <p className="text-gray-600">Saving changes...</p>
              </div>
            </div>
          )}

          <FormSelect
            control={form.control}
            name="don_status"
            label="Status"
            options={[
              { id: "Stashed", name: "Stashed" },
              { id: "Allotted", name: "Allotted" },
            ]}
            readOnly={!isEditing}
          />

          {/* Donation Date */}
          <FormDateTimeInput
            control={form.control}
            name="don_date"
            type="date"
            label="Donation Date"
            readOnly={!isEditing}
          />
          
          {/* Donor Name */}
          <FormField
            control={form.control}
            name="don_donor"
            render={({ field }) => (
              <ComboboxInput
                value={field.value}
                options={[
                  { full_name: "Anonymous", per_id: null },
                  ...personalList,
                ]}
                isLoading={isPersonalLoading}
                label="Donor Name"
                placeholder="Select donor..."
                emptyText="No donor found. Enter name manually."
                onSelect={(value, item) => {
                  field.onChange(value);
                  form.setValue("per_id", item?.per_id || null);
                }}
                onCustomInput={(value) => {
                  field.onChange(value);
                  form.setValue("per_id", null);
                }}
                displayKey="full_name"
                valueKey="per_id"
                readOnly={!isEditing}
              />
            )}
          />

          {/* Category */}
          <FormSelect
            control={form.control}
            name="don_category"
            label="Category"
            options={[
              { id: "Monetary Donations", name: "Monetary Donations" },
              { id: "Essential Goods", name: "Essential Goods" },
              { id: "Medical Supplies", name: "Medical Supplies" },
              { id: "Household Items", name: "Household Items" },
              { id: "Educational Supplies", name: "Educational Supplies" },
              { id: "Baby & Childcare Items", name: "Baby & Childcare Items" },
              { id: "Animal Welfare Items", name: "Animal Welfare Items" },
              { id: "Shelter & Homeless Aid", name: "Shelter & Homeless Aid" },
              {
                id: "Disaster Relief Supplies",
                name: "Disaster Relief Supplies",
              },
            ]}
            readOnly={true}
          />

          {isMonetary ? (
            <FormSelect
              control={form.control}
              name="don_item_name"
              label="Money Type"
              options={[
                { id: "Cash", name: "Cash" },
                { id: "Cheque", name: "Cheque" },
                { id: "E-money", name: "E-money" },
              ]}
              readOnly={true}
            />
          ) : (
            <FormInput
              control={form.control}
              name="don_item_name"
              label="Item Name"
              placeholder="Enter item name"
              readOnly={!isEditing}
            />
          )}

          {/* Quantity */}
          <FormInput
            control={form.control}
            name="don_qty"
            label={isMonetary ? "Amount" : "Quantity"}
            placeholder={isMonetary ? "Enter amount" : "Enter quantity"}
            readOnly={!isEditing}
          />

          {/* Item Description */}
          <FormInput
            control={form.control}
            name="don_description"
            label="Description"
            placeholder="Enter description"
            readOnly={!isEditing}
          />

          <FormField
            control={form.control}
            name="don_dist_head"
            render={({ field }) => (
              <ComboboxInput
                value={field.value || ""}
                options={staffList}
                isLoading={isStaffLoading}
                label="Distribution Head"
                placeholder="Select distribution head..."
                emptyText="No staff found."
                onSelect={(value, _item) => {
                  field.onChange(value);
                }}
                displayKey="full_name"
                valueKey="staff_id"
                additionalDataKey="position_title"
                readOnly={!isEditing}
              />
            )}
          />

          <FormDateTimeInput
            control={form.control}
            name="don_dist_date"
            type="date"
            label="Distributed Date"
            readOnly={!isEditing}
          />

          {/* Edit/Save Button */}
          <div className="mt-8 flex justify-end gap-3 mb-2">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  onClick={() => {
                    form.reset();
                    setIsEditing(false);
                  }}
                  variant="outline"
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <ConfirmationModal
                  trigger={
                    <Button type="button" className="" disabled={isPending}>
                      {isPending ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  }
                  title="Confirm Save"
                  description="Are you sure you want to save the changes?"
                  actionLabel="Confirm"
                  onClick={handleConfirmSave}
                />
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className=""
              >
                Edit
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ClerkDonateView;
