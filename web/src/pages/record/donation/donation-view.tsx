import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import ClerkDonateViewSchema from "@/form-schema/donate-view-schema";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useUpdateDonation } from "./queries/donationUpdateQueries";
import { useGetDonations } from "./queries/donationFetchQueries";

type ClerkDonateViewProps = {
  don_num: number;
  onSaveSuccess?: () => void;
};

function ClerkDonateView({ don_num, onSaveSuccess }: ClerkDonateViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: donations } = useGetDonations();
  const { mutate: updateDonation, isPending } = useUpdateDonation();

  // Find the specific donation
  const donation = donations?.find((d) => d.don_num === don_num);

  const form = useForm<z.infer<typeof ClerkDonateViewSchema>>({
    resolver: zodResolver(ClerkDonateViewSchema),
    defaultValues: {
      don_donorfname: donation?.don_donorfname || "",
      don_donorlname: donation?.don_donorlname || "",
      don_item_name: donation?.don_item_name || "",
      don_qty: donation?.don_qty || 0,
      don_category: donation?.don_category || "",
      don_receiver: donation?.don_receiver || "",
      don_description: donation?.don_description || "",
      don_date: donation?.don_date || new Date().toISOString().split("T")[0],
    },
  });

  const handleConfirmSave = () => {
    const values = form.getValues();
    updateDonation(
      { don_num, donationInfo: values },
      {
        onSuccess: () => {
          setIsEditing(false);
          if (onSaveSuccess) onSaveSuccess();
        },
      }
    );
  };

  if (!donation) {
    return <div className="text-center py-8">Loading donation details...</div>;
  }

  return (
    <div className="flex flex-col min-h-0 h-auto p-6 max-w-4xl mx-auto rounded-lg overflow-auto">
      <div className="pb-4">
        <h2 className="text-lg font-semibold">DONATION DETAILS</h2>
        <p className="text-xs text-black/50">View or edit donation details</p>
      </div>
      <Form {...form}>
        <form className="flex flex-col gap-4">
          {/* Donor First Name */}
          <FormInput
            control={form.control}
            name="don_donorfname"
            label="Donor First Name"
            placeholder="Enter donor's first name"
            readOnly={!isEditing}
          />

          {/* Donor Last Name */}
          <FormInput
            control={form.control}
            name="don_donorlname"
            label="Donor Last Name"
            placeholder="Enter donor's last name"
            readOnly={!isEditing}
          />

          {/* Item Name */}
          <FormInput
            control={form.control}
            name="don_item_name"
            label="Item Name"
            placeholder="Enter item name"
            readOnly={!isEditing}
          />

          {/* Quantity */}
          <FormInput
            control={form.control}
            name="don_qty"
            label="Quantity"
            placeholder="Enter quantity"
            readOnly={!isEditing}
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
              { id: "Baby & Childcare Items", name: "Baby & Childcare Items"},
              { id: "Animal Welfare Items", name: "Animal Welfare Items" },
              { id: "Shelter & Homeless Aid", name: "Shelter & Homeless Aid"},
              { id: "Disaster Relief Supplies", name: "Disaster Relief Supplies"},
            ]}
            readOnly={!isEditing}
          />

          {/* Receiver */}
          <FormSelect
            control={form.control}
            name="don_receiver"
            label="Received by"
            options={[
              { id: "Employee 1", name: "Employee 1" },
              { id: "Employee 2", name: "Employee 2" },
            ]}
            readOnly={!isEditing}
          />

          {/* Item Description */}
          <FormInput
            control={form.control}
            name="don_description"
            label="Item Description"
            placeholder="Enter item description"
            readOnly={!isEditing}
          />

          {/* Donation Date */}
          <FormDateTimeInput
            control={form.control}
            name="don_date"
            type='date'
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
                    <Button
                      type="button"
                      className="bg-blue hover:bg-blue/90"
                      disabled={isPending}
                    >
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
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-blue hover:bg-blue/90"
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