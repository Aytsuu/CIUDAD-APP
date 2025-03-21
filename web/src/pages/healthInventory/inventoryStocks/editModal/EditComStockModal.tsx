// EditCommodityStockForm.tsx
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectLayout } from "@/components/ui/select/select-layout";
import {
  CommodityStockType,
  CommodityStocksSchema,
} from "@/form-schema/inventory/inventoryStocksSchema";
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import { fetchCommodity } from "../request/Fetch";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { useCategoriesCommodity } from "../request/CommodityCategory";

interface EditCommodityStockFormProps {
  initialData: {
    id: number;
    commodityName: string;
    category: string;
    recevFrom: string;
    qty: string;
    availQty: string;
    expiryDate: string;
    dispensed: string;
  };
}

export default function EditCommodityStockForm({
  initialData,
}: EditCommodityStockFormProps) {
  UseHideScrollbar();

  const parseQuantity = (qtyString: string) => {
    try {
      if (!qtyString) {
        return { qty: 0, pcs: 0, unit: "pcs" as const };
      }

      const boxMatch = qtyString.match(/(\d+) bx\/s \((\d+) pc\/s\)/);
      if (boxMatch && boxMatch[1] && boxMatch[2]) {
        return {
          qty: parseInt(boxMatch[1]),
          pcs: parseInt(boxMatch[2]),
          unit: "boxes" as const,
        };
      }

      const piecesMatch = qtyString.match(/(\d+)/);
      return {
        qty: piecesMatch ? parseInt(piecesMatch[0]) : 0,
        pcs: 0,
        unit: "pcs" as const,
      };
    } catch (error) {
      console.error("Error parsing quantity:", error);
      return { qty: 0, pcs: 0, unit: "pcs" as const };
    }
  };

  const form = useForm<CommodityStockType>({
    resolver: zodResolver(CommodityStocksSchema),
    defaultValues: {
      commodityName: initialData?.commodityName || "",
      category: initialData?.category || "",
      recevFrom: initialData?.recevFrom || "",
      ...parseQuantity(initialData?.qty || ""),
      expiryDate: initialData?.expiryDate || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      const parsed = parseQuantity(initialData.qty);
      form.reset({
        commodityName: initialData.commodityName,
        category: initialData.category,
        // id: initialData.id,
        recevFrom: initialData.recevFrom,
        ...parsed,
        expiryDate: initialData.expiryDate,
      });
    }
  }, [initialData, form]);

  const commodity = fetchCommodity();

  const onSubmit = async (data: CommodityStockType) => {
    console.log(data);
    alert("✅ Data saved successfully!");
  };

  const currentUnit = form.watch("unit");
  const qty = form.watch("qty") || 0;
  const pcs = form.watch("pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : 0;

  // Form options

  const {
    categories,
    handleDeleteConfirmation,
    categoryHandleAdd,
    ConfirmationDialogs,
  } = useCategoriesCommodity();

  const recevFromOptions = [
    { id: "DOH", name: "DOH" },
    { id: "CHD", name: "CHD" },
    { id: "OTHERS", name: "OTHERS" },
  ];

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1  hide-scrollbar">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="commodityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commodity Name</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Commodity"
                      options={commodity}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    {/* Category Dropdown with Add/Delete */}
                    <SelectLayoutWithAdd
                      placeholder="select"
                      label="Select a Category"
                      options={categories}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      onAdd={(newCategoryName) => {
                        categoryHandleAdd(newCategoryName, (newId) => {
                          field.onChange(newId); // Update the form value with the new category ID
                        });
                      }}
                      onDelete={(id) => handleDeleteConfirmation(Number(id))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value?.split("T")[0] || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="recevFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Received From</FormLabel>
                <FormControl>
                  <SelectLayout
                    label=""
                    className="w-full"
                    placeholder="Select Source"
                    options={recevFromOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="qty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {currentUnit === "boxes" ? "Number of Boxes" : "Quantity"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="quantity"
                      min={0}
                      value={field.value || ""} // Handle undefined and 0
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? 0 : Number(value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Unit"
                      options={[
                        { id: "boxes", name: "Boxes" },
                        { id: "pcs", name: "Pieces" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {currentUnit === "boxes" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="pcs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pieces per Box</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="pcs"
                        value={field.value || ""} // Handle undefined and 0
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? 0 : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem className="sm:col-span-2">
                <FormLabel>Total Pieces</FormLabel>
                <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {totalPieces.toLocaleString()} pieces
                  <span className="ml-2 text-muted-foreground text-xs">
                    ({qty} boxes × {pcs} pieces/box)
                  </span>
                </div>
              </FormItem>
            </div>
          )}

          <div className="flex justify-end gap-3  bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
      {ConfirmationDialogs()}
    </div>
  );
}
