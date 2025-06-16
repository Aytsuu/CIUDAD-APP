import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form"
import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";

import { z } from "zod";

// components import
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { Combobox } from "@/components/ui/combobox";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

// icons import
import { Trash } from "lucide-react";
import { MdOutlineSick } from "react-icons/md";
import { FaRegHospital } from "react-icons/fa";


// schema import
import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
// import { toast } from "sonner";
import { usePatients } from "../queries/maternalFetchQueries";
// import { set } from "date-fns";


interface PatientRecord{
    pat_id: any
    pat_type: string
    pat_status:string
    // patrec_id: number
    // spouse_id: number

    personal_info: {
        per_fname: string
        per_lname: string
        per_mname: string
        per_dob: string
    };

    address: {
        add_street: string
        add_barangay: string
        add_city: string
        add_province: string
        sitio?: string
    } | null;

    spouse?: {
        spouse_id: number
        spouse_lname: string
        spouse_fname: string
        spouse_mname: string
        spouse_dob: string
        spouse_occupation: string
    };
    
}

// age calculation for dob
const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

interface PrenatalFirstFormProps {
    onSubmit: () => void;
}

export default function PrenatalFormFirstPg({onSubmit}: PrenatalFirstFormProps){
    const { control, trigger, setValue, getValues, watch, formState: { errors } } = useFormContext<z.infer<typeof PrenatalFormSchema>>(); // useFormContext to access the form methods

    const submit = () => {
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth',
        });

        trigger(["motherPersonalInfo", "obstreticHistory", "medicalHistory"]).then((isValid) => {
            if(isValid) {
                console.log("Form is valid: ", isValid)
                onSubmit(); // proceed to next page
            }
        })
    }

    // patient data fetching
    const [selectedPatientId, setSelectedPatientId] = useState<string>("")
    const { data: patientData, isLoading: patientLoading } = usePatients();

    const patients = {
        default: patientData || [],
        formatted: 
            patientData?.map((patient: any) => ({
                id: patient.pat_id.toString(),
                name: `${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""}`.trim()
            })) || []
    };

    const handlePatientSelection = (id: string) => {
        setSelectedPatientId(id)
        const selectedPatient: PatientRecord | undefined = patients.default.find((p: PatientRecord) => p.pat_id.toString() === id)

        if (selectedPatient && selectedPatient.personal_info) {
          console.log("Selected Patient:", selectedPatient)
          setSelectedPatientId(selectedPatient.pat_id.toString());

          const personalInfo = selectedPatient.personal_info;
          const address = selectedPatient.address
          const spouse = selectedPatient.spouse;

            setValue("motherPersonalInfo.familyNo", selectedPatient.pat_id)
            setValue("motherPersonalInfo.motherLName", personalInfo?.per_lname) 
            setValue("motherPersonalInfo.motherFName", personalInfo?.per_fname)
            setValue("motherPersonalInfo.motherMName", personalInfo?.per_mname)
            setValue("motherPersonalInfo.motherAge", calculateAge(personalInfo?.per_dob))
            setValue("motherPersonalInfo.motherDOB", personalInfo?.per_dob)

            if(address){
                setValue("motherPersonalInfo.address.street", address.add_street)
                setValue("motherPersonalInfo.address.sitio", address.sitio || "")
                setValue("motherPersonalInfo.address.barangay", address.add_barangay)
                setValue("motherPersonalInfo.address.city", address.add_city)
                setValue("motherPersonalInfo.address.province", address.add_province)
            }

            if(spouse){
                setValue("motherPersonalInfo.husbandLName", spouse.spouse_lname || "")
                setValue("motherPersonalInfo.husbandFName", spouse.spouse_fname || "")
                setValue("motherPersonalInfo.husbandMName", spouse.spouse_mname || "")
                setValue("motherPersonalInfo.husbandDob", spouse.spouse_dob || "")
                setValue("motherPersonalInfo.occupation", spouse.spouse_occupation || "")
            }
        }
    }


    // previous illness and previous hospitalization data 
    type previousIllness= {
        prevIllness: string;
        prevIllnessYr?: number; 
    }

    type previousHospitalization= {
        prevHospitalization: string;
        prevHospitalizationYr?: number ;
    }

    const [prevIllnessData, setPrevIllnessData] = useState<previousIllness[]>([])
    const [prevHospitalizationData, setPrevHospitalizationData] = useState<previousHospitalization[]>([])

    // open row id
    const [openRowId, setOpenRowId] = useState<string | null>(null);


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
            accessorKey: "prevIllnessYr",
            header: "Year",
            cell: ({ row }) => (
                <div className="flex justify-start min-w-[200px] px-2">
                    <div className="w-full truncate">{row.original.prevIllnessYr}</div>
                </div>
            )
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => {
                const isDialogOpen = openRowId === row.original.prevIllness; // Check if this row's dialog is open
    
                return (
                    <div className="flex justify-center">
                        <TooltipLayout
                            content="Delete"
                            trigger={
                                <DialogLayout
                                    isOpen={isDialogOpen} 
                                    onOpenChange={(open) => setOpenRowId(open ? row.original.prevIllness : null)} 
                                    trigger={
                                        <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                                            <Trash className="w-4 h-4" />
                                        </div>
                                    }
                                    className=""
                                    title="Delete Record"
                                    description={`Are you sure you want to delete "${row.original.prevIllness}" record?`}
                                    mainContent={
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                onClick={() => setOpenRowId(null)} // Close dialog
                                                variant={"outline"}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant={"destructive"}
                                                onClick={() => {
                                                    const newData = prevIllnessData.filter((item) => 
                                                        item.prevIllness !== row.original.prevIllness || item.prevIllnessYr !== row.original.prevIllnessYr
                                                    );
                                                    setPrevIllnessData(newData); // Update data
                                                    setOpenRowId(null); // Close dialog
                                                }}
                                            >
                                                Confirm
                                            </Button>
                                        </div>
                                    }
                                />
                            }
                        />
                    </div>
                );
            }
        }
    ];

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
                    <div className="w-full truncate">{row.original.prevHospitalizationYr}</div>
                </div>
            )
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => {
                const isDialogOpen = openRowId === row.original.prevHospitalization; 

                return (
                        <div className="flex justify-center gap-2">
                        <TooltipLayout
                            trigger={
                                <DialogLayout
                                    isOpen={isDialogOpen}
                                    onOpenChange={(open) => setOpenRowId(open ? row.original.prevHospitalization : null)}
                                    trigger={
                                        <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                                        {" "}
                                        <Trash size={16} />
                                        </div>
                                    }
                                    className=""
                                    title="Delete Record"
                                    description={`Are you sure you want to delete "${row.original.prevHospitalization}" record?`}
                                    mainContent={
                                        <div className="flex gap-2 justify-end">
                                            <Button variant={"outline"}>Cancel</Button>
                                            <Button 
                                                variant={"destructive"}
                                                onClick={()  => {
                                                    const newData = prevHospitalizationData.filter((item) => 
                                                        item.prevHospitalization !== row.original.prevHospitalization || item.prevHospitalizationYr !== row.original.prevHospitalizationYr
                                                    );
                                                    setPrevHospitalizationData(newData);
                                                }}
                                            >
                                                Confirm    
                                            </Button>
                                        </div>
                                    }
                                />
                            }
                            content="Delete"
                        />
                    </div>
                );
            }   
        }
    ]

    // functionality to handle adding of previous illness
    const addPrevIllness = () => {
        const illness = getValues("medicalHistory.prevIllness");
        const illnessYr = getValues("medicalHistory.prevIllnessYr");

        console.log("Previous Illness: ", illness, "Year: ", illnessYr);

        if(illness){
            setPrevIllnessData((prev) => [...prev, {prevIllness: illness}]);
            setValue("medicalHistory.prevIllness", "");
            setValue("medicalHistory.prevIllnessYr", undefined);
        }
    }

    // functionality to handle adding of previous hopsitalization
    const addPrevHospitalization = () => {
        const hospitalization = getValues("medicalHistory.prevHospitalization");
        const hospitalizationYr = getValues("medicalHistory.prevHospitalizationYr");

        console.log("Previous Hospitalization:", hospitalization, "Year: ", hospitalizationYr);

        if(hospitalization){
            setPrevHospitalizationData((prev) => [...prev, {prevHospitalization: hospitalization, prevHospitalizationYr: hospitalizationYr}]);
            setValue("medicalHistory.prevHospitalization", "");
            setValue("medicalHistory.prevHospitalizationYr", undefined);
        }   
    }

    // BMI calculation
    const weight = watch("motherPersonalInfo.motherWt");
    const height = watch("motherPersonalInfo.motherHt");

    useEffect(() => {
        if(weight && height && height > 0){
            const bmi = (weight / ((height / 100) ** 2)).toFixed(2);
            setValue("motherPersonalInfo.motherBMI", parseFloat(bmi));
        } else {
            setValue("motherPersonalInfo.motherBMI", 0);
        }
    }, [weight, height, setValue]);


    // calculate BMI category based on the BMI value
    const bmi = watch("motherPersonalInfo.motherBMI");
    useEffect(() => {
        let bmiCategory = "";

        if (bmi < 18.5) {
            bmiCategory = "Underweight";
        } else if (bmi >= 18.5 && bmi < 24.9) {
            bmiCategory = "Normal weight";
        } else if (bmi >= 25 && bmi < 29.9) {
            bmiCategory = "Overweight";
        } else if (bmi >= 30) {
            bmiCategory = "Obesity";
        }

        setValue("motherPersonalInfo.motherBMICategory", bmiCategory);
    }, [bmi, setValue]);
    
    
    return (
        <>
            <LayoutWithBack
                title="Prenatal Record"
                description="Fill out the prenatal record with the mother's personal information."
            >
                <div> 
                    <Combobox
                        options={patients.formatted}
                        value={selectedPatientId}
                        onChange={handlePatientSelection}
                        placeholder={patientLoading ? "Loading patients..." : "Select a patient"}
                        triggerClassName="font-normal w-[30rem]"
                        emptyMessage={
                            <div className="flex gap-2 justify-center items-center">
                                <Label className="font-normal text-[13px]">
                                    {patientLoading ? "Loading..." : "No patient found."}
                                </Label>
                                <Link to="/patient-records/new">
                                    <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
                                    Register New Patient
                                    </Label>
                                </Link>
                            </div>
                        }
                    />
                </div>

                <div className="bg-white flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto mt-2">
                    <Label className="text-black text-opacity-50 italic mb-10">Page 1</Label>
                    <div className="pb-4">
                        <h2 className="text-3xl font-bold text-center">MATERNAL HEALTH RECORD</h2>
                    </div>
                    {/* <Form control={control}> */}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        submit();
                    }}
                    >

                        <div className="flex justify-between">  
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.familyNo"
                                label="Family No."
                                placeholder="Enter Family No."
                            />
                            <FormField
                                control={control}
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
                        <div className="grid grid-cols-5 gap-4 mt-4">
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.motherLName"
                                label="Last Name"
                                placeholder="Enter Last Name"
                            />
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.motherFName"
                                label="First Name"
                                placeholder="Enter First Name"
                            />
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.motherMName"
                                label="Middle Name"
                                placeholder="Enter Middle Name"
                            />
                            <FormDateTimeInput
                                control={control}
                                name="motherPersonalInfo.motherDOB"
                                label="Date of Birth"
                                type="date"
                            />
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.motherAge"
                                label="Age"
                                placeholder="Enter Age"
                                type="number"
                            />
                        </div>

                        {/* dob, husband's name, occupation */}
                        <div className="grid grid-cols-5 gap-4 mt-4">
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.husbandLName"
                                label="Husband's Last Name"
                                placeholder="Enter Last Name"
                            />
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.husbandFName"
                                label="Husband's First Name"
                                placeholder="Enter First Name"
                            />
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.husbandMName"
                                label="Husband's Middle Name"
                                placeholder="Enter Middle Name"
                            />
                            <FormDateTimeInput
                                control={control}
                                name="motherPersonalInfo.husbandDob"
                                label="Husband's Date of Birth"
                                type="date"
                            />
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.occupation"
                                label="Occupation"
                                placeholder="Enter Occupation"
                            />
                        </div>

                        {/* address */}
                        <div className="grid grid-cols-5 gap-4 mt-4">
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.address.street"
                                label="Street"
                                placeholder="Enter Street"
                            />
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.address.sitio"
                                label="Sitio"
                                placeholder="Enter Sitio"
                            />
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.address.barangay"
                                label="Barangay"
                                placeholder="Enter Barangay"
                            />
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.address.city"
                                label="City"
                                placeholder="Enter City"
                            />
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.address.province"
                                label="Province"
                                placeholder="Enter Province"
                            />
                            
                        </div>
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.motherWt"
                                label="Weight"
                                placeholder="Wt in kg"
                                type="number"
                            />
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.motherHt"
                                label="Height"
                                placeholder="Ht in cm"
                                type="number"
                            />
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.motherBMI"
                                label="BMI"
                                placeholder="BMI"
                                type="number"
                            />
                            <FormInput
                                control={control}
                                name="motherPersonalInfo.motherBMICategory"
                                label="BMI Category"
                                placeholder="BMI Category"
                            />
                        </div>
                        <Separator className="mt-8 mb-6" />
                        {/* obstetric history */}
                        <h3 className="text-md font-bold">OBSTETRIC HISTORY</h3>
                        <div className="flex flex-col mt-2">
                            <div className="grid grid-cols-4 gap-4 mb-2">
                                <FormInput control={control} name="obstreticHistory.noOfChBornAlive" label="No. of Children Born Alive" placeholder="Enter No." type="number"/>
                                <FormInput control={control} name="obstreticHistory.noOfLivingCh" label="No. of Living Children" placeholder="Enter No." type="number"/>
                                <FormInput control={control} name="obstreticHistory.noOfAbortion" label="No. of Abortion" placeholder="Enter No." type="number"/>
                                <FormInput control={control} name="obstreticHistory.noOfStillBirths" label="No. of Still Births" placeholder="Enter No." type="number"/>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <FormInput control={control} name="obstreticHistory.historyOfLBabies" label="History of Large Babies" placeholder="Enter No." type="number"/>
                                <FormInput control={control} name="obstreticHistory.historyOfDiabetes" label="History of Diabetes" placeholder="Enter History of Diabetes"/>
                            </div>
                        </div>

                        <Separator className="mt-8 mb-6" />
                        {/* medical history */}
                        <h3 className="text-md font-bold">MEDICAL HISTORY</h3>
                        <div className="p-4 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 border rounded-md p-4 items-center">
                                    <div className="flex flex-row items-center gap-2">
                                        <MdOutlineSick size={25} />
                                        <Label>Previous Illness</Label>

                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="flex-1">
                                            <FormInput
                                                control={control}
                                                name="medicalHistory.prevIllness"
                                                label=""
                                                placeholder="Enter Previous Illness"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <FormInput
                                                control={control}
                                                name="medicalHistory.prevIllnessYr"
                                                label=""
                                                placeholder="Enter year"
                                                type="number"
                                            />
                                        </div>
                                        <Button onClick={addPrevIllness} type="button" variant="default">Add</Button>
                                    </div>
                                    <div className="flex bg-white w-full overflow-x-auto mt-4">
                                        <DataTable columns={illnessColumn} data={prevIllnessData} />
                                    </div>
                                </div>
                                
                                <div className="space-y-4 border rounded-md p-4 items">
                                    <div className="flex flex-row items-center gap-2">
                                        <FaRegHospital size={25} />
                                        <Label>Previous Hospitalization</Label>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="flex-1">
                                            <FormInput
                                                control={control}
                                                name="medicalHistory.prevHospitalization"
                                                label=""
                                                placeholder="Enter previous hospitalization"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <FormInput
                                                control={control}
                                                name="medicalHistory.prevHospitalizationYr"
                                                label=""
                                                placeholder="Enter year"
                                                type="number"
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
                    {/* </Form> */}
                </div> 
            </LayoutWithBack>
        </>
    )
}