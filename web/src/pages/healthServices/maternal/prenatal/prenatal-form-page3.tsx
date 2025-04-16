import { UseFormReturn } from "react-hook-form";
import { Form } from "react-router";
import { z } from "zod"

import { Button } from "@/components/ui/button/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Separator } from "@/components/ui/separator";
import { CalendarCheck } from 'lucide-react';

import { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";


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
    }

    // for the schedule of follow-up visit 
    // -----
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

    // validate for specific string
    const isValidOption = (value: string): value is 'week' | 'twoweeks' | 'month' => {
        return ['week', 'twoweeks', 'month'].includes(value);
    }
    // -----

    // checklist 
    // -----
    type AssessmentChecklistKeys = keyof z.infer<typeof PrenatalFormSchema>['assessmentChecklist'];
    const preEclampsiaChecklist: { name: AssessmentChecklistKeys; label: string }[] = [
        {
            name: "increasedBP", label: "INCREASED BP",
        },
        {
            name: "epigastricPain", label: "EPIGASTRIC PAIN",
        },
        {
            name: "nausea", label: "NAUSEA",
        },
        {
            name: "blurringOfVision", label: "BLURRING OF VISION",
        },
        {
            name: "edema", label: "EDEMA",
        },
        {
            name: "severeHeadache", label: "SEVERE HEADACHE",
        },
        {
            name: "abnormalVaginalDischarges", label: "ABNORMAL VAGINAL DISCHARGES",
        },
        {
            name: "vaginalBleeding", label: "VAGINAL BLEEDING",
        },
        {
            name: "chillsFever", label: "CHILLS & FEVER",
        },
        {
            name: "diffInBreathing", label: "DIFF. IN BREATHING",
        },
        {
            name: "varicosities", label: "VARICOSITIES",
        },
        {
            name: "abdominalPain", label: "ABDOMINAL PAIN",
        },
    ]

    const preEclampsiaChecklistGroup = [
        [preEclampsiaChecklist[0], preEclampsiaChecklist[1], preEclampsiaChecklist[2], preEclampsiaChecklist[3], preEclampsiaChecklist[4], preEclampsiaChecklist[5]],
        [preEclampsiaChecklist[6], preEclampsiaChecklist[7], preEclampsiaChecklist[8], preEclampsiaChecklist[9], preEclampsiaChecklist[10], preEclampsiaChecklist[11]]
    ]
    // -----


    // risk codes
    // -----
    type RiskCodes = z.infer<typeof PrenatalFormSchema>['riskCodes'];

    type HasOneOrMoreOfTheFFKeys = keyof RiskCodes["hasOneOrMoreOfTheFF"];
    type HasOneOrMoreOneConditionsKeys = keyof RiskCodes["hasOneOrMoreOneConditions"];
    const riskCodesList = {
        hasOneOrMoreOfTheFF: [
            {
                name: "prevCaesarian" as HasOneOrMoreOfTheFFKeys, label: "Previous Caesarian Section",
            },
            {
                name: "miscarriages" as HasOneOrMoreOfTheFFKeys, label: "3 consecutive micarriages of stillborn baby",
            },
            {
                name: "postpartumHemorrhage" as HasOneOrMoreOfTheFFKeys, label: "Postpartum Hemorrhage",
            }
        ],
        hasOneOrMoreOneConditions: [
            {
                name: "tuberculosis" as HasOneOrMoreOneConditionsKeys, label: " Tuberculosis",
            },
            {
                name: "heartDisease" as HasOneOrMoreOneConditionsKeys, label: "Heart Disease",
            },
            {
                name: "diabetes" as HasOneOrMoreOneConditionsKeys, label: "Diabetes",
            },
            {
                name: "bronchialAsthma" as HasOneOrMoreOneConditionsKeys, label: "Bronchial Asthma",
            },
            {
                name: "goiter" as HasOneOrMoreOneConditionsKeys, label: "Goiter",
            },
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
                        <div className="grid grid-cols-2 border rounded-lg border-gray">
                            <div className="grid m-2">
                                <div className="flex flex-col m-5">
                                    <h2 className="text-lg font-bold">Schedule Follow-up Visit</h2>
                                    <FormField
                                        control={form.control}
                                        name="followUpSchedule.scheduleOption"
                                        render={({ field }) => (
                                            <FormItem className="ml-8 pt-3">
                                                <FormLabel className="text-semibold">Select follow-up period</FormLabel>
                                                <FormControl>
                                                    {/* radio button */}
                                                    <RadioGroup
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            setSelectedOption(value);
                                                        }}
                                                        defaultValue={field.value}
                                                        className="flex flex-col space-y-1"
                                                    >
                                                        {/* after a week option */}
                                                        <FormItem className="flex items-center space-x-3 space-y-0"> 
                                                            <FormControl>
                                                                <RadioGroupItem value="week"/>
                                                            </FormControl>
                                                            <FormLabel>After a week (preferably for AOG within 9 months)</FormLabel>
                                                        </FormItem>

                                                        {/* after 2 week option */}
                                                        <FormItem className="flex items-center space-x-3 space-y-0"> 
                                                            <FormControl>
                                                                <RadioGroupItem value="twoweeks"/>
                                                            </FormControl>
                                                            <FormLabel>After 2 week (preferably for AOG within 7-8 months)</FormLabel>
                                                        </FormItem>

                                                        {/* after a week option */}
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
                                
                                {/* follow-up visit date display */}
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
                            
                            {/* follow-up history */}
                            <div className="flex flex-col m-2 pl-5 pr-5 h-[389px] border-l-2 border-gray-300">
                                <h2 className="text-lg font-bold m-5">Follow-up History</h2>
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

                        {/* guide for 4ANC Visit */}
                        <div className="grid grid-cols- gap-4 mt-3">
                            <div className="flex flex-col border w-full rounded-lg border-gray">
                                <h2 className="text-lg font-bold p-5">Guide for 4ANC Visit: (date)</h2>
                                <div>
                                    <div className="grid grid-cols-3 gap-3 pl-5 pr-5 mb-5">
                                        <FormField
                                            control={form.control}
                                            name="ancVisits.aog.aogWeeks"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>AOG weeks</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="number"/>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="ancVisits.aog.aogDays"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>AOG days</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="number"/>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <Button className="mt-[2rem]" variant="default">Check</Button>
                                    </div>
                                    <div className="grid grid-cols-5 pl-5 pr-5 mb-5 gap-3">
                                        <FormField
                                            control={form.control}
                                            name="ancVisits.firstTri"
                                            render={({ field }) => (
                                                <FormItem className="">
                                                    <FormLabel>1st tri up to 12 wks and 6 days</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="date"/>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="ancVisits.secondTri"
                                            render={({ field }) => (
                                                <FormItem className="">
                                                    <FormLabel>2nd tri 13-27 wks and 6 days</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="date"/>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        {/* <Label className="ml-5">3rd tri 28 wks and more</Label> */}
                                        <FormField
                                            control={form.control}
                                            name="ancVisits.thirdTriOne"
                                            render={({ field }) => (
                                                <FormItem className="">
                                                    <FormLabel>(1st visit in 3rd trimester)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="date"/>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="ancVisits.thirdTriTwo"
                                            render={({ field }) => (
                                                <FormItem className="">
                                                    <FormLabel>(2nd visit in 3rd Tri)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="date"/>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* checklist */}
                            <div className="flex flex-col border pb-5 w-full rounded-lg border-gray">
                                <h2 className="text-lg font-bold p-5">Checklist</h2>
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

                        
                        <div className="grid grid-cols- mt-3">
                            {/* pregnancy plan */}
                            <div className="border rounded-lg p-5 border-gray">
                                <h3 className="text-lg font-bold">Birth Plans</h3>
                                <div className="flex flex-col gap-4 mt-5">
                                    <FormField
                                        control={form.control}
                                        name="pregnancyPlan.planPlaceOfDel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>PLAN FOR PLACE OF DELIVERY</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Enter plan of delivery place"/>
                                                </FormControl>
                                            </FormItem>
                                        )}
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
                            
                            {/* micronutrient supplementation */}
                            <div className="border rounded-lg mt-3 p-5 border-gray">
                                <h3 className="text-lg font-bold">Micronutrient Supplementation</h3>

                                {/* iron folic w/ acid */}
                                <div className="flex flex-col">
                                    <Label className="mt-5">IRON W/ FOLIC ACID:</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        
                                        <FormField
                                            control={form.control}
                                            name="micronutrientSupp.ironFolicStarted"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date Started</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="date"/>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="micronutrientSupp.ironFolicCompleted"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date Completed</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="date"/>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* deworming */}
                                    <Label className="mt-5">DEWORMING TAB: (preferably 3rd trimester):</Label>
                                    <FormField
                                        control={form.control}
                                        name="micronutrientSupp.deworming"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date Given</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="date"/>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* risk codes */}
                        <div className="flex flex-col border rounded-lg mt-3 p-5 border-gray"> 
                            <h3 className="text-lg font-bold">Risk Codes </h3>
                            <div className="grid grid-cols-2 ml-10 mt-5">
                                <Label>HAS ONE OR MORE OF THE FF:</Label>
                                <Label>HAS ONE OR MORE 1 CONDITIONS:</Label>
                            </div>
                            <div className="grid grid-cols-2 gap-14 ml-24">
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
                        {/* assessed by */}
                        <div className="flex w-full m-2">
                            <FormField 
                                control={form.control}
                                name="assessedBy.assessedby"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ASSESSED BY:</FormLabel>
                                        <FormControl>
                                            <SelectLayout 
                                                label="BHWs"
                                                placeholder='Select'
                                                className="w-[200px]"
                                                options={[
                                                    {id: "0", name: "Juliana Zamora"},
                                                    {id: "1", name: "Inka Kamarani"},
                                                    {id: "2", name: "Lowe Anika"}
                                                ]}
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                            />
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
        </>
    )
}