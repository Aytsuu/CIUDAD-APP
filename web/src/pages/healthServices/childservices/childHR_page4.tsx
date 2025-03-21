import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { Supplement,SupplementType } from "@/form-schema/chr-schema";
import { Button } from "@/components/ui/button";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Baby } from "lucide-react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,

} from "@/components/ui/alert-dialog/alert-dialog";
import { ChevronLeft, Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/data-table";
import { zodResolver } from "@hookform/resolvers/zod";

// } from "@/components/ui/alert-dialog";


type Page1FormData = z.infer<typeof Supplement>;

type Page1Props = {
  onPrevious3: () => void;
  onNext5: () => void;
  updateFormData: (data: Partial<Page1FormData>) => void;
  formData: Page1FormData;
};

type IronRecord = {
  ironType: string;
  givenDate: string;
  completedDate: string;
};

type VitaminRecord = {
  vitaminType: string;
  date: string;
};

export default function ChildHRPage4({
  onPrevious3,
  onNext5,
  updateFormData,
  formData,
}: Page1Props) {
  const form = useForm<Page1FormData>({
    resolver:zodResolver(Supplement),
    defaultValues: {
      ...formData,
      ironDates: formData.ironDates || [],
      vitaminRecords: formData.vitaminRecords || [],
    },
  });

  const { handleSubmit, reset, setValue, control, watch } = form;

  useEffect(() => {
    reset({
      ...formData,
      ironDates: formData.ironDates || [],
      vitaminRecords: formData.vitaminRecords || [],
    });
  }, [reset, formData]);

  const handlePrevious = () => {
    updateFormData(form.getValues());
    onPrevious3();
  };

  const onSubmitForm = (data: Page1FormData) => {
    console.log("Submitted Form Data:", data);
    updateFormData(data);
    onNext5();
  };

  const [currentIronDate, setCurrentIronDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [currentVitaminDate, setCurrentVitaminDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedIronType, setSelectedIronType] = useState<string | null>(null);
  const [selectedVitaminType, setSelectedVitaminType] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAddIronDate = () => {
    if (form.getValues("ironDates").length >= 1) {
      setDialogMessage("You can only add iron once.");
      setDialogOpen(true);
      return;
    }
    if (currentIronDate && selectedIronType) {
      const formattedDate = formatDate(currentIronDate);
      const updatedIronDates = [
        ...form.getValues("ironDates"),
        { ironType: selectedIronType, givenDate: formattedDate, completedDate: "" },
      ];
      setValue("ironDates", updatedIronDates);
      setCurrentIronDate(new Date().toISOString().split("T")[0]);
      setSelectedIronType(null);
    }
  };

  const handleAddVitaminDate = () => {
    if (form.getValues("vitaminRecords").length >= 1) {
      setDialogMessage("You can only add one vitamin record.");
      setDialogOpen(true);
      return;
    }
    if (selectedVitaminType && currentVitaminDate) {
      const formattedDate = formatDate(currentVitaminDate);
      const updatedVitaminRecords = [
        ...form.getValues("vitaminRecords"),
        { vitaminType: selectedVitaminType, date: formattedDate },
      ];
      setValue("vitaminRecords", updatedVitaminRecords);
      setSelectedVitaminType(null);
      setCurrentVitaminDate(new Date().toISOString().split("T")[0]);
    }
  };

  const handleDeleteIronDate = (index: number) => {
    const updatedIronDates = form
      .getValues("ironDates")
      .filter((_, i) => i !== index);
    setValue("ironDates", updatedIronDates);
  };

  const handleDeleteVitaminDate = (index: number) => {
    const updatedVitaminRecords = form
      .getValues("vitaminRecords")
      .filter((_, i) => i !== index);
    setValue("vitaminRecords", updatedVitaminRecords);
  };

  const handleUpdateCompletedDate = (index: number, completedDate: string) => {
    const updatedIronDates = [...form.getValues("ironDates")];
    updatedIronDates[index].completedDate = completedDate;
    setValue("ironDates", updatedIronDates);
  };

  const isIronAddButtonDisabled = !selectedIronType || !currentIronDate || !Date.parse(currentIronDate);
  const isVitaminAddButtonDisabled = !selectedVitaminType || !currentVitaminDate || !Date.parse(currentVitaminDate);

  // Define columns for the DataTable
  const ironColumns: ColumnDef<IronRecord>[] = [
    {
      accessorKey: "ironType",
      header: "Iron Type",
    },
    {
      accessorKey: "givenDate",
      header: "Given Date",
    },
    {
      accessorKey: "completedDate",
      header: "Completed Date",
      cell: ({ row }) => (
      <div className="flex justify-center">
          <Input
          type="date"
          className="w-full sm:w-[150px]"
          value={row.original.completedDate || ""}
          onChange={(e) => {
            handleUpdateCompletedDate(row.index, e.target.value);
          }}
        />
      </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="destructive"
          onClick={() => handleDeleteIronDate(row.index)}
        >
          <Trash2 size={16} />
        </Button>
      ),
    },
  ];

  const vitaminColumns: ColumnDef<VitaminRecord>[] = [
    {
      accessorKey: "vitaminType",
      header: "Vitamin Type",
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="destructive"
          onClick={() => handleDeleteVitaminDate(row.index)}
        >
          <Trash2 size={16} />
        </Button>
      ),
    },
  ];

  return (

    
    <div className=" bg-white rounded-lg shadow  md:p-4 lg:p-8">

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Iron Given Section */}
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-10  mb-10">
            <div className="flex flex-col space-y-4 w-full lg:w-auto">
              <FormLabel className="font-semibold text-gray-700">
                Date Iron Given:
              </FormLabel>
              <div className="flex flex-col gap-2 sm:gap-3">
                <FormField
                  control={control}
                  name="ironDates"
                  render={() => (
                    <FormItem className="w-full">
                      <FormControl>
                        <SelectLayout
                          label="Iron Type"
                          placeholder="Select Iron Type"
                          className="w-full"
                          options={[
                            { id: "iron_1", name: "Iron 1" },
                            { id: "iron_2", name: "Iron 2" },
                          ]}
                          value={selectedIronType ?? ""}
                          onChange={(value: string) => {
                            setSelectedIronType(value);
                            setCurrentIronDate(new Date().toISOString().split("T")[0]);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-5">
                  <FormField
                    control={control}
                    name="ironDates"
                    render={() => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            type="date"
                            value={currentIronDate}
                            onChange={(e) => {
                              setCurrentIronDate(e.target.value);
                            }}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    className="bg-green-500 text-white w-full sm:w-auto"
                    onClick={handleAddIronDate}
                    disabled={isIronAddButtonDisabled}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Iron Given History Section */}
            <div className="w-full">
              <DataTable columns={ironColumns} data={watch("ironDates")} />
            </div>
          </div>
          <hr className="border-gray mb-10 sm:mb-8 " />


          {/* Vitamin Given Section */}
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-10 mt- ">
            <div className="flex flex-col space-y-4 w-full lg:w-auto">
              <FormLabel className="font-semibold text-gray-700">
                Vitamin A Given:
              </FormLabel>
              <div className="flex flex-col gap-2 sm:gap-3">
                <FormField
                  control={control}
                  name="vitaminRecords"
                  render={() => (
                    <FormItem className="w-full">
                      <FormControl>
                        <SelectLayout
                          label="Vitamin Type"
                          placeholder="Select Vitamin"
                          className="w-full"
                          options={[
                            { id: "vitamin_1000IU", name: "Vitamin 1000IU" },
                            { id: "vitamin_2000IU", name: "Vitamin 2000IU" },
                          ]}
                          value={selectedVitaminType ?? ""}
                          onChange={(value: string) => {
                            setSelectedVitaminType(value);
                            setCurrentVitaminDate(new Date().toISOString().split("T")[0]);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-5">
                  <FormField
                    control={control}
                    name="vitaminRecords"
                    render={() => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            type="date"
                            value={currentVitaminDate}
                            onChange={(e) => {
                              setCurrentVitaminDate(e.target.value);
                            }}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    className="bg-green-500 text-white w-full sm:w-auto"
                    onClick={handleAddVitaminDate}
                    disabled={isVitaminAddButtonDisabled}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Vitamin Given History Section */}
            <div className="w-full">
              <DataTable columns={vitaminColumns} data={watch("vitaminRecords")} />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="w-[100px]"
            >
              Previous
            </Button>
            <Button type="submit" className="w-[100px]">
              Next
            </Button>
          </div>
        </form>
      </Form>

      {/* Alert Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alert</AlertDialogTitle>
            <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDialogOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}