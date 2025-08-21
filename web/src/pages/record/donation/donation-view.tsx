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
  useGetDonations,
  useGetPersonalList,
} from "./queries/donationFetchQueries";
import { ComboboxInput } from "@/components/ui/form/form-combobox-input";
import { ClerkDonateViewProps } from "./donation-types";

function ClerkDonateView({ don_num, onSaveSuccess }: ClerkDonateViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isMonetary, setIsMonetary] = useState<boolean>(false);
  const { data: donations } = useGetDonations();
  const { data: personalList = [], isLoading: isPersonalLoading } =
    useGetPersonalList();
  const { mutate: updateDonation, isPending } = useUpdateDonation();

  // Find the specific donation
  const donation = donations?.find((d) => d.don_num === don_num);

  const form = useForm<z.infer<typeof ClerkDonateViewSchema>>({
    resolver: zodResolver(ClerkDonateViewSchema),
    defaultValues: {
      don_donor: donation?.don_donor || "",
      per_id: donation?.per_id || null,
      don_item_name: donation?.don_item_name || "",
      don_qty: donation?.don_qty || "",
      don_description: donation?.don_description || "",
      don_category: donation?.don_category || "",
      don_date: donation?.don_date || new Date().toISOString().split("T")[0],
    },
  });

  const categoryWatch = form.watch("don_category");
  const moneyType = form.watch("don_item_name");

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

  if (!donation) {
    return <div className="text-center py-8">Loading donation details...</div>;
  }

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      <div className="pb-2">
        <h2 className="text-lg font-semibold">DONATION DETAILS</h2>
        <p className="text-xs text-black/50">View or edit donation details</p>
      </div>
      <Form {...form}>
        <form className="flex flex-col gap-4">
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

          {/* Donation Date */}
          <FormDateTimeInput
            control={form.control}
            name="don_date"
            type="date"
            label="Donation Date"
            readOnly={!isEditing}
          />

          {/* Edit/Save Button */}
          <div className="mt-8 flex justify-end gap-3">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  onClick={() => {
                    form.reset();
                    setIsEditing(false);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <ConfirmationModal
                  trigger={
                    <Button type="button" className="" disabled={isPending}>
                      {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  }
                  title="Confirm Save"
                  description="Are you sure you want to save the changes?"
                  actionLabel="Confirm"
                  onClick={handleConfirmSave}
                />
              </>
            ) : (
              moneyType !== "E-money" && ( // Only show Edit button if not E-Money
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className=""
                >
                  Edit
                </Button>
              )
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ClerkDonateView;
