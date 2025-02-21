import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { DataTable } from "@/components/ui/table/data-table"
import { Input } from "@/components/ui/input"
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Eye } from 'lucide-react';
import { ReceiptText } from 'lucide-react';
import { Trash } from 'lucide-react';
import { useState } from "react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import PersonalClearanceFormSchema from "@/form-schema/personalClearance-schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"


export const columns: ColumnDef<PersonalClearance>[] = [
    { accessorKey:"fname", header: "Firstname"},
    { accessorKey: "lname", header: "Lastname"},
    { accessorKey: "purposes", header: "Purpose"},
    { accessorKey: "reqDate", header: "Date or Request"},
    { accessorKey: "claimDate", header: "Date to Claim"},
    { accessorKey: "payStat", header: "Payment Status"},
    { accessorKey: "action", 
      header: "Action",
      cell: ({}) => (
        <div className="flex justify-center gap-1">
            <TooltipLayout 
            trigger = {
                <DialogLayout
                trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Eye size={16} /></div>}
                className="max-w-[50%] h-2/3 flex flex-col"
                title="Image Details"
                description="Here is the image related to the report."
                mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path

                />
            } content="View">
            </TooltipLayout>
            <TooltipLayout
            trigger={
                <DialogLayout
                trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><ReceiptText size={16}/></div>}
                    className="max-w-[50%] h-2/3 flex flex-col"
                    title="Image Details"
                    description="Here is the image related to the report."
                    mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto"/>}
                />
            } content="Create Receipt">
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
      )}
];

type PersonalClearance = {
    fname: string,
    lname: string,
    purposes: string[],
    reqDate: string,
    claimDate: string,
    payStat: string
}

// Validation Schema

   export const PersonalClearanceRecords: PersonalClearance[] = [
        {
            fname: "Firstname",
            lname: "Lastname",
            purposes: ["Purpose"],
            reqDate: "MM-DD-YYYY",
            claimDate: "MM-DD-YYYY",
            payStat: "Status",
        },
    ];

    const onSubmit = (data: any) => {
        console.log("Form Data:", data);
    };




function PersonalClearance(){
    const data = PersonalClearanceRecords;
    const filter = [
        { id: "0", name: "All" },
        { id: "1", name: "Pending" },
        { id: "2", name: "Paid" },
    ];
    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

    const form = useForm<z.infer<typeof PersonalClearanceFormSchema>>({
        resolver: zodResolver(PersonalClearanceFormSchema),
            defaultValues: {
                serialNo: "",
                requester: "",
                purposes: [], 
            },
        });




        return (
            <div className="mx-4 mb-4 mt-10">
                <div className="bg-white border border-gray-300 rounded-[5px] p-5">
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex flex-row gap-2">
                                <Input className="w-[20rem]" placeholder="Search" />
                                <SelectLayout className="" options={filter} placeholder="Filter" value={selectedFilter} label="" onChange={setSelectedFilter}></SelectLayout>
                            </div>
                            <div>
                                <DialogLayout
                                    trigger={<Button>+ Create Request</Button>}
                                    className=""
                                    title="Create New Request"
                                    description="Create a new request for personal clearance."
                                    mainContent={
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-7">
                                                
                                                <div className="flex flex-col gap-5">
                                                    <FormField
                                                        control={form.control}
                                                        name="serialNo"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Receipt Serial No.:</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="e.g.(123456)" type="number" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
    
                                                    <FormField
                                                        control={form.control}
                                                        name="requester"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Requester:</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="e.g.(Juan Dela Cruz)" type="text" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
    
                                                <div>
                                                    <FormField
                                                        control={form.control}
                                                        name="purposes"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Select a purpose:</FormLabel>

                                                                {/* Bordered box for checkboxes */}
                                                                <div className="flex flex-col gap-3 border border-gray-300 p-2">
                                                                    {[
                                                                        "Employment",
                                                                        "NSO/SSS/GSIS",
                                                                        "Hospitalization/ CHAMP",
                                                                        "Birth Certificate",
                                                                        "Medical Assistance",
                                                                        "Residency",
                                                                    ].map((purpose) => (
                                                                        <div key={purpose} className="flex items-center gap-2">
                                                                            <Checkbox
                                                                                checked={field.value?.includes(purpose)}
                                                                                onCheckedChange={(checked: boolean) => {
                                                                                    field.onChange(
                                                                                        checked
                                                                                            ? [...field.value, purpose] // Add selected purpose
                                                                                            : field.value.filter((p: string) => p !== purpose) // Remove unselected purpose
                                                                                    );
                                                                                }}
                                                                            />
                                                                            <FormLabel>{purpose}</FormLabel>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Form message appears below the border */}
                                                                <FormMessage className="mt-2" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

    
                                                {/* Submit Button */}
                                                <div className="flex justify-end">
                                                    <Button type="submit">Proceed</Button>
                                                </div>
                                            </form>
                                        </Form>
                                    }
                                />
                            </div>
                        </div>
    
                        {/* Data Table */}
                        <DataTable columns={columns} data={data} />
                    </div>
                </div>
            </div>
        );
    
};
export default PersonalClearance;
