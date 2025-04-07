import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import ClerkDonateCreateSchema from "@/form-schema/donate-create-form-schema";
import { postdonationreq } from "./request-db/donationPostRequest";

function ClerkDonateCreate() {
  const form = useForm<z.infer<typeof ClerkDonateCreateSchema>>({
    resolver: zodResolver(ClerkDonateCreateSchema),
    defaultValues: {
      // don_num: 0,
      don_donorfname: "",
      don_donorlname: "",
      don_item_name: "",
      don_qty: 1,
      don_description: "",
      don_category: "",
      don_receiver: "",
      don_date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (values: z.infer<typeof ClerkDonateCreateSchema>) => {
    try {
      await postdonationreq(values);
  } catch (err) {
      console.error("Error submitting donation", err);
  }
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      <div className="pb-2">
        <h2 className="text-lg font-semibold">ADD DONATION</h2>
        <p className="text-xs text-black/50">Fill out all necessary fields</p>
      </div>
      <div className="grid gap-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Reference Number*/}
            {/* <FormInput
              control={form.control}
              name="don_num"
              label="Reference Number"
              placeholder="Please enter reference number"
              readOnly={false}
            /> */}

            {/* Donor First Name */}
            <FormInput
              control={form.control}
              name="don_donorfname"
              label="Donor First Name"
              placeholder="Enter donor's first name"
              readOnly={false}
            />

            {/* Donor Last Name */}
            <FormInput
              control={form.control}
              name="don_donorlname"
              label="Donor Last Name"
              placeholder="Enter donor's last name"
              readOnly={false}
            />

            {/* Item Name */}
            <FormInput
              control={form.control}
              name="don_item_name"
              label="Item Name"
              placeholder="Enter item name"
              readOnly={false}
            />

            {/* Quantity */}
            <FormInput
              control={form.control}
              name="don_qty"
              label="Quantity"
              placeholder="Enter quantity"
              readOnly={false}
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
              readOnly={false}
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
              readOnly={false}
            />

            {/* Item Description */}
            <FormInput
              control={form.control}
              name="don_description"
              label="Item Description"
              placeholder="Enter item description"
              readOnly={false}
            />

            {/* Donation Date */}
            <FormDateInput
              control={form.control}
              name="don_date"
              label="Donation Date"
              readOnly={false}
            />

            {/* Submit Button */}
            <div className="mt-8 flex justify-end gap-3">
              <Button
                type="submit"
                className="bg-buttonBlue hover:bg-buttonBlue/90"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default ClerkDonateCreate;
