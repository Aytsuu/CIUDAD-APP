import { UseFormReturn } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form/form";
import { z } from "zod"

import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"

import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


export default function PrenatalFormSecPg(
    {form, onSubmit, back}: {
        form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>,
        onSubmit: () => void,
        back: () => void,
    }
){
    const submit = () => {
        form.trigger(["previousPregnancy", "vaccineType", "tetanusToxoid", "presentPregnancy", "labResults"]).then((isValid) => {
            if(isValid){
                onSubmit();
            }
        })
    }

    return(
        <div className="flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto">
            <Label className="text-black text-opacity-50 italic mb-10">Page 2</Label>
            <Form {...form}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                }}
                >
                    <h3 className="text-md font-bold">PREVIOUS PREGNANCY</h3>
                    <div className="grid grid-cols-7 gap-4 mt-2">
                        <FormField
                            control={form.control}
                            name="previousPregnancy.dateOfDelivery"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>DATE OF DELIVERY</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date" placeholder=""/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="previousPregnancy.outcome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>OUTCOME</FormLabel>
                                    <FormControl>
                                        <SelectLayout 
                                            label="outcome"
                                            placeholder='Select'
                                            className="w-full"
                                            options={[
                                                {id: "0", name: "FULLTERM"},
                                                {id: "1", name: "PRETERM"}
                                            ]}
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="previousPregnancy.typeOfDelivery"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>TYPE OF DELIVERY</FormLabel>
                                    <FormControl>
                                    <SelectLayout 
                                            label="typeOfDelivery"
                                            placeholder='Select'
                                            className="w-full"
                                            options={[
                                                {id: "0", name: "Vaginal Delivery"},
                                                {id: "1", name: "C-Section"}
                                            ]}
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="previousPregnancy.babysWt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>BABY'S WT</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Baby's wt in lbs"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="previousPregnancy.gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <FormControl>
                                        <SelectLayout 
                                            label="gender"
                                            placeholder='Select'
                                            className="w-full"
                                            options={[
                                                {id: "0", name: "Female"},
                                                {id: "1", name: "Male"}
                                            ]}
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="previousPregnancy.ballardScore"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>BALLARD SCORE</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder=""/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="previousPregnancy.apgarScore"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>APGAR SCORE</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder=""/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    {/* tetanus toxoid status */}
                    <Separator className="mt-10 mb-10"/>
                    <h3 className="text-md font-bold"> TETANUS TOXOID GIVEN: (DATE GIVEN)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                            <div className="mt-1 mb-2">
                                <FormField
                                        control={form.control}
                                        name="vaccineType.ttOrtd"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Vaccine Type</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            // setSelectedOption(value);
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

                                                        {/* after 2 week option */}
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
                                </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <FormField
                                    control={form.control}
                                    name="tetanusToxoid.ttStatus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>TT Status</FormLabel>
                                            <FormControl>
                                                <SelectLayout 
                                                    label="TT Status"
                                                    placeholder='Select'
                                                    className="w-full"
                                                    options={[
                                                        {id: "0", name: "TT1"},
                                                        {id: "1", name: "TT2"},
                                                        {id: "2", name: "TT3"},
                                                        {id: "3", name: "TT4"},
                                                        {id: "4", name: "TT5"},
                                                        {id: "5", name: "FIM"},
                                                    ]}
                                                    value={field.value ?? ''}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tetanusToxoid.ttDateGiven"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date Given</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="date" placeholder=""/>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="mt-4">
                                <FormField
                                    control={form.control}
                                    name="tetanusToxoid.tdapDateGiven"
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
                            <Button className="mt-5">
                                Add
                            </Button>
                        </div>

                        <div className="flex flex-col border rounded-md p-2">
                                <div className="grid grid-cols-3 gap-2 m-3">
                                    <div className="border h-[80px] rounded-md text-center" id="tt1-div">
                                        <h3 className="font-bold">TT1</h3>
                                        <p className="text-[10px]">(FIRST VISIT)</p>
                                        <Label className="tt1Input text-[18px]">TT - 02/25/2025</Label>
                                    </div>
                                    <div className="border h-[80px] rounded-md text-center" id="tt2-div">
                                        <h3 className="font-bold">TT2</h3>
                                        <p className="text-[10px] mb-2">(ONE MO. AFTER THE FIRST DOSE)</p>
                                        <Label className="tt2Input mb-2"></Label>
                                    </div>
                                    <div className="border h-[80px] rounded-md text-center" id="tt3-div">
                                        <h3 className="font-bold">TT3</h3>
                                        <p className="text-[10px] mb-2">(6 MONTHS AFTER THE SECOND DOSE)</p>
                                        <Label className="tt3Input mb-2"></Label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 m-3">
                                    <div className="border h-[80px] rounded-md text-center" id="tt4-div">
                                        <h3 className="font-bold">TT4</h3>
                                        <p className="text-[10px] mb-2">(1 YEAR AFTER THE THIRD DOSE)</p>
                                        <Label className="tt4Input mb-2"></Label>
                                    </div>
                                    <div className="border h-[80px] rounded-md text-center" id="tt5-div">
                                        <h3 className="font-bold">TT5</h3>
                                        <p className="text-[10px] mb-2">(1 YEAR AFTER THE FOURTH DOSE)</p>
                                        <Label className="tt5Input mb-2"></Label>
                                    </div>
                                    <div className="border h-[80px] rounded-md text-center" id="fim-div">
                                        <h3 className="font-bold">FIM</h3>
                                        <Label className="fimInput mb-2"></Label>
                                    </div>
                                </div>
                        </div>
                    </div>
                    

                    {/* present pregnancy */}
                    <Separator className="mt-10"/>
                    <h3 className="text-md font-bold mt-8">PRESENT PREGNANCY</h3>
                    <div className="grid grid-cols-6 gap-4 mt-2">
                        <FormField
                            control={form.control}
                            name="presentPregnancy.gravida"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>GRAVIDA</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder=""/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="presentPregnancy.para"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>PARA</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder=""/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="presentPregnancy.fullterm"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>FULLTERM</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder=""/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="presentPregnancy.preterm"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>PRETERM</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder=""/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="presentPregnancy.lmp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>LMP</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date" placeholder=""/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="presentPregnancy.edc"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>EDC</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date" placeholder=""/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* laboratory exam */}
                    <Separator className="mt-10"/>
                    <h3 className="text-md font-bold mt-8">LABORATORY RESULTS: (DATE AND RESULT)</h3>
                    <div className="flex justify-end">
                        <Button>Upload Lab Result</Button>
                    </div>
                    <Label>PRE-ECLAMPSIA PANEL:</Label>
                    <div className="grid grid-cols-6 gap-4 mt-2">
                        <FormField
                            control={form.control}
                            name="labResults.urinalysisDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URINALYSIS</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="labResults.cbcDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CBC</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="labResults.sgotSgptDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SGOT/SGPT</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="labResults.creatinineDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CREATININE SERUM</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="labResults.buaBunDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>BUA/BUN</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="labResults.syphillisDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SYPHILLIS</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="labResults.hivTestDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>HIV TEST</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="labResults.hepaBDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>HEPA B</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="labResults.bloodTypingDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>BLOOD TYPING</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="labResults.ogct50Date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>OGCT: 50 GMS 24-28 WKS</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="labResults.ogct50Date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>100 GMS</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date"/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        
                    </div>

                    <div className="mt-8">
                        <FormField
                            control={form.control}
                            name="labResults.laboratoryRemarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Laboratory Remarks</FormLabel>
                                    <FormLabel className="ml-1 text-black text-opacity-50 italic">(Optional)</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=""/>
                                    </FormControl>
                                </FormItem>
                            )}
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