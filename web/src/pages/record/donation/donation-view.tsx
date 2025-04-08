import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button/button";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form/form';
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from '@/components/ui/form/form-select';
import { FormDateInput } from '@/components/ui/form/form-date-input';
import ClerkDonateViewSchema from '@/form-schema/donate-view-schema';
import { putdonationreq } from './request-db/donationPutRequest';
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

type ClerkDonateViewProps = {
    don_num: number;
    don_donorfname: string;
    don_donorlname: string;
    don_item_name: string;
    don_qty: number;
    don_category: string;
    don_receiver: string;
    don_description?: string;
    don_date: string;
    onSaveSuccess?: () => void;
  };

function ClerkDonateView({
  don_num,
  don_donorfname,
  don_donorlname,
  don_item_name,
  don_qty,
  don_category,
  don_receiver,
  don_description,
  don_date,
  onSaveSuccess,
}: ClerkDonateViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof ClerkDonateViewSchema>>({
    resolver: zodResolver(ClerkDonateViewSchema),
    defaultValues: {
      don_donorfname,
      don_donorlname,
      don_item_name,
      don_qty,
      don_category,
      don_receiver,
      don_description,
      don_date,
    },
  });

  const onSubmit = async (values: z.infer<typeof ClerkDonateViewSchema>) => {
    const toastId = toast.loading('Updating donation...', {
      duration: Infinity
    });

    try {
      await putdonationreq(don_num, values);
      
      toast.success('Donation updated successfully', {
        id: toastId,
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
        onAutoClose: () => {
          setIsEditing(false);
          if (onSaveSuccess) onSaveSuccess();
        }
      });
      
    } catch (err) {
      toast.error('Failed to update donation', {
        id: toastId,
        duration: 2000
      });
      console.error("Update failed:", err);
      setError(err instanceof Error ? err.message : "Failed to update donation");
    }
  };

  const handleConfirmSave = async () => {
    const values = form.getValues();
    const toastId = toast.loading('Updating donation...', { duration: Infinity });
  
    try {
      await putdonationreq(don_num, values);
      
      toast.success('Donation updated successfully', {
        id: toastId,
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      
      setIsEditing(false);
      if (onSaveSuccess) onSaveSuccess();
      
    } catch (err) {
      toast.error('Failed to update donation', { id: toastId, duration: 2000 });
      console.error("Update failed:", err);
      setError(err instanceof Error ? err.message : "Failed to update donation");
    }
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-6 max-w-4xl mx-auto rounded-lg overflow-auto">
      <div className="pb-4">
        <h2 className="text-lg font-semibold">DONATION DETAILS</h2>
        <p className="text-xs text-black/50">View or edit donation details</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
              { id: 'Employee 1', name: 'Employee 1' },
              { id: 'Employee 2', name: 'Employee 2' },
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
          <FormDateInput
            control={form.control}
            name="don_date"
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
          setError(null);
        }}
        variant="outline"
      >
        Cancel
      </Button>
      
      <ConfirmationModal
        trigger={
          <Button 
            type="button" 
            className="bg-buttonBlue hover:bg-buttonBlue/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
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
      className="bg-buttonBlue hover:bg-buttonBlue/90"
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