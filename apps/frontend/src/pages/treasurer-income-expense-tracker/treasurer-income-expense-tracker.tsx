import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown} from "lucide-react";
import { Trash } from 'lucide-react';
import { Pencil } from 'lucide-react';
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import IncomeExpenseFormSchema from "@/form-schema/income-expense-tracker-schema";
import { Textarea } from "@/components/ui/textarea";

export const columns: ColumnDef<IncomeExpense>[] = [
    { accessorKey: "serialNo",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Serial No.
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("serialNo")}</div>
        )
    },
    { accessorKey: "date",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >Date
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("date")}</div>
        ) },
    { accessorKey: "particulars", header: "Particulars" },
    { accessorKey: "amount", header: "Amount" },
    { accessorKey: "entryType", header: "Entry Type" },
    { accessorKey: "receiver", header: "Receiver" },
    { accessorKey: "addNotes", header: "Additional Notes" },
    { accessorKey: "actions", 
      header: "Action", 
      cell: ({}) =>(
        <div className="flex justify-center gap-2">
            <TooltipLayout
             trigger={
                <DialogLayout
                            trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Pencil size={16} /></div>}
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />}
                />
             }  content="Update">
             </TooltipLayout>
             <TooltipLayout 
             trigger={
                <DialogLayout
                            trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"> <Trash size={16} /></div>}
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} 
                />
             }  content="Delete"
             ></TooltipLayout>
        </div>
      )
    }
];

type IncomeExpense ={
    serialNo: string,
    date: string,
    particulars: string,
    amount: string,
    entryType: string,
    receiver: string,
    addNotes: string,
}

export const IncomeExpenseRecords: IncomeExpense[] = [
    {
        serialNo: "12345",
        date: 'MM/DD/YYYY',
        particulars: 'Particulars',
        amount: "0.00",
        entryType: "Type",
        receiver: 'Receiver',
        addNotes: 'Additional Notes',
    }
]

function onSubmit(values: z.infer<typeof IncomeExpenseFormSchema>){
    console.log(values)
}


function IncomeandExpenseTracking() {
    const data = IncomeExpenseRecords;
    const entrytypeSelector = [
        { id: "0", name: "Income"},
        { id: "1", name: "Expense"}
    ];

    const filter = [
        {id: "0", name: "All"},
        {id: "1", name: "Income"},
        {id: "2", name: "Expense"   }
    ]
    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

    const filteredData = selectedFilter === "All" 
    ? data 
    : data.filter((item) => item.entryType === selectedFilter);

    const form = useForm<z.infer<typeof IncomeExpenseFormSchema>>({
        resolver: zodResolver(IncomeExpenseFormSchema),
        defaultValues: {
            serialNo: "",
            entryType: "",
            particulars: "",
            amount: "",
            receiver: "",
            addNotes: ""
        }
    });

    

    return (
        <div className="mx-4 mb-4 mt-10">
            <div className="bg-white border border-gray-300 rounded-[5px] p-5">
                <div className="mb-[1rem] flex flex-row items-center justify-between gap-2">
                    <div className="flex flex-row gap-2">
                        <Input className="w-[20rem]"placeholder="Search"></Input>
                        <SelectLayout className="" options={filter} placeholder="Filter" value={selectedFilter} label="" onChange={setSelectedFilter}></SelectLayout>
                    </div>
                    <DialogLayout
                        trigger={<Button>+ New Entry</Button>}
                        className="max-w-md"
                        title="Add New Entry"
                        description="Fill in the details for your entry."
                        mainContent={
                           <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)}>
                                    <div>
                                        <FormField
                                            control={form.control}
                                            name="serialNo"
                                            render={({field }) =>(
                                                <FormItem>
                                                    <FormLabel>Serial No.</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="(e.g. 123456)" type="number"></Input>
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}>
                                        </FormField>
                                    </div>

                                    <div>
                                        <FormField
                                        control={form.control}
                                        name="entryType"
                                        render={({field }) =>(
                                            <FormItem>
                                                <FormLabel>Entry Type</FormLabel>
                                                <FormControl>
                                                    <SelectLayout {...field} options={entrytypeSelector} value={field.value} onChange={field.onChange} label="" placeholder="Select Entry Type" className="w-full"></SelectLayout>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}></FormField>
                                    </div>

                                    <div>
                                        <FormField
                                        control={form.control}
                                        name="particulars"
                                        render={({field }) => (
                                            <FormItem>
                                                <FormLabel>Particulars</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Enter particulars"></Input>
                                                    </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}></FormField>
                                    </div>

                                    <div>
                                        <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({field })=>(
                                            <FormItem>
                                                <FormLabel>Amount</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="number" placeholder="Enter amount"></Input>
                                                    </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}></FormField>
                                    </div>

                                    <div>
                                        <FormField
                                        control={form.control}
                                        name="receiver"
                                        render={({field }) =>(
                                            <FormItem>
                                                <FormLabel>Receiver</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Enter receiver name"></Input>
                                                    </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}></FormField>
                                    </div>

                                    <div>
                                        <FormField
                                        control={form.control}
                                        name="addNotes"
                                        render={({field}) =>(
                                            <FormItem>
                                                <FormLabel>Additional Notes</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} placeholder="Add more details (Optional)"></Textarea>
                                                    </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}></FormField>
                                    </div>


                                    <div className="flex justify-end mt-[20px]">
                                        <Button>Save Entry</Button>       
                                    </div> 
                                </form>
                           </Form>
                        }
                    />
                </div>
                <DataTable columns={columns} data={filteredData} />
            </div>
        </div>
    );
}

export default IncomeandExpenseTracking;
