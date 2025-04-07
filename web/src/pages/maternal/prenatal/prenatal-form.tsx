"use client"

import { PrenatalFormSchema } from "@/form-schema/prenatal-schema"
import PrenatalFormFirstPg from "./prenatal-form-firstpg"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form/form"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-layout"
import CardLayout from "@/components/ui/card/card-layout"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button/button"


// interface PrenatalFormProps {
//     recordType: string;
// }

export default function PrenatalForm(){
    const form = useForm<z.infer<typeof PrenatalFormSchema>>({
        resolver: zodResolver(PrenatalFormSchema),
        defaultValues: {
            familyNo: "",
            isTransient: "",
            motherLName: "",
            motherFName: "",
            motherMName: undefined,
            motherAge: undefined,
            motherDOB: "",
            husbandLName: "",
            husbandFName: "",
            husbandMName: "",
            occupation: "",
            address: [
                {
                    street: "",
                    barangay: "",
                    city: "",
                    province: ""
                }
            ],
            motherWt: 0,
            motherHt: 0,
            motherBMI: 0,

            noOfChBornAlive: undefined,
            noOfLivingCh: undefined,
            noOfAbortion: undefined,
            noOfStillBirths: undefined,
            historyOfLBabies: undefined,
            historyOfDiabetes: "",

            prevIllness: "",
            prevIllnessYear: undefined,
            prevHospitalization: "",
            prevHospitalizationYear: undefined,

            dateOfDelivery: "",
            outcome: "",
            typeOfDelivery: "",
            babysWt: 0,
            gender: "",
            ballardScore: 0,
            apgarScore: 0,

            ttStatus: "",
            ttDateGiven: "",

            gravida: 0,
            para: 0,
            fullterm: 0,
            preterm: 0,
            lmp: "",
            edc: "",

            dateOfFollowUp: "",

            checklist: [{
                increasedBP: false,
                epigastricPain: false,
                nausea: false,
                blurringOfVision: false,
                edema: false,
                severeHeadache: false,
                abnormalVaginalDischarges: false,
                vaginalBleeding: false,
                chillsFever: false,
                diffInBreathing: false,
                varicosities: false,
                abdominalPain: false
            }],

            planPlacePfDel: "",
            planNewbornScreening: false,

            ironFolicStarted: "",
            ironFolicCompleted: "",
            deworming: "",

            riskcodes: [{
                prevCaesarian: false,
                miscarriages: false,
                postpartumHemorrhage: false,
                tuberculosis: false,
                heartDisease: false,
                diabetes: false,
                bronchialAsthma: false,
                goiter: false
            }],

            assessedby: "",
        }
    })

    function onSubmit(values: z.infer<typeof PrenatalFormSchema>){
        console.log(values);
    }

    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <CardLayout 
                    cardTitle="MATERNAL HEALTH RECORD"
                    CardTitleClassName="text-darkBlue1"
                    cardContent={
                        <> 
                            <div>
                                <PrenatalFormFirstPg />
                            </div>
                            <div className="flex justify-end space-x-4 pt-6">
                                <Button type="button" variant="outline" onClick={() => form.reset()}>
                                    Prev
                                </Button>
                                <Button type="submit" >Next</Button> 
                            </div>
                        </>
                       
                    }
                />
                
            </form>
        </Form>
    )
}