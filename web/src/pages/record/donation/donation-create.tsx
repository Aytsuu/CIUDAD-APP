import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { useAddDonation } from "./queries/donationAddQueries";
import { useGetPersonalList } from "./queries/donationFetchQueries";
import ClerkDonateCreateSchema from "@/form-schema/donate-create-form-schema";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ClerkDonateCreateFormProps } from "./donation-types";
import { ComboboxInput } from "@/components/ui/form/form-combobox-input";
import { useAuth } from "@/context/AuthContext";

function ClerkDonateCreate({ onSuccess }: ClerkDonateCreateFormProps) {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof ClerkDonateCreateSchema>>({
    resolver: zodResolver(ClerkDonateCreateSchema),
    defaultValues: {
      don_donor: "",
      per_id: null,
      don_item_name: "",
      don_qty: "",
      don_description: "",
      don_category: "",
      don_date: new Date().toISOString().split("T")[0],
      don_status: "Stashed",
      staff: user?.staff?.staff_id || null,
    },
  });

  const { mutate: addDonation, isPending } = useAddDonation();
  const { data: personalList = [], isLoading: isPersonalLoading } =
    useGetPersonalList();
  const [isMonetary, setIsMonetary] = useState<boolean>(false);

  const categoryWatch = form.watch("don_category");

  useEffect(() => {
    setIsMonetary(categoryWatch === "Monetary Donations");
    if (categoryWatch === "Monetary Donations") {
      form.setValue("don_item_name", "");
    }
  }, [categoryWatch, form]);

  const onSubmit = (values: z.infer<typeof ClerkDonateCreateSchema>) => {
    const payload = {
      ...values,
    };

    addDonation(payload, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-2 rounded-lg overflow-auto">
      <div className="grid gap-4">
        <Form {...form}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-4"
          >
            <ComboboxInput
              value={form.watch("don_donor")}
              options={personalList}
              isLoading={isPersonalLoading}
              label="Donor Name"
              placeholder="Select donor..."
              emptyText="No donor found. Enter name manually or select Anonymous."
              onSelect={(value, item) => {
                form.setValue("don_donor", value);
                form.setValue("per_id", item?.per_id || null);
              }}
              onCustomInput={(value) => {
                form.setValue("don_donor", value);
                form.setValue("per_id", null);
              }}
              displayKey="full_name"
              valueKey="per_id"
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
                {
                  id: "Baby & Childcare Items",
                  name: "Baby & Childcare Items",
                },
                { id: "Animal Welfare Items", name: "Animal Welfare Items" },
                {
                  id: "Shelter & Homeless Aid",
                  name: "Shelter & Homeless Aid",
                },
                {
                  id: "Disaster Relief Supplies",
                  name: "Disaster Relief Supplies",
                },
              ]}
              readOnly={false}
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
                readOnly={false}
              />
            ) : (
              <FormInput
                control={form.control}
                name="don_item_name"
                label="Item Name"
                placeholder="Enter item name"
                readOnly={false}
              />
            )}

            {/* Quantity */}
            <FormInput
              control={form.control}
              name="don_qty"
              label={isMonetary ? "Amount" : "Quantity"}
              placeholder={isMonetary ? "Enter amount" : "Enter quantity"}
              readOnly={false}
            />

            {/* Item Description */}
            <FormInput
              control={form.control}
              name="don_description"
              label="Description"
              placeholder="Enter description"
              readOnly={false}
            />

            {/* Donation Date */}
            <FormDateTimeInput
              control={form.control}
              name="don_date"
              type="date"
              label="Donation Date"
              readOnly={false}
            />

            {/* Submit Button */}
            <div className="mt-8 flex justify-end gap-3">
              <ConfirmationModal
                trigger={
                  <Button type="button" className="" disabled={isPending}>
                    {isPending ? "Saving..." : "Save"}
                  </Button>
                }
                title="Confirm Donation"
                description="Are you sure the details of this entry are accurate?"
                actionLabel="Confirm"
                onClick={form.handleSubmit(onSubmit)}
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default ClerkDonateCreate;