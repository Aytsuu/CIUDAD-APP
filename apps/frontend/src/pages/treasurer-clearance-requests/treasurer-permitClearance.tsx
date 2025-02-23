import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Input } from "@/components/ui/input";
import { Eye } from 'lucide-react';
import { ReceiptText } from 'lucide-react';
import { Trash } from 'lucide-react';
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod"
import PermitClearanceFormSchema from "@/form-schema/permitClearance-schema";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { useForm } from "react-hook-form";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";



const styles = {
    ViewFormLabelStyle: "font-semibold text-blue",
    ViewFormDataStyle: "font-medium text-darkGray"
}

//table header
export const columns: ColumnDef<PermitClearance>[] = [
    { accessorKey: "businessName",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >Business Name
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("businessName")}</div>
        )},
    { accessorKey: "address", header: "Address"},
    { accessorKey: "grossSales", header: "Gross Sales"},
    {
        accessorKey: "purpose",
        header: "Purpose",
        cell: ({ row }) => row.original.purposes.join(", ") // Convert array to string
      },
    { accessorKey: "requestor", header: "Requestor"},
    { accessorKey: "reqDate",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >Date Requested
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("reqDate")}</div>
        )
    },
    {  accessorKey: "claimDate",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >Date to Claim
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("claimDate")}</div>
        )
    },
    { accessorKey: "paymentStat", header: "Payment Status"},
    { accessorKey: "action", 
      header: "Action",
      cell: ({}) =>(
        <div className="flex justify-center gap-0.5">
            <TooltipLayout 
            trigger = {
                <DialogLayout
                trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Eye size={16} /></div>}
                className="max-w-[50%] h-2/3 flex flex-col"
                title="Request Details"
                description="Detailed overview of the request."
                mainContent={
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-3">
                        <Label className={styles.ViewFormLabelStyle}>Business Name:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Address:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Annual Gross Sales:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Supporting Document:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Purpose:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>
                    </div>

                    {/* Divider */}
                    {/* <div className="border border-gray-300"></div> */}

                    {/* Request Details */}
                    <div className="flex flex-col gap-3">
                        <Label className={styles.ViewFormLabelStyle}>Requestor:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Date Requested:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Date to Claim:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Payment Method:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Payment Status:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Attached Receipt:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>
                    </div>
                </div>
                } 
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
      )},
];

//Dropdown Contents
const filter = [
    { id: "0", name: "All" },
    { id: "1", name: "Pending" },
    { id: "2", name: "Paid" },
];

const annualGrossSales = [
    { id: "0", name: "0000000"}
];

type PermitClearance = {
    businessName: string,
    address: string,
    grossSales: string,
    purposes: string[],
    requestor: string,
    reqDate: string,
    claimDate: string,
    paymentStat: string
}

export const PermitClearanceRecords: PermitClearance[] = [
    {
        businessName: "Business Name",
        address: "Address",
        grossSales: "0.00",
        purposes: ["Lorem Ipsum"], 
        requestor: "Requestor",
        reqDate: "MM-DD-YYYY",
        claimDate: "MM-DD-YYYY",
        paymentStat: "Status"
    },

]


function onSubmit(values: z.infer<typeof PermitClearanceFormSchema>){
    console.log(values)
}


function PermitClearance(){
    const data = PermitClearanceRecords;
    const [selectedFilter, setSelectedFilter] = useState(filter[0].name)

    const form = useForm<z.infer<typeof PermitClearanceFormSchema>>({
        resolver: zodResolver(PermitClearanceFormSchema),
        defaultValues: {
            serialNo: "",
            businessName: "",
            requestor: "",
            address: "",
            grossSales: "",
            purposes: []
        },
    })
    
    return(
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
                                description="Create new request for permit."
                                mainContent = {
                                    <Form {...form}>
                                        <form onSubmit = {form.handleSubmit(onSubmit)}>
                                            <div className="grid max-w-3xl mx-auto gap-7">
                                                <div className="grid grid-cols-2 gap-5 w-full">
                                                    <div>
                                                        <FormField
                                                            control={form.control}
                                                            name="serialNo"
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <FormLabel>Serial No.: </FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} type="number" placeholder="e.g.(123456)"></Input>
                                                                    </FormControl>
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}>

                                                        </FormField>
                                                    </div>

                                                    <div>
                                                        <FormField
                                                            control={form.control}
                                                            name="businessName"
                                                            render = {({field}) =>(
                                                                <FormItem>
                                                                    <FormLabel>Business Name</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} placeholder="Enter business name"></Input>
                                                                    </FormControl>
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}>
                                                        </FormField>
                                                    </div>

                                                    <div>
                                                        <FormField
                                                            control={form.control}
                                                            name="address"
                                                            render={({field})=>(
                                                                <FormItem>
                                                                    <FormLabel>Address</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} placeholder="Enter business address"></Input>
                                                                    </FormControl>
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}>
                                                        </FormField>
                                                    </div>

                                                    <div>
                                                        <FormField
                                                            control={form.control}
                                                            name="grossSales"
                                                            render={({field})=> (
                                                                <FormItem>
                                                                    <FormLabel>Gross Sales</FormLabel>
                                                                    <FormControl>
                                                                        <SelectLayout {...field} className="w-full" options={annualGrossSales} label="" placeholder="Select Annual Gross Sales" value={field.value} onChange={field.onChange}></SelectLayout>
                                                                    </FormControl>
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}>
                                                        </FormField>
                                                    </div>

                                                    <div>
                                                        <FormField
                                                            control={form.control}
                                                            name="requestor"
                                                            render={({field}) =>(
                                                                <FormItem>
                                                                    <FormLabel>Requestor</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} placeholder="Enter requestor name"></Input>
                                                                    </FormControl>
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}>
                                                        </FormField>
                                                    </div>
                                                </div>

                                                <div>       
                                                        <FormField
                                                            control={form.control}
                                                            name="purposes"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Select a purpose:</FormLabel>
                                                                    
                                                                    {/* Border around the checkbox group */}
                                                                    <div className="flex flex-col gap-3 border border-gray-300 p-2">
                                                                        {[
                                                                            "Commercial Building Permit",
                                                                            "Residential Permit",
                                                                            "Business Permit",
                                                                            "Water Connection Permit (Commercial)",
                                                                            "Water Connection Permit (Residential)",
                                                                            "Electrical Permit Connection (Commercial)",
                                                                        ].map((purpose) => {
                                                                            const valueArray = field.value || [];
                                                                            return (
                                                                                <div key={purpose} className="flex items-center gap-2">
                                                                                    <Checkbox
                                                                                        checked={valueArray.includes(purpose)}
                                                                                        onCheckedChange={(checked: boolean) => {
                                                                                            field.onChange(
                                                                                                checked
                                                                                                    ? [...valueArray, purpose] // Add selected purpose
                                                                                                    : valueArray.filter((p: string) => p !== purpose) // Remove unselected purpose
                                                                                            );
                                                                                        }}
                                                                                    />
                                                                                    <FormLabel className="truncate w-full">{purpose}</FormLabel>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>

                                                                    {/* FormMessage placed below the border */}
                                                                    <FormMessage className="mt-2" />

                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>


                                                <div className="flex justify-end">
                                                    <Button>Proceed</Button>
                                                </div>
                                            </div>
                                        </form>
                                    </Form>
                                }>
                            </DialogLayout>
                        </div>
                    </div>
                     <DataTable columns={columns} data={data}/>
                </div>
             </div>
        </div>
    )
}

export default PermitClearance