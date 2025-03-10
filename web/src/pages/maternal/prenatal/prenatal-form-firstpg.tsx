import { useFormContext } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/datepicker";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { DataTable } from "@/components/ui/table/data-table";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select";

export default function PrenatalFormFirstPg(){
    const { control, getValues, setValue } = useFormContext()

    type previousIllness= {
        prevIllness: string;
        prevIllnessYear: number;
    }

    type previousHospitalization= {
        prevHospitalization: string;
        prevHospitalizationYear: number;
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
            accessorKey: "prevIllnessYear",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Year <ArrowUpDown size={15} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex justify-start min-w-[200px] px-2">
                    <div className="w-full truncate">{row.original.prevIllnessYear}</div>
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
            accessorKey: "prevHospitalizationYear",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Year <ArrowUpDown size={15} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex justify-start min-w-[200px] px-2">
                    <div className="w-full truncate">{row.original.prevHospitalizationYear}</div>
                </div>
            )
        }
    ]

    // functionality to handle adding of previous illness
    const addPrevIllness = () => {
        const illness = getValues("prevIllness");
        const year = Number(getValues("prevIllnessYear"));

        console.log(illness, year);

        if(illness && year){
            setprevIllnessData((prev) => [...prev, {prevIllness: illness, prevIllnessYear: year}]);
            setValue("prevIllness", "");
            setValue("prevIllnessYear", "");
        }
    }

    // functionality to handle adding of previous hopsitalization
    const addPrevHospitalization = () => {
        const hospitalization = getValues("prevHospitalization");
        const year = Number(getValues("prevHospitalizationYear"));

        console.log(hospitalization, year);

        if(hospitalization && year){
            setprevHospitalizationData((prev) => [...prev, {prevHospitalization: hospitalization, prevHospitalizationYear: year}]);
            setValue("prevHospitalization", "");
            setValue("prevHospitalizationYear", "");
        }
    }
    
    
    return (
        <>
            <div className="flex justify-between">  
                <FormField
                    control={control}
                    name="familyNo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Family No</FormLabel>
                            <FormControl>
                                <Input {...field} name="family" placeholder="Enter Family No." />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="isTransient"
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
                    control={control}
                    name="motherLName"
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
                    control={control}
                    name="motherFName"
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
                    control={control}
                    name="motherMName"
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
                    control={control}
                    name="motherAge"
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
                    control={control}
                    name="motherDOB"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                                <DatePicker />
                                {/* <Input {...field} type="Date" /> */}
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField 
                    control={control}
                    name="husbandLName"
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
                    control={control}
                    name="husbandFName"
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
                    control={control}
                    name="husbandMName"
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
                    control={control}
                    name="occupation"
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
                    control={control}
                    name="address.street"
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
                    control={control}
                    name="address.barangay"
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
                    control={control}
                    name="address.city"
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
                    control={control}
                    name="address.province"
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
                    control={control}
                    name="mothersWt"
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
                    control={control}
                    name="mothersHt"
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
                    control={control}
                    name="mothersBMI"
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
                        control={control}
                        name="noOfChBornAlive"
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
                        control={control}
                        name="noOfLivingCh"
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
                        control={control}
                        name="noOfAbortion"
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
                        control={control}
                        name="noOfStillBirths"
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
                        control={control}
                        name="historyOfLBabies"
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
                        control={control}
                        name="historyOfDiabetes"
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
                                    control={control}
                                    name="prevIllness"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter Previous Illness" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex-1">
                                <FormField
                                    control={control}
                                    name="prevIllnessYear"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter Year" />
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
                                    control={control}
                                    name="prevHospitalization"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter Previous Hospitalization" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex-1">
                                <FormField
                                    control={control}
                                    name="prevHospitalizationYear"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter Year" />
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
        </>
    )
}