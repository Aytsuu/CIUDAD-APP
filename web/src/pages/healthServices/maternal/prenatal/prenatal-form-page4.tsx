import { useFormContext, UseFormReturn } from "react-hook-form";
import { Form } from "react-router";
import { z } from 'zod';

import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema";
import { DataTable } from "@/components/ui/table/data-table";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";
import { ColumnDef } from "@tanstack/react-table";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { useEffect, useState } from "react";

export default function PrenatalFormFourthPg(
    {form, onSubmit, back}: {
        form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>,
        onSubmit: () => void,
        back: () => void,
    }
){
    const submit = () => {
        form.trigger("prenatalCare").then((isValid) => {
            if(isValid){
                onSubmit();
            }
        })
    }

    const { setValue, getValues }  = useFormContext();

    // date today
    const today = new Date().toLocaleDateString('en-CA');


    type prenatalCareTypes = {
        date: string;
        aog: {
            aogWeeks: number;
            aogDays: number;
        };
        wt: number;
        bp: {
            systolic: number;
            diastolic: number;
        };
        leopoldsFindings: {
            fundalHeight: string;
            fetalHeartRate: string;
            fetalPosition: string;
        };
        notes: {
            complaints: string;
            advises: string;
        }
    }

    const [ prenatalCareData, setPrenatalCareData ] = useState<prenatalCareTypes[]>([]);


    const prenatalCareColumn: ColumnDef<prenatalCareTypes>[] = [
        {
            accessorKey: "date",
            header: "Date",
            cell: ({row}) => {
                return (
                    <div className="text-center">{row.original.date}</div>
                )
            }
        },
        {
            accessorKey: "aog",
            header: "AOG",
            cell: ({row}) => {
                return (
                    <div className="text-center">{row.original.aog.aogWeeks} wk/s {row.original.aog.aogDays} day/s</div>
                )
            }
        },
        {
            accessorKey: "wt",
            header: "Weight",
            cell: ({row}) => {
                return (
                    <div className="text-center">{row.original.wt}</div>
                )
            }
        },
        {
            accessorKey: "bp",
            header: "Blood Pressure",
            cell: ({row}) => {
                return (
                    <div className="text-center">{row.original.bp.systolic}/{row.original.bp.diastolic}</div>
                )
            }
        },
        {
            accessorKey: "leopoldsFindings",
            header: "Leopold's Findings",
            cell: ({row}) => {
                return (
                    <div className="text-center">
                        FH: {row.original.leopoldsFindings.fundalHeight},<br /> 
                        FHB: {row.original.leopoldsFindings.fetalHeartRate},<br />
                        FP: {row.original.leopoldsFindings.fetalPosition}
                    </div>
                )
            }
        },
        {
            accessorKey: "notes",
            header: "Notes",
            cell: ({row}) => {
                return (
                    <div className="text-center">
                        Complaint/s: {row.original.notes.complaints} <br />
                        Advises: {row.original.notes.advises}
                    </div>
                )
            }
        }
    ]

    const currentDate = new Date().toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "2-digit"
    });

    const sampleData: prenatalCareTypes[] = [
        {
            date: currentDate,
            aog: {
                aogWeeks: 10,
                aogDays: 5
            },
            wt: 50,
            bp: {
                systolic: 120,
                diastolic: 80
            },
            leopoldsFindings: {
                fundalHeight: "20 cm",
                fetalHeartRate: "140 bpm",
                fetalPosition: "Cephalic"
            },
            notes: {
                complaints: "Nausea",
                advises: "Take rest"
            }
        }
    ]

    useEffect(() => {
        setValue("prenatalCare.date", today);
    },[setValue,today])

    const addPrenatalCare = () => {
        
        const date = getValues("prenatalCare.date");
        const weight = parseFloat(getValues("prenatalCare.wt")); 
        const aogWks = parseInt(getValues("prenatalCare.aog.aogWeeks"), 10); 
        const aogDays = parseInt(getValues("prenatalCare.aog.aogDays"), 10); 
        const systolic = parseInt(getValues("prenatalCare.bp.systolic"), 10); 
        const diastolic = parseInt(getValues("prenatalCare.bp.diastolic"), 10); 
        const fundalHt = getValues("prenatalCare.leopoldsFindings.fundalHeight");
        const fetalHR = getValues("prenatalCare.leopoldsFindings.fetalHeartRate");
        const fetalPos = getValues("prenatalCare.leopoldsFindings.fetalPosition");
        const complaints = getValues("prenatalCare.notes.complaints");
        const advises = getValues("prenatalCare.notes.advises");
    
        console.log("Date: ", date, "Wt: ", weight, "AOG Wks: ", aogWks, "AOG Days: ", aogDays, "BP: ", systolic, "/", diastolic, "Fundal Ht: ", fundalHt, "Fetal HR: ", fetalHR, "Fetal Position: ", fetalPos, "Complaints: ", complaints, "Advises: ", advises);
    
        if (date && !isNaN(weight) && !isNaN(aogWks) && !isNaN(aogDays) && !isNaN(systolic) && !isNaN(diastolic)) {
            setPrenatalCareData((prev) => [
                ...prev,
                {
                    date,
                    wt: weight,
                    aog: { aogWeeks: aogWks, aogDays: aogDays },
                    bp: { systolic, diastolic },
                    leopoldsFindings: { fundalHeight: fundalHt, fetalHeartRate: fetalHR, fetalPosition: fetalPos },
                    notes: { complaints, advises },
                },
            ]);
        } else {
            console.error("Please fill in all required fields.");
        }        
    }

    return(
        <>
            <div className="flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto">
                <Label className="text-black text-opacity-50 italic mb-10">Page 4</Label>
                <Form>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        submit();
                    }}
                    >
                        <div className="border rounded-md border-gray p-5">
                            <div className="flex mb-3">
                                <FormDateTimeInput
                                    control={form.control}
                                    name="prenatalCare.date"
                                    label="Date"
                                    type="date"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-3">
                                <Label>Weight</Label>
                                <Label>AOG</Label>
                                <Label>BP</Label>

                                <FormInput
                                    control={form.control}
                                    name="prenatalCare.wt"
                                    label=""
                                    placeholder="wt in kg"
                                    type="number"
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <FormInput
                                        control={form.control}
                                        name="prenatalCare.aog.aogWeeks"
                                        label=""
                                        placeholder="AOG in weeks"
                                        type="number"
                                    />
                                    <FormInput
                                        control={form.control}
                                        name="prenatalCare.aog.aogDays"
                                        label=""
                                        placeholder="AOG in days"
                                        type="number"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <FormInput
                                        control={form.control}
                                        name="prenatalCare.bp.systolic"
                                        label=""
                                        placeholder="systolic"
                                        type="number"
                                    />
                                    <FormInput
                                        control={form.control}
                                        name="prenatalCare.bp.diastolic"
                                        label=""
                                        placeholder="diastolic"
                                        type="number"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 mb-3">
                                <FormInput
                                    control={form.control}
                                    name="prenatalCare.leopoldsFindings.fundalHeight"
                                    label="Fundal Height"
                                    placeholder="FH in cm"
                                />
                                <FormInput
                                    control={form.control}
                                    name="prenatalCare.leopoldsFindings.fetalHeartRate"
                                    label="Fetal Heartbeat"
                                    placeholder="FHB bpm"
                                />
                                <FormSelect
                                    control={form.control}
                                    name="prenatalCare.leopoldsFindings.fetalPosition"
                                    label="Fetal Position"
                                    options={[
                                        {id: "0", name: "Cephalic"},
                                        {id: "1", name: "Occiput Posterior"},
                                        {id: "2", name: "Breech"},
                                        {id: "3", name: "Transvere Lie"},
                                        {id: "4", name: "Other"}
                                    ]}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <FormInput
                                    control={form.control}
                                    name="prenatalCare.notes.complaints"
                                    label="Complaints"
                                    placeholder="Enter complaints"
                                />
                                <FormInput
                                    control={form.control}
                                    name="prenatalCare.notes.advises"
                                    label="Advises"
                                    placeholder="Enter advises"
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={addPrenatalCare}>Add</Button>
                            </div>
                        </div>

                        <div className="mt-10">
                            <DataTable columns={prenatalCareColumn} data={prenatalCareData} />
                        </div>  
                        
                        <hr className="border-gray mb-6 mt-10 sm:mb-5" />

                        <div className="mt-8 sm:mt-auto flex justify-end">
                            <Button variant="outline" className="mt-4 mr-4 sm-w-32" onClick={back}>
                                Prev
                            </Button>
                            <Button type="submit" className="mt-4 mr-4 sm-w-32" onClick={onSubmit}>
                                Submit
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </>
    )
}