import { useFormContext, UseFormReturn } from "react-hook-form"
import { useEffect, useState } from "react"
import { z } from "zod"

import { Form } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"
import { Button } from "@/components/ui/button/button"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { FormField, FormControl, FormItem, FormLabel } from "@/components/ui/form/form"
import { Checkbox } from "@/components/ui/checkbox"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { Separator } from "@/components/ui/separator"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormTextArea } from "@/components/ui/form/form-text-area"
import { DataTable } from "@/components/ui/table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Label } from "@/components/ui/label"

import { PostPartumSchema } from "@/form-schema/maternal/postpartum-schema"


export default function PostpartumFormFirstPg(
    {form, onSubmit}: {
        form: UseFormReturn<z.infer<typeof PostPartumSchema>>,
        onSubmit: () => void,
    }
){

    const submit = () => {
        form.trigger(['mothersPersonalInfo', 'postpartumInfo', 'postpartumTable']).then((isValid) => {
            if(isValid) {
                onSubmit();
            }
        })
    }

    const { setValue, getValues } = useFormContext()

    type postpartumTableType = {
        date: string;
        lochialDischarges?: string;
        bp: string; 
        feeding: string;
        findings: string;
        nursesNotes: string | "None";
    }

    const postpartumTableColumns: ColumnDef<postpartumTableType>[] = [
        {
            accessorKey: 'date',
            header: 'Date',
            cell: ({row}) => {
                return (
                    <div className="text-center">{row.original.date}</div>
                )
            }
        },
        {
            accessorKey: 'lochialDischarges',
            header: 'Lochial Discharges',
            cell: ({row}) => {
                return(
                    <div className="text-center">{row.original.lochialDischarges}</div>
                )
            }
        },
        {
            accessorKey: 'bp',
            header: 'BP',
            cell: ({row}) => {
                return(
                    <div className="text-center">{row.original.bp}</div>
                )
            }
        },
        {
            accessorKey: 'feeding',
            header: 'Feeding',
            cell: ({row}) => {
                return (
                    <div className="text-center">{row.original.feeding}</div>
                )
            }
        },
        {
            accessorKey: 'findings',
            header: 'Findings',
            cell: ({row}) => {
                return (
                    <div className="text-center">{row.original.findings}</div>
                )
            }
        },
        {
            accessorKey: 'nursesNotes',
            header: 'Nurses Notes',
            cell: ({row}) => {
                return (
                    <div className="text-center">{row.original.nursesNotes}</div>
                )
            }
        }
    ]

    // date today
    const today = new Date().toLocaleDateString('en-CA');
    const currentDate = new Date().toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "2-digit"
    });

    useEffect(() => {
        setValue("postpartumTable.date", today);
    },[setValue,today])

    const [ postpartumCareData, setpostpartumCareData ] = useState<postpartumTableType[]>([]);

    const addPostpartumCare = () => {
        
        const date = getValues("postpartumTable.date"); 
        const lochialDischarges = getValues("postpartumInfo.lochialDischarges");
        const systolic = parseInt(getValues("postpartumTable.bp.systolic"), 10); 
        const diastolic = parseInt(getValues("postpartumTable.bp.diastolic"), 10); 
        const feeding = getValues("postpartumTable.feeding");
        const findings = getValues("postpartumTable.findings");
        const nursesNotes = getValues("postpartumTable.nursesNotes") || "None";

        const feedingOptions = [
            { id: '0', name: 'Select' },
            { id: '1', name: 'Exclusive Breastfeeding' },
            { id: '2', name: 'Mixed Feeding' },
            { id: '3', name: 'Formula Feeding' }
        ];

        const lochialOptions = [
            { id: '0', name: 'Select' },
            { id: '1', name: 'Lochia Rubra' },
            { id: '2', name: 'Lochia Serosa' },
            { id: '3', name: 'Lochia Alba' }
        ];

        // Convert IDs to names
        const feedingName = feedingOptions.find(option => option.id === feeding)?.name || feeding;
        const lochialName = lochialOptions.find(option => option.id === lochialDischarges)?.name || lochialDischarges;
    
        console.log("Date: ", date, "Wt: ", lochialDischarges, "Systolic: ", systolic, "Diastolic: ", diastolic, "Feeding: ", feeding, "Findings: ", findings, "Nurses Notes: ", nursesNotes);
    
        if (date && !isNaN(lochialDischarges) && !isNaN(systolic) && !isNaN(diastolic) && !isNaN(feeding)) {
            setpostpartumCareData((prev) => [
                ...prev,
                {
                    date: currentDate,
                    lochialDischarges: lochialName,
                    bp: `${systolic} / ${diastolic}`,
                    feeding: feedingName,
                    findings: findings,
                    nursesNotes: nursesNotes,
                },
            ]);

            setValue("postpartumTable.date", today);
            setValue("postpartumInfo.lochialDischarges", "");
            setValue("postpartumTable.bp.systolic", "");
            setValue("postpartumTable.bp.diastolic", "");
            setValue("postpartumTable.feeding", "");
            setValue("postpartumTable.findings", "");
            setValue("postpartumTable.nursesNotes", "")
        } else {
            console.error("Please fill in all required fields.");
        }        
    }


    return (
        <LayoutWithBack
            title="Postpartum Form"
            description="Fill out the postpartum form with the mother's information."
        >
        <div className="bg-white flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto mt-2">
            <div className="pb-4">
                <h2 className="text-3xl font-bold text-center mt-12">POSTPARTUM RECORD</h2>
            </div>
            {/* forms */}
            <Form {...form}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                }}
                >
                    <div className="flex justify-between mt-10">
                        <FormInput control={form.control} label="Family No." name="mothersPersonalInfo.familyNo" placeholder="Family No." />
                        <FormField
                            control={form.control}
                            name="mothersPersonalInfo.isTransient"
                            render={({ field }) => (
                                <FormItem className="mt-8">
                                        <FormControl>
                                            <Checkbox {...field}></Checkbox>
                                        </FormControl>
                                        <FormLabel className="ml-1">Transient</FormLabel>
                                </FormItem>   
                            )}
                        />
                    </div>
                    <div className="mt-10 mb-3">
                        <Label className="text-lg ">Personal Information</Label>
                        <Separator className="mt-2"/>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                        <FormInput control={form.control} label="Last Name" name="mothersPersonalInfo.motherLName" placeholder="Last Name"/>
                        <FormInput control={form.control} label="First Name" name="mothersPersonalInfo.motherFName" placeholder="First Name"/>
                        <FormInput control={form.control} label="Middle Name" name="mothersPersonalInfo.motherMName" placeholder="Middle Name"/>
                        <FormInput control={form.control} label="Age" name="mothersPersonalInfo.motherAge" placeholder="Age"/>

                        <FormInput control={form.control} label="Husband's First Name" name="mothersPersonalInfo.husbandLName" placeholder="Husbands Last Name"/>
                        <FormInput control={form.control} label="Husband's First Name" name="mothersPersonalInfo.husbandFName" placeholder="Husbands First Name"/>
                        <FormInput control={form.control} label="Husband's First Name" name="mothersPersonalInfo.husbandMName" placeholder="Husbands Middle Name"/>
                    </div>

                    <div className="grid grid-cols-5 gap-4 mt-4">
                        <FormInput control={form.control} label="Street" name="mothersPersonalInfo.address.street" placeholder="Street"/>
                        <FormInput control={form.control} label="Sitio" name="mothersPersonalInfo.address.sitio" placeholder="Sitio"/>
                        <FormInput control={form.control} label="Barangay" name="mothersPersonalInfo.address.barangay" placeholder="Barangay"/>
                        <FormInput control={form.control} label="City" name="mothersPersonalInfo.address.city" placeholder="City"/>
                        <FormInput control={form.control} label="Province" name="mothersPersonalInfo.address.province" placeholder="Province"/>
                    </div>
                        
                    <div className="mt-10 mb-3">
                        <Label className="text-lg ">Delivery and Other Information</Label>
                        <Separator className="mt-2"/>
                    </div>
                  
                    <div className="grid grid-cols-3 gap-4">
                        <FormDateTimeInput control={form.control} label="Date of Delivery" name="postpartumInfo.dateOfDelivery" type="date" />
                        <FormDateTimeInput control={form.control} label="Time of Delivery" name="postpartumInfo.timeOfDelivery" type="time" />
                        <FormInput control={form.control} label="Place of Delivery" name="postpartumInfo.placeOfDelivery" placeholder="Place of Delivery"/>
                        <FormSelect
                            control={form.control} 
                            label="Outcome"
                            name="postpartumInfo.outcome"
                            options={[
                                { id: '0', name: 'Select' },
                                { id: '1', name: 'Fullterm' },
                                { id: '2', name: 'Preterm' },
                            ]}
                        />

                        <FormInput control={form.control} label="Attended By" name="postpartumInfo.attendedBy" placeholder="Attended By"/>
                        <FormInput control={form.control} label="Tetanus Toxoid Status" name="postpartumInfo.ttStatus" placeholder="Tetanus Toxoid Status"/>
                        <FormDateTimeInput control={form.control} label="Iron Supplement" name="postpartumInfo.ironSupplement" type="date" />
                        <FormDateTimeInput control={form.control} label="Vitamin A Supplement" name="postpartumInfo.vitASupplement" type="date" />

                        <FormInput control={form.control} label="Number of Pads per Day" name="postpartumInfo.noOfPadPerDay" placeholder="Number of Pads per Day"/>
                        <FormDateTimeInput control={form.control} label="Mebendazole" name="postpartumInfo.mebendazole" type="date" />
                        <FormDateTimeInput control={form.control} label="Date Breastfeeding Initiated" name="postpartumInfo.dateBfInitiated" type="date" />
                        <FormDateTimeInput control={form.control} label="Time Breastfeeding Initiated" name="postpartumInfo.timeBfInitiated" type="time" />
                    
                    </div>

                    {/* postpartum table fields */}
                    <Separator className="my-10" />
                    <div className="border rounded-md p-5">
                        <div className="flex">
                            <FormDateTimeInput control={form.control} type="date" name="postpartumTable.date" label="Date"/>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <Label>BP</Label>
                            <Label>Feeding</Label>
                            <Label>Lochial Discharges</Label>

                            <div className="grid grid-cols-2 gap-4 mt-[8px]">
                                <FormInput control={form.control} name="postpartumTable.bp.systolic" placeholder="Systolic" type="number" />
                                <FormInput control={form.control} name="postpartumTable.bp.diastolic" placeholder="Diastolic" type="number" />
                            </div>

                            <FormSelect 
                                control={form.control} 
                                name="postpartumTable.feeding" 
                                options={[
                                    { id: '0', name: 'Select' },
                                    { id: '1', name: 'Exclusive Breastfeeding' },
                                    { id: '2', name: 'Mixed Feeding' },
                                    { id: '3', name: 'Formula Feeding' }
                                ]}
                            />
                            <FormSelect 
                                control={form.control} 
                                label="" 
                                name="postpartumInfo.lochialDischarges" 
                                options={[
                                    { id: '0', name: 'Select' },
                                    { id: '1', name: 'Lochia Rubra' },
                                    { id: '2', name: 'Lochia Serosa' },
                                    { id: '3', name: 'Lochia Alba' }
                                ]}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <FormTextArea control={form.control} label="Findings" name="postpartumTable.findings" placeholder="Enter findings" />
                            <FormTextArea control={form.control} label="Nurses Notes" name="postpartumTable.nursesNotes" placeholder="Enter nurses notes" />
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button type="button" onClick={addPostpartumCare}>Add</Button>
                        </div>

                        <div className="mt-5">
                            <DataTable columns={postpartumTableColumns} data={postpartumCareData}/>
                        </div>
                    </div>

                    <div className="mt-8 sm:mt-auto flex justify-end">
                        <Button type="submit" className="mt-4 mr-4 sm-w-32" onClick={onSubmit}>
                            Submit
                        </Button>
                    </div>
                </form>
                
            </Form>
            
        </div> 
        </LayoutWithBack>
    )
}