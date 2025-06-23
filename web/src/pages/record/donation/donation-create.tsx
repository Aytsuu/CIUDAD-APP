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
import { useAddDonation } from "./queries/donationAddQueries";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetPersonalList } from "./queries/donationFetchQueries";
import ClerkDonateCreateSchema from "@/form-schema/donate-create-form-schema";

interface ClerkDonateCreateFormProps {
  onSuccess?: () => void;
}

function ClerkDonateCreate({ onSuccess }: ClerkDonateCreateFormProps) {
  const form = useForm<z.infer<typeof ClerkDonateCreateSchema>>({
    resolver: zodResolver(ClerkDonateCreateSchema),
    defaultValues: {
      don_donor: "",
      per_id: null,
      don_item_name: "",
      don_qty: '',
      don_description: "",
      don_category: "",
      don_date: new Date().toISOString().split("T")[0],
    },
  });

  const { mutate: addDonation, isPending } = useAddDonation();
  const { data: personalList = [], isLoading: isPersonalLoading } = useGetPersonalList();
  const [openCombobox, setOpenCombobox] = useState<boolean>(false);
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
      onError: (error) => {
        console.error("Error submitting donation", error);
      }
    });
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
            <FormField
              control={form.control}
              name="don_donor"
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Donor Name</label>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className="w-full h-10 justify-between truncate"
                        disabled={isPersonalLoading}
                      >
                        <span className="truncate">
                          {isPersonalLoading
                            ? "Loading donors..."
                            : field.value || "Select donor..."}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search donor..."
                          onValueChange={(value) => {
                            if (
                              !personalList.some((person) =>
                                person.full_name
                                  .toLowerCase()
                                  .includes(value.toLowerCase())
                              ) && value !== "Anonymous"
                            ) {
                              form.setValue("don_donor", value);
                              form.setValue("per_id", null);
                            }
                          }}
                        />
                        <CommandList>
                          <CommandEmpty>
                            No donor found. Enter name manually or select Anonymous.
                          </CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="Anonymous"
                              onSelect={() => {
                                form.setValue("don_donor", "Anonymous");
                                form.setValue("per_id", null);
                                setOpenCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === "Anonymous"
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              Anonymous
                            </CommandItem>
                            {personalList.map((person) => (
                              <CommandItem
                                key={person.per_id}
                                value={person.full_name}
                                onSelect={() => {
                                  form.setValue("don_donor", person.full_name);
                                  form.setValue("per_id", person.per_id);
                                  setOpenCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === person.full_name
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {person.full_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
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
                { id: "Disaster Relief Supplies", name: "Disaster Relief Supplies" },
              ]}
              readOnly={false}
            />
            
            {/* Item Name - Changes to select when category is Monetary Donations */}
            {isMonetary ? (
              <FormSelect
                control={form.control}
                name="don_item_name"
                label="Money Type"
                options={[
                  { id: "Cash", name: "Cash" },
                  { id: "Cheque", name: "Cheque" },
                  { id: "E-Money", name: "E-Money" },
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
              <Button
                type="submit"
                className=""
                disabled={isPending}
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default ClerkDonateCreate;