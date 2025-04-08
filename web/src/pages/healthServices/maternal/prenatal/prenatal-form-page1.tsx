import { useState } from "react";
import { useFormContext, UseFormReturn } from "react-hook-form"
import { ColumnDef } from "@tanstack/react-table";

import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { Trash } from "lucide-react";

// schema import
import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";


export default function PrenatalFormFirstPg(
    {form, onSubmit}: {
        form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>,
        onSubmit: () => void,
    }
){

    const submit = () => {
        form.trigger(["motherPersonalInfo", "obstreticHistory", "medicalHistory"]).then((isValid) => {
            if(isValid) {
                onSubmit(); // proceed to next page
            }
        })
    }
    const { getValues, setValue } = useFormContext()

    type previousIllness= {
        prevIllness: string;
    }

    type previousHospitalization= {
        prevHospitalization: string;
        prevHospitalizationYr: string;
    }

    const [prevIllnessData, setprevIllnessData] = useState<previousIllness[]>([])
    const [prevHospitalizationData, setprevHospitalizationData] = useState<previousHospitalization[]>([])

    const illnessColumn: ColumnDef<previousIllness>[] = [
        {
            accessorKey: "prevIllness",
            header: "Previous Illness",
            cell: ({ row }) => (
                <div className="flex justify-start min-w-[200px] px-2">
                    <div className="w-full truncate">{row.original.prevIllness}</div>
                </div>
            )
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: ({}) => (
                <div className="flex justify-center">
                    <TooltipLayout
                        trigger={
                            <DialogLayout
                            trigger={
                                <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                                {" "}
                                <Trash size={16} />
                                </div>
                            }
                            className=""
                            title="Delete Record"
                            description="Are you sure you want to delete this record?"
                            mainContent={<></>}
                            />
                        }
                        content="Delete"
                    />
                </div>
            )
        }
    ]

    const hospitalizationColumn: ColumnDef<previousHospitalization>[] = [
        {
            accessorKey: "prevHospitalization",
            header: "Previous Hospitalization",
            cell: ({ row }) => (
                <div className="flex justify-start min-w-[200px] px-2">
                    <div className="w-full truncate">{row.original.prevHospitalization}</div>
                </div>
            )
        },
        {
            accessorKey: "prevHospitalizationYr",
            header: "Year",
            cell: ({ row }) => (
                <div className="flex justify-start min-w-[200px] px-2">
                    <div className="w-full truncate">{row.original.prevHospitalization}</div>
                </div>
            )
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: ({}) => (
                <div className="flex justify-center gap-2">
                    <TooltipLayout
                        trigger={
                            <DialogLayout
                            trigger={
                                <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                                {" "}
                                <Trash size={16} />
                                </div>
                            }
                            className=""
                            title="Delete Record"
                            description="Are you sure you want to delete this record?"
                            mainContent={<></>}
                            />
                        }
                        content="Delete"
                    />
                </div>
            )
        }
    ]

    // functionality to handle adding of previous illness
    const addPrevIllness = () => {
        const illness = getValues("medicalHistory.prevIllness");

        console.log(illness);

        if(illness){
            setprevIllnessData((prev) => [...prev, {prevIllness: illness}]);
            setValue("medicalHistory.prevIllness", "");
        }
    }

    // functionality to handle adding of previous hopsitalization
    const addPrevHospitalization = () => {
        const hospitalization = getValues("medicalHistory.prevHospitalization");
        const hospitalizationYr = getValues("medicalHistory.prevHospitalizationYr");

        console.log(hospitalization);

        if(hospitalization){
            setprevHospitalizationData((prev) => [...prev, {prevHospitalization: hospitalization, prevHospitalizationYr: hospitalizationYr}]);
            setValue("medicalHistory.prevHospitalization", "");
        }   
    }
    
    
    return (
        <>
            <div className="flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto">
                <Label className="text-black text-opacity-50 italic mb-10">Page 1</Label>
                <div className="pb-4">
                    <h2 className="text-3xl font-bold text-center">MATERNAL HEALTH RECORD</h2>
                </div>
                <Form {...form}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        submit();
                    }}
                    >

                        <div className="flex justify-between">  
                            <FormField
                                control={form.control}
                                name="motherPersonalInfo.familyNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Family No.</FormLabel>
                                        <FormControl>
                                            <Input {...field} name="family" placeholder="Enter Family No." />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="motherPersonalInfo.isTransient"
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
                        <div className="grid grid-cols-4 gap-4 mt-2">
                            <FormField
                                control={form.control}
                                name="motherPersonalInfo.motherLName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter Last Name" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="motherPersonalInfo.motherFName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter First Name" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="motherPersonalInfo.motherMName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Middle Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter Middle Name" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="motherPersonalInfo.motherAge"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter Age" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* dob, husband's name, occupation */}
                        <div className="grid grid-cols-4 gap-4 mt-2">
                            <FormField 
                                control={form.control}
                                name="motherPersonalInfo.motherDOB"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Birth</FormLabel>
                                        <FormControl>
                                            {/* <DatePicker /> */}
                                            <Input {...field} type="Date" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="motherPersonalInfo.husbandLName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Husband's Last Name</FormLabel>
                                        <FormControl>
                                            <Input {...field}placeholder="Enter Last Name" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="motherPersonalInfo.husbandFName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Husband's First Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter First Name" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="motherPersonalInfo.husbandMName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Husband's Middle Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter Middle Name" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="motherPersonalInfo.occupation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Occupation</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter Occupation" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* address */}
                        <div className="grid grid-cols-4 gap-4 mt-2">
                            <FormField 
                                control={form.control}
                                name="motherPersonalInfo.address.street"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Street</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter Street" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="motherPersonalInfo.address.barangay"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Barangay</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter Barangay" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="motherPersonalInfo.address.city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter City" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="motherPersonalInfo.address.province"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Province</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter Province" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="motherPersonalInfo.motherWt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weight</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Wt in kg" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="motherPersonalInfo.motherHt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Height</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ht in cm" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="motherPersonalInfo.motherBMI"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>BMI</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="BMI" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Separator className="mt-8 mb-6" />
                        {/* obstetric history */}
                        <h3 className="text-md font-bold">OBSTRETIC HISTORY</h3>
                        <div className="flex flex-col mt-2">
                            <div className="grid grid-cols-4 gap-4">
                                <FormField
                                    control={form.control}
                                    name="obstreticHistory.noOfChBornAlive"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>No. of Children Born Alive</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter No. " />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="obstreticHistory.noOfLivingCh"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>No. of Living Children</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter No." />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="obstreticHistory.noOfAbortion"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>No. of Abortion</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter No." />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="obstreticHistory.noOfStillBirths"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>No. of Still Births</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter No." />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                            
                                <FormField
                                    control={form.control}
                                    name="obstreticHistory.historyOfLBabies"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>History of Large Babies</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter No." />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="obstreticHistory.historyOfDiabetes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>History of Diabetes</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter History of Diabetes" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator className="mt-8 mb-6" />
                        {/* medical history */}
                        <h3 className="text-md font-bold">MEDICAL HISTORY</h3>
                        <div className="p-4 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 border rounded-md p-4">
                                    <Label>Previous Illness</Label>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <FormField
                                                control={form.control}
                                                name="medicalHistory.prevIllness"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Enter Previous Illness" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <Button onClick={addPrevIllness} type="button" variant="default">Add</Button>
                                    </div>
                                    <div className="flex bg-white w-full overflow-x-auto mt-4">
                                        <DataTable columns={illnessColumn} data={prevIllnessData} />
                                    </div>
                                </div>
                                
                                <div className="space-y-4 border rounded-md p-4">
                                    <Label>Previous Hospitalization</Label>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <FormField
                                                control={form.control}
                                                name="medicalHistory.prevHospitalization"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Enter revious hospitalization" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            
                                        </div>
                                        <div className="flex-1">
                                            <FormField
                                                control={form.control}
                                                name="medicalHistory.prevHospitalizationYr"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Enter year" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        
                                        <Button onClick={addPrevHospitalization} type="button" variant="default">Add</Button>
                                    </div>
                                    <div className="flex bg-white w-full overflow-x-auto mt-4">
                                        <DataTable columns={hospitalizationColumn} data={prevHospitalizationData} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 sm:mt-auto flex justify-end">
                            <Button type="submit" className="mt-4 mr-4 sm-w-32" onClick={onSubmit}>
                                Next
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </>
    )
}