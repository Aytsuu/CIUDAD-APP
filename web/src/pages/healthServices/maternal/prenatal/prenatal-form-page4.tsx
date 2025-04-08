import { UseFormReturn } from "react-hook-form";
import { Form } from "react-router";
import { z } from 'zod';

import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema";
import { DataTable } from "@/components/ui/table/data-table";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form/form";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { ColumnDef } from "@tanstack/react-table";


export default function PrenatalFormFourthPq(
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
                                <FormField
                                    control={form.control}
                                    name="prenatalCare.date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-3 ">
                                <Label>Weight</Label>
                                <Label>AOG</Label>
                                <Label>BP</Label>

                                <div>
                                    <FormField
                                        control={form.control}
                                        name="prenatalCare.wt"
                                        render={({ field }) => (
                                            <FormItem>
                                                {/* <FormLabel>Weight</FormLabel> */}
                                                <FormControl>
                                                    <Input {...field} placeholder="wt in kg"/>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="prenatalCare.aog.aogWeeks"
                                        render={({ field }) => (
                                            <FormItem>
                                                {/* <FormLabel>AOG</FormLabel> */}
                                                <FormControl>
                                                    <Input {...field} placeholder="AOG in weeks"/>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="prenatalCare.aog.aogDays"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input {...field} placeholder="AOG in days"/>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="prenatalCare.bp.systolic"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input {...field} placeholder="systolic"/>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="prenatalCare.bp.diastolic"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input {...field} placeholder="diastolic"/>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 mb-3">
                                <FormField
                                    control={form.control}
                                    name="prenatalCare.leopoldsFindings.fundalHeight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fundal Height</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="FH in cm"/>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="prenatalCare.leopoldsFindings.fetalHeartRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fetal Heartbeat</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="FHB bpm"/>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="prenatalCare.leopoldsFindings.fetalPosition"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fetal Position</FormLabel>
                                            <FormControl>
                                                <SelectLayout 
                                                    label="Fetal Position"
                                                    placeholder='Select'
                                                    className="w-full"
                                                    options={[
                                                        {id: "0", name: "Cephalic"},
                                                        {id: "1", name: "Occiput Posterior"},
                                                        {id: "2", name: "Breech"},
                                                        {id: "3", name: "Transvere Lie"},
                                                        {id: "4", name: "Other"}
                                                    ]}
                                                    value={field.value ?? ''}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <FormField
                                    control={form.control}
                                    name="prenatalCare.notes.complaints"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Complaints</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="prenatalCare.notes.advises"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Advises</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* add button to table */}
                            <div className="flex justify-end">
                                <Button>Add</Button>
                            </div>
                        </div>

                        {/* prenatal table */} 
                        <div className="mt-10">
                            <DataTable columns={prenatalCareColumn} data={sampleData}/>
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