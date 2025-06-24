import { UseFormReturn } from "react-hook-form"
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form/form";
import { z } from "zod"
import { IoDocumentTextOutline } from "react-icons/io5";

import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"

import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import LaboratoryResults, { createInitialLabResults, getLabResultsSummary, type LabResults } from "@/pages/healthServices/maternal/maternal-components/lab-result";


export default function PrenatalFormSecPg({form, onSubmit, back}: {
        form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>,
        onSubmit: () => void,
        back: () => void,
    }
){
    const submit = () => {
        const labSummary = getLabResultsSummary(labResults);
        console.log("Laboratory Results Summary: ", labSummary);

        form.trigger(["previousPregnancy","prenatalVaccineInfo", "presentPregnancy", "labResults"]).then((isValid) => {
            if(isValid){
                console.log("Form is valid: ", isValid);
                console.log("Lab Results: ", labSummary);
                onSubmit();
            }
        })
        window.scrollTo(0, 0);
    }

    //tt type
    type TetanusToxoidType = {
        ttOrtd: string;
        ttStatus: string;
        ttDateGiven: string;
    }

    // tetanus toxoid history
    const [ttRecords, setTTRecords] = useState<TetanusToxoidType[]>([]);
    const addTTRecord = () => {
        const ttstatus = form.getValues("prenatalVaccineInfo.ttStatus")

        const newTTData: TetanusToxoidType = {
            ttOrtd: form.getValues("prenatalVaccineInfo.ttOrtd"),
            ttStatus: `TT${ttstatus}`,
            ttDateGiven: form.getValues("prenatalVaccineInfo.ttDateGiven")
        }

        setTTRecords(prev => {
            const upd = [...prev, newTTData]
            console.log("Updated TT Records:", upd);
            return upd;
        });

        form.setValue("prenatalVaccineInfo.ttStatus", "");
        form.setValue("prenatalVaccineInfo.ttDateGiven", "");
    }

    // lab result - only need the main state, component handles its own media files
    const [ labResults, setLabResults ] = useState<LabResults>(createInitialLabResults());

     
    return(
        <div className="bg-white flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto">
            <Label className="text-black text-opacity-50 italic mb-10">Page 2</Label>
            <Form {...form}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                }}
                >
                    <h3 className="text-md font-bold">PREVIOUS PREGNANCY</h3>
                    <div className="grid grid-cols-4 gap-4 mt-2">
                        <FormDateTimeInput
                            control={form.control}
                            name="previousPregnancy.dateOfDelivery"
                            label="DATE OF DELIVERY"
                            type="date"
                        />
                        <FormSelect
                            control={form.control}
                            name="previousPregnancy.outcome"
                            label="OUTCOME"
                            options={[
                                {id: "0", name: "FULLTERM"},
                                {id: "1", name: "PRETERM"}
                            ]}
                        />
                        <FormSelect
                            control={form.control}
                            name="previousPregnancy.typeOfDelivery"
                            label="TYPE OF DELIVERY"
                            options={[
                                {id: "0", name: "Vaginal Delivery"},
                                {id: "1", name: "C-Section"}
                            ]}
                        />
                        <FormInput
                            control={form.control}
                            name="previousPregnancy.babysWt"
                            label="BABY'S WT"
                            placeholder="Baby's wt in lbs"
                        />
                        <FormSelect
                            control={form.control}
                            name="previousPregnancy.gender"
                            label="GENDER"
                            options={[
                                {id: "0", name: "Female"},
                                {id: "1", name: "Male"}
                            ]}
                        />
                        <FormInput
                            control={form.control}
                            name="previousPregnancy.ballardScore"
                            label="BALLARD SCORE"
                            placeholder=""
                        />
                        <FormInput
                            control={form.control}
                            name="previousPregnancy.apgarScore"
                            label="APGAR SCORE"
                            placeholder=""
                        />
                    </div>
                    
                    {/* tetanus toxoid status */}
                    <Separator className="mt-10 mb-10"/>
                    <h3 className="text-md font-bold"> TETANUS TOXOID GIVEN: (DATE GIVEN)</h3>
                    <div className="grid gap-3">
                        <div className="flex flex-col">
                            <div className="flex flex-row mt-1 mb-2">
                                <FormField
                                    control={form.control}
                                    name="prenatalVaccineInfo.ttOrtd"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vaccine Type</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                    }}
                                                    defaultValue={field.value ?? ''}
                                                    className="flex flex-row" 
                                                >
                                                    <FormItem className="flex items-center space-x-1 space-y-0 mr-2"> 
                                                        <FormControl>
                                                            <RadioGroupItem value="TT"/>
                                                        </FormControl>
                                                        <FormLabel>Tetanus Toxoid (TT)</FormLabel>
                                                    </FormItem>

                                                    <FormItem className="flex items-center space-x-1 space-y-0"> 
                                                        <FormControl>
                                                            <RadioGroupItem value="TD"/>
                                                        </FormControl>
                                                        <FormLabel>Tetanus, Diptheria (TD)</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="prenatalVaccineInfo.isAdministered"
                                    render={({ field }) => (
                                        <FormItem className="ml-10 mt-[1.8rem]">
                                            <FormControl>
                                                <Checkbox {...field} className="mr-1"></Checkbox>
                                            </FormControl>
                                            <FormLabel className="ml-1">Administered by Midwife</FormLabel>
                                        </FormItem>   
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <FormSelect
                                    control={form.control}
                                    name="prenatalVaccineInfo.ttStatus"
                                    label="TT Status"
                                    options={[
                                        {id: "0", name: "TT1"},
                                        {id: "1", name: "TT2"},
                                        {id: "2", name: "TT3"},
                                        {id: "3", name: "TT4"},
                                        {id: "4", name: "TT5"},
                                    ]}
                                />
                                <FormDateTimeInput
                                    control={form.control}
                                    name="prenatalVaccineInfo.ttDateGiven"
                                    label="Date Given"
                                    type="date"
                                />
                            </div>
                            <div className="mt-4">
                                <FormField
                                    control={form.control}
                                    name="prenatalVaccineInfo.tdapDateGiven"
                                    render={({ field }) => (
                                        <FormItem className="flex">
                                            <FormControl>
                                                <Checkbox {...field} className="mr-2 mt-2"/>
                                            </FormControl>
                                            <FormLabel>TDAP (Tetanus, Diptheria, and Petussis)</FormLabel>
                                            <Label className="text-black text-opacity-50 italic ml-2">Administer in 7 months or 1 month before giving birth</Label>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            
                            <Separator className="mt-8 mb-3"/>

                            <div className="flex justify-end mt-2 mb-5">
                                <Button type="button"  onClick={addTTRecord}>
                                    Add
                                </Button>
                            </div>
                        </div>
                        
                        <div className="border rounded-lg p-5">
                            <div>
                                <h3 className="text-sm font-bold pl-3 pb-3"> TT STATUS HISTORY</h3>
                            </div>
                            <div className="flex flex-col pl-3 pr-3 ">
                                <div className="grid grid-cols-6 gap-2">
                                    {/* TT1 */}
                                    <div className="border h-[80px] rounded-md text-center" id="tt1-div">
                                        <h3 className="font-bold">TT1</h3>
                                        <p className="text-[10px]">(FIRST VISIT)</p>
                                        {ttRecords
                                            .filter(record => record.ttStatus === "TT0")
                                            .map((record, idx) => (
                                                <div key={`tt1-${idx}`} className="text-[18px] font-bold">
                                                    {record.ttOrtd} {new Date(record.ttDateGiven).toLocaleDateString()}
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <div className="border h-[80px] rounded-md text-center" id="tt2-div">
                                        <h3 className="font-bold">TT2</h3>
                                        <p className="text-[10px] mb-2">(ONE MO. AFTER THE FIRST DOSE)</p>
                                        {ttRecords
                                            .filter(record => record.ttStatus === "TT1")
                                            .map((record, idx) => (
                                                <div key={`tt2-${idx}`} className="text-[18px] font-bold">
                                                    {record.ttOrtd} {new Date(record.ttDateGiven).toLocaleDateString()}
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <div className="border h-[80px] rounded-md text-center" id="tt3-div">
                                        <h3 className="font-bold">TT3</h3>
                                        <p className="text-[10px] mb-2">(6 MONTHS AFTER THE SECOND DOSE)</p>
                                        {ttRecords
                                            .filter(record => record.ttStatus === "TT2")
                                            .map((record, idx) => (
                                                <div key={`tt3-${idx}`} className="text-[18px] font-bold">
                                                    {record.ttOrtd} {new Date(record.ttDateGiven).toLocaleDateString()}
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <div className="border h-[80px] rounded-md text-center" id="tt4-div">
                                        <h3 className="font-bold">TT4</h3>
                                        <p className="text-[10px] mb-2">(1 YEAR AFTER THE THIRD DOSE)</p>
                                        {ttRecords
                                            .filter(record => record.ttStatus === "TT3")
                                            .map((record, idx) => (
                                                <div key={`tt4-${idx}`} className="text-[18px] font-bold">
                                                    {record.ttOrtd} {new Date(record.ttDateGiven).toLocaleDateString()}
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <div className="border h-[80px] rounded-md text-center" id="tt5-div">
                                        <h3 className="font-bold">TT5</h3>
                                        <p className="text-[10px] mb-2">(1 YEAR AFTER THE FOURTH DOSE)</p>
                                        {ttRecords
                                            .filter(record => record.ttStatus === "TT4")
                                            .map((record, idx) => (
                                                <div key={`tt5-${idx}`} className="text-[18px] font-bold">
                                                    {record.ttOrtd} {new Date(record.ttDateGiven).toLocaleDateString()}
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <div className="border h-[80px] rounded-md text-center" id="fim-div">
                                        <h3 className="font-bold">FIM</h3>
                                        <Label className="fimInput mb-2"></Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* present pregnancy */}
                    <Separator className="mt-10"/>
                    <h3 className="text-md font-bold mt-8">PRESENT PREGNANCY</h3>
                    <div className="grid grid-cols-6 gap-4 mt-2">
                        <FormInput
                            control={form.control}
                            name="presentPregnancy.gravida"
                            label="GRAVIDA"
                            placeholder=""
                        />
                        <FormInput
                            control={form.control}
                            name="presentPregnancy.para"
                            label="PARA"
                            placeholder=""
                        />
                        <FormInput
                            control={form.control}
                            name="presentPregnancy.fullterm"
                            label="FULLTERM"
                            placeholder=""
                        />
                        <FormInput
                            control={form.control}
                            name="presentPregnancy.preterm"
                            label="PRETERM"
                            placeholder=""
                        />
                        <FormDateTimeInput
                            control={form.control}
                            name="presentPregnancy.lmp"
                            label="LMP"
                            type="date"
                        />
                        <FormDateTimeInput
                            control={form.control}
                            name="presentPregnancy.edc"
                            label="EDC"
                            type="date"
                        />
                    </div>

                    {/* laboratory exam */}
                    <div>
                        <LaboratoryResults
                            labResults={labResults}
                            onLabResultsChange={setLabResults}
                        />
                    </div>
                    

                    <div className="mt-8">
                        <FormInput
                            control={form.control}
                            name="labResults.laboratoryRemarks"
                            label="Laboratory Remarks"
                            placeholder="(Optional)"
                        />
                    </div>

                    <div className="mt-8 sm:mt-auto flex justify-end">
                        <Button variant="outline" className="mt-4 mr-4 sm-w-32" onClick={back}>
                            Prev
                        </Button>
                        <Button type="submit" className="mt-4 mr-4 sm-w-32" onClick={onSubmit}>
                            Next
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}