import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { DataTable } from "@/components/ui/table/data-table"
import { Input } from "@/components/ui/input"
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Eye } from 'lucide-react';
import { ReceiptText } from 'lucide-react';
import { useState } from "react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"


export const columns: ColumnDef<PersonalClearance>[] = [
    { accessorKey:"fname", header: "Firstname"},
    { accessorKey: "lname", header: "Lastname"},
    { accessorKey: "purpose", header: "Purpose"},
    { accessorKey: "reqDate", header: "Date or Request"},
    { accessorKey: "claimDate", header: "Date to Claim"},
    { accessorKey: "payStat", header: "Payment Status"},
    { accessorKey: "action", 
      header: "Action",
      cell: ({}) => (
        <div className="flex justify-center gap-2">
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

        </div>
      )}
];

type PersonalClearance = {
    fname: string,
    lname: string,
    purpose: string,
    reqDate: string,
    claimDate: string,
    payStat: string
}
    
//     // const columnHeaders =  {
//     //     PersonalClearanceReq: ["Firstname", "Lastname", "Purpose", "Date Requested", "Date to Claim", "Payment Status"],
//     //     PermitClearanceReq:  ["Business Name", "Address", "Purpose", "Requested By", "Date Requested", "Date to Claim", "Payment Status"],
//     //     ServiceChargeReq: ["Case No.", "Name", "Address", "Respondent Name", "Address", "Reason", "Date Requested", "Payment Status"],
//     //     BarangayServiceReq: ["Firstname", "Lastname", "Purpose", "Date Requested", "Payment Status"]
//     // }

//     // const data =[
//     //     { Personal: {fname: "Kat", lname: "Shin", purpose: "NBI", reqDate: "03-31-2025", claimDate: "04-02-2025", Receipt: "Receipt", status:"Paid"},
//     //       Permit: {business: "Palawan Pawnshop", address: "R.Palma Street", purpose: "Commercial Building Permit", reqName: "Katrina Shin", reqDate: "03-15-2025", claimDate: "03-20-2025", status: "Pending"},
//     //       ServiceCharge: {caseNo: 12356, name: "Katrina Caballes", address: "Lawaan, Talisay City, Cebu", reason:"nanukmag ug silingan", reqDate: "03-20-2025"}
//     //     }
//     // ]

// Validation Schema
const formSchema = z.object({
    serialNo: z.string().min(1, "Serial number is required"),
    requester: z.string().min(1, "Requester name is required"),
    purposes: z.array(z.string()).min(1, "Please select at least one purpose"),
});

const CertificateAndPermitReq = () => {
    const data = [
        {
            fname: "Firstname",
            lname: "Lastname",
            purpose: "Purpose",
            reqDate: "MM-DD-YYYY",
            claimDate: "MM-DD-YYYY",
            payStat: "Status",
        },
    ];

    const filter = [
        { id: "0", name: "All" },
        { id: "1", name: "Pending" },
        { id: "2", name: "Paid" },
    ];

    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

    // Form Hook
    const form = useForm<{ serialNo: string; requester: string; purposes: string[] }>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            serialNo: "",
            requester: "",
            purposes: [], 
        },
    });

    const onSubmit = (data: any) => {
        console.log("Form Data:", data);
    };

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
                                            {/* Serial No. and Requester */}
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

                                            {/* Purpose Selection */}
                                            <div className="flex flex-col gap-4">
                                                <FormLabel>Select a purpose:</FormLabel>
                                                <div className="flex flex-col gap-3">
                                                    {["Employment", "NSO/SSS/GSIS", "Hospitalization/ CHAMP", "Birth Certificate", "Medical Assistance", "Residency"].map((purpose) => (
                                                        <FormField
                                                            key={purpose}
                                                            control={form.control}
                                                            name="purposes"
                                                            render={({ field }) => (
                                                                <FormItem className="flex items-center gap-2">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(purpose)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...field.value, purpose])
                                                                                    : field.onChange(field.value.filter((p: string) => p !== purpose));
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel>{purpose}</FormLabel>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </div>
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

export default CertificateAndPermitReq;
