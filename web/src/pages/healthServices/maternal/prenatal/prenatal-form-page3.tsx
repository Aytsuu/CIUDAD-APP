import { UseFormReturn } from "react-hook-form";
import { Form } from "react-router";
import { z } from "zod";

import { Button } from "@/components/ui/button/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { CalendarCheck } from 'lucide-react';

import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form/form";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormSelect } from "@/components/ui/form/form-select";

export default function PrenatalFormThirdPg(
    {form, onSubmit, back}: {
        form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>,
        onSubmit: () => void,
        back: () => void,
    }
){
    const submit = () => {
        form.trigger(["followUpSchedule", "ancVisits", "assessmentChecklist", "pregnancyPlan", "micronutrientSupp", "riskCodes", "assessedBy"]).then((isValid) => {
            if(isValid){
                onSubmit(); //proceed to next page
            }
        })
        window.scrollTo(0, 0);
    }

    // for the schedule of follow-up visit 
    const calculatedDate = (option: 'week' | 'twoweeks' | 'month'):string | null => {
        const today = new Date();

        switch (option){
            case 'week':
                today.setDate(today.getDate() + 7);
                break;
            case 'twoweeks':
                today.setDate(today.getDate() + 14);
                break;
            case 'month':
                today.setMonth(today.getMonth() + 1)
                break;
            default:
                return null;
        }
        return today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'});
    }

    const [selectedOption, setSelectedOption] = useState('');

    const isValidOption = (value: string): value is 'week' | 'twoweeks' | 'month' => {
        return ['week', 'twoweeks', 'month'].includes(value);
    }

    // checklist 
    type AssessmentChecklistKeys = keyof z.infer<typeof PrenatalFormSchema>['assessmentChecklist'];
    const preEclampsiaChecklist: { name: AssessmentChecklistKeys; label: string }[] = [
        { name: "increasedBP", label: "INCREASED BP" },
        { name: "epigastricPain", label: "EPIGASTRIC PAIN" },
        { name: "nausea", label: "NAUSEA" },
        { name: "blurringOfVision", label: "BLURRING OF VISION" },
        { name: "edema", label: "EDEMA" },
        { name: "severeHeadache", label: "SEVERE HEADACHE" },
        { name: "abnormalVaginalDischarges", label: "ABNORMAL VAGINAL DISCHARGES" },
        { name: "vaginalBleeding", label: "VAGINAL BLEEDING" },
        { name: "chillsFever", label: "CHILLS & FEVER" },
        { name: "diffInBreathing", label: "DIFF. IN BREATHING" },
        { name: "varicosities", label: "VARICOSITIES" },
        { name: "abdominalPain", label: "ABDOMINAL PAIN" },
    ]

    const preEclampsiaChecklistGroup = [
        [preEclampsiaChecklist[0], preEclampsiaChecklist[1], preEclampsiaChecklist[2], preEclampsiaChecklist[3], preEclampsiaChecklist[4], preEclampsiaChecklist[5]],
        [preEclampsiaChecklist[6], preEclampsiaChecklist[7], preEclampsiaChecklist[8], preEclampsiaChecklist[9], preEclampsiaChecklist[10], preEclampsiaChecklist[11]]
    ]

    // risk codes
    type RiskCodes = z.infer<typeof PrenatalFormSchema>['riskCodes'];
    type HasOneOrMoreOfTheFFKeys = keyof RiskCodes["hasOneOrMoreOfTheFF"];
    type HasOneOrMoreOneConditionsKeys = keyof RiskCodes["hasOneOrMoreOneConditions"];
    const riskCodesList = {
        hasOneOrMoreOfTheFF: [
            { name: "prevCaesarian" as HasOneOrMoreOfTheFFKeys, label: "Previous Caesarian Section" },
            { name: "miscarriages" as HasOneOrMoreOfTheFFKeys, label: "3 consecutive micarriages of stillborn baby" },
            { name: "postpartumHemorrhage" as HasOneOrMoreOfTheFFKeys, label: "Postpartum Hemorrhage" }
        ],
        hasOneOrMoreOneConditions: [
            { name: "tuberculosis" as HasOneOrMoreOneConditionsKeys, label: " Tuberculosis" },
            { name: "heartDisease" as HasOneOrMoreOneConditionsKeys, label: "Heart Disease" },
            { name: "diabetes" as HasOneOrMoreOneConditionsKeys, label: "Diabetes" },
            { name: "bronchialAsthma" as HasOneOrMoreOneConditionsKeys, label: "Bronchial Asthma" },
            { name: "goiter" as HasOneOrMoreOneConditionsKeys, label: "Goiter" },
        ]
    }

    return(
        <>
            <div className="flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto">
                <Label className="text-black text-opacity-50 italic mb-10">Page 3</Label>
                <Form {...form}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        submit();
                    }}
                    >
                        <div className="grid grid-cols-2">
                            <div className="grid m-2 pr-5">
                                <div className="flex flex-col m-5">
                                    <h3 className="text-md font-bold">SCHEDULE FOR FOLLOW-UP VISIT</h3>
                                    <FormField
                                        control={form.control}
                                        name="followUpSchedule.scheduleOption"
                                        render={({ field }) => (
                                            <FormItem className="ml-8 pt-3">
                                                <FormLabel className="text-semibold">Select follow-up period</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            setSelectedOption(value);
                                                        }}
                                                        defaultValue={field.value}
                                                        className="flex flex-col space-y-1"
                                                    >
                                                        <FormItem className="flex items-center space-x-3 space-y-0"> 
                                                            <FormControl>
                                                                <RadioGroupItem value="week"/>
                                                            </FormControl>
                                                            <FormLabel>After a week (preferably for AOG within 9 months)</FormLabel>
                                                        </FormItem>

                                                        <FormItem className="flex items-center space-x-3 space-y-0"> 
                                                            <FormControl>
                                                                <RadioGroupItem value="twoweeks"/>
                                                            </FormControl>
                                                            <FormLabel>After 2 week (preferably for AOG within 7-8 months)</FormLabel>
                                                        </FormItem>

                                                        <FormItem className="flex items-center space-x-3 space-y-0"> 
                                                            <FormControl>
                                                                <RadioGroupItem value="month"/>
                                                            </FormControl>
                                                            <FormLabel>After a month (preferably for AOG within 1-6 months)</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                
                                <div className="flex items-center border rounded-lg ml-4 mr-4 mb-4 p-2 border-gray">
                                    <FormItem>
                                        <div className="flex">
                                            <CalendarCheck size={30} className="ml-5 mr-2"/>
                                            <FormLabel className="flex items-center text-md w-full m">  Follow-up Date:</FormLabel>
                                        </div>
                                        <FormControl>
                                            <div className="flex justify-center w-full p-1 ml-8 text-lg font-bold"> 
                                                {selectedOption && isValidOption(selectedOption) ? calculatedDate(selectedOption) : <i>Select a follow-up period</i>}
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                </div>

                                <Button className="mr-4 mb-4 ml-4">Schedule Follow-Up</Button>
                            </div>
                            
                            <div className="flex flex-col m-2 pl-5 pr-5 h-[389px] border-l-2 border-gray-300">
                                <h3 className="text-md font-bold p-5">FOLLOW-UP HISTORY</h3>
                                <div className="overflow-auto">
                                    <div className="flex flex-col border ml-5 mr-5 p-4 rounded-xl border-gray">
                                        <div className="w-full grid grid-cols-2 gap-2 mb-5">
                                            <div>
                                                <FormItem>
                                                    <FormLabel className="bg-[#1841a7] text-white rounded-2xl p-1 pr-2 pl-2">Completed</FormLabel>
                                                </FormItem>
                                            </div>
                                            
                                            <div className="flex justify-end">
                                                <FormItem>
                                                    <FormLabel className="text-ashgray p-1 pr-2 pl-2"><i>Created: March 04, 2025</i></FormLabel>
                                                </FormItem>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <CalendarCheck size={30}/>
                                            <FormItem>
                                                <FormLabel className="text-xl font-bold ml-3">March 11, 2025</FormLabel>
                                            </FormItem>
                                        </div>
                                    </div>

                                    <div className="flex flex-col border m-5 p-4 rounded-xl border-gray">
                                        <div className="w-full grid grid-cols-2 gap-2 mb-5">
                                            <div>
                                                <FormItem>
                                                    <FormLabel className="bg-[#1841a7] text-white rounded-2xl p-1 pr-2 pl-2">Completed</FormLabel>
                                                </FormItem>
                                            </div>
                                            
                                            <div className="flex justify-end">
                                                <FormItem>
                                                    <FormLabel className="text-ashgray p-1 pr-2 pl-2"><i>Created: February 25, 2025</i></FormLabel>
                                                </FormItem>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <CalendarCheck size={30}/>
                                            <FormItem>
                                                <FormLabel className="text-xl font-bold ml-3">March 04, 2025</FormLabel>
                                            </FormItem>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="mt-10 mb-5"/>
                        <div className="grid grid-cols- gap-4 mt-3">
                            <div className="flex flex-col w-full">
                                <h3 className="text-md font-bold p-5">GUIDE FOR 4ANC VISITS</h3>
                                <div>
                                    <div className="grid grid-cols-3 gap-3 pl-5 pr-5 mb-5">
                                        <FormInput
                                            control={form.control}
                                            name="ancVisits.aog.aogWeeks"
                                            label="AOG weeks"
                                            type="number"
                                        />
                                        <FormInput
                                            control={form.control}
                                            name="ancVisits.aog.aogDays"
                                            label="AOG days"
                                            type="number"
                                        />
                                        <div className="">
                                            <Button className="mt-[2rem] w-[10rem]" variant="default">Check</Button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 pl-5 pr-5 mb-5 gap-3">
                                        <div className="border rounded-md p-5">
                                            <FormDateTimeInput
                                                control={form.control}
                                                name="ancVisits.firstTri"
                                                label="1st Trimester"
                                                type="date"
                                            />
                                            <Label className="text-black text-opacity-50 italic ml-1">(up to 12 wks and 6 days)</Label>
                                        </div>
                                        <div className="border rounded-md p-5">
                                            <FormDateTimeInput
                                                control={form.control}
                                                name="ancVisits.secondTri"
                                                label="2nd Trimester"
                                                type="date"
                                            />
                                            <Label className="text-black text-opacity-50 italic ml-1">(13-27 wks and 6 days)</Label>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 border p-5">
                                            <Label className="col-span-2">3rd Trimester</Label>
                                            <div>
                                                <FormDateTimeInput
                                                    control={form.control}
                                                    name="ancVisits.thirdTriOne"
                                                    label="1st visit"
                                                    type="date"
                                                    
                                                />
                                            </div>
                                            <div>
                                                <FormDateTimeInput
                                                    control={form.control}
                                                    name="ancVisits.thirdTriTwo"
                                                    label="2nd visit"
                                                    type="date"
                                                />
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="mt-10"/> 
                            <div className="flex flex-col w-full">
                                <h3 className="text-md font-bold p-5">CHECKLIST</h3>
                                <Label className="ml-10 mb-5">()PRE-ECLAMPSIA</Label>
                                {preEclampsiaChecklistGroup.map((group, i) => (
                                    <div className="grid grid-cols-2 ml-20" key={i}>
                                        {group.map((item) => (
                                            <FormField
                                                key={item.name}
                                                control={form.control}
                                                name={`assessmentChecklist.${item.name}`}
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center mt-2">
                                                        <FormControl className="mt-2">
                                                            <Checkbox 
                                                                checked={field.value} 
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="ml-2">{item.label}</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator className="mt-10 mb-10"/>
                        <div className="grid grid-cols-2 mt-3 gap-3">
                            <div className=" p-5 border-r-2 border-gray-300">
                                <h3 className="text-md font-bold">BIRTH PLANS</h3>
                                <div className="grid grid-cols- gap-7 mt-5">
                                    <FormInput
                                        control={form.control}
                                        name="pregnancyPlan.planPlaceOfDel"
                                        label="PLAN FOR PLACE OF DELIVERY"
                                        placeholder="Enter plan of delivery place"
                                    />

                                    <FormField 
                                        control={form.control}
                                        name="pregnancyPlan.planNewbornScreening"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>PLAN FOR NEWBORN SCREENING:</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            setSelectedOption(value);
                                                        }}
                                                        className="ml-3"
                                                    >
                                                        <FormItem className="mr-4">
                                                            <FormControl>
                                                                <RadioGroupItem value="yes"/>
                                                            </FormControl>
                                                            <FormLabel className="ml-2">YES</FormLabel>
                                                        </FormItem>
                                                        <FormItem>
                                                            <FormControl>
                                                                <RadioGroupItem value="no"/>
                                                            </FormControl>
                                                            <FormLabel className="ml-2">NO</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-3 ml-5 pr-5 pl-5">
                                <h3 className="text-md font-bold">MICRONUTRIENT SUPPLEMENTATION</h3>
                                <div className="flex flex-col">
                                    <Label className="mt-5">IRON W/ FOLIC ACID:</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormDateTimeInput
                                            control={form.control}
                                            name="micronutrientSupp.ironFolicStarted"
                                            label="Date Started"
                                            type="date"
                                        />
                                        <FormDateTimeInput
                                            control={form.control}
                                            name="micronutrientSupp.ironFolicCompleted"
                                            label="Date Completed"
                                            type="date"
                                        />
                                    </div>

                                    <Label className="mt-5">DEWORMING TAB: (preferably 3rd trimester):</Label>
                                    <FormDateTimeInput
                                        control={form.control}
                                        name="micronutrientSupp.deworming"
                                        label="Date Given"
                                        type="date"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator className="mt-10 mb-5"/>
                        <div className="flex flex-col mt-3 p-5 border-gray"> 
                            <h3 className="text-md font-bold">RISK CODES</h3>
                            <div className="flex flex-row gap-[15rem] ml-5 mt-5">
                                <Label>HAS ONE OR MORE OF THE FF:</Label>
                                <Label>HAS ONE OR MORE 1 CONDITIONS:</Label>
                            </div>
                            <div className="flex flex-row gap-[10rem] ml-10">
                                <div>
                                    {riskCodesList.hasOneOrMoreOfTheFF.map((item) => (
                                        <FormField
                                            key={item.name}
                                            control={form.control}
                                            name={`riskCodes.hasOneOrMoreOfTheFF.${item.name}`}
                                            render={({ field }) => (
                                                <FormItem className="flex items-center mt-2">
                                                    <FormControl className="mt-2">
                                                        <Checkbox
                                                            className="mr-2"
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormLabel>{item.label}</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                                
                                <div>
                                    {riskCodesList.hasOneOrMoreOneConditions.map((item) => (
                                        <FormField
                                            key={item.name}
                                            control={form.control}
                                            name={`riskCodes.hasOneOrMoreOneConditions.${item.name}`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl className="mt-2">
                                                        <Checkbox
                                                            className="mr-2"
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormLabel>{item.label}</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Separator className="mt-10 mb-5"/>
                        <div className="flex w-full m-2">
                            <FormSelect
                                control={form.control}
                                name="assessedBy.assessedby"
                                label="ASSESSED BY:"
                                options={[
                                    {id: "0", name: "Juliana Zamora"},
                                    {id: "1", name: "Inka Kamarani"},
                                    {id: "2", name: "Lowe Anika"}
                                ]}
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
        </>
    )
}