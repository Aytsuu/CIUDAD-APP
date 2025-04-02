// Prenatal Form Viewing

// imports
import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { intlFormat } from "date-fns"
import { EarthIcon } from "lucide-react"

// personal info 
const personalInfo = [
    { // 0
        name: 'FAMILY NO:',
        value: "",
        className: "w-1/6"
    },
    { // 1
        name: 'NAME:',
        value: "",
        className: "w-1/2"
    },
    { // 2
        name: 'AGE:',
        value: "",
        ageGroup: "( )10-14YO ( )15-19 ( )20-49",
        className: "w-[90px]"
    },
    { // 3
        name: 'DATE OF BIRTH:',
        value: "",
        className: "w-[100px]"
    },
    { // 4
        name: "HUSBAND'S NAME:",
        value: "",
        className: "w-[300px]"
    },
    { // 5 
        name: 'OCCUPATION:',
        value: "",
        className: "w-1/6"
    },
    { // 6
        name: 'ADDRESS:',
        value: "",
        className: "w-[300px]"
    },
    { //7
        name: 'WEIGHT:',
        value: "",
        className: "w-[65px]"
    },
    { // 8
        name: 'HEIGHT:',
        value: "",
        className: "w-[65px]"
    },
    { // 9
        name: 'BMI:',
        bmiCategory: "( )LOW ( )HIGH ( )NORMAL",
        value: "",
        className: "w-[65px]"
    }
]

const personalInfoFieldGroups = [
    [personalInfo[0]], // family no.
    [personalInfo[1], personalInfo[2]], // name and age
    [personalInfo[3], personalInfo[4], personalInfo[5]], // dob, husband's name, occupation
    [personalInfo[6], personalInfo[7], personalInfo[8], personalInfo[9]] // address, wt, ht, bmi
]


// obstetric history
const obstetricHistory = [
    {
        name: "NO. OF CHILDREN BORN ALIVE:",
        value: "",
        className: "w-20"
    },
    {
        name: "NO. OF LIVING CHILDREN:",
        value: "",
        className: "w-20"
    },
    {
        name: "NO. OF ABORTION:",
        value: "",
        className: "w-20"
    },
    {
        name: "NO. OF STILL BIRTHS/FETAL DEATH:",
        value: "",
        className: "w-20"
    },
    {
        name: "HISTORY OF LARGE BABIES (8LBS):",
        value: "",
        className: "w-20"
    },
    {
        name: "HISTORY OF DIABETES:",
        value: "",
        className: "w-20"
    }
]


// medical history
const medicalHistory = [
    {
        name: "PREVIOUS ILLNESS:",
        value: "",
        className: "w-[350px]"
    },
    {
        name: "PREVIOUS HOSPITALIZATION:",
        value: "",
        className: "w-[350px]"
    },
    {
        name: "PREVIOUS PREG. COMPLICATION: (SPECIFY) ",
        value: "",
        className: "w-[350px]"
    }
]


// previous pregnancy
const previousPregnancy = [
    {
        name: "DATE OF DELIVERIES",
        value: ""
    },
    {
        name: "OUTCOME",
        value: ""
    },
    {
        name: "TYPE OF DELIVERY (NSCD / CS)",
        value: ""
    },
    {
        name: "BABY'S WT",
        value: ""
    },
    {
        name: "GENDER",
        value: ""
    },
    {
        name: "BALLARD SCORE",
        value: ""
    },
    {
        name: "APGAR SCORE",
        value: ""
    }
] 


// tetanus toxoid
const tetanusToxoidGiven = [
    {
        name: "TT1",
        subInfo: "(FIRST VISIT)",
        value: ""
    },
    {
        name: "TT2",
        subInfo: "(ONE MO AFTER THE FIRST DOSE)",
        value: ""
    },
    {
        name: "TT3",
        subInfo: "(6 MONTHS AFTER THE SECOND DOSE)",
        value: ""
    },
    {
        name: "TT4",
        subInfo: "(1 YEAR AFTER THE THIRD DOSE)",
        value: ""
    },
    {
        name: "TT5",
        subInfo: "(1 YEAR AFTER THE FOURTH DOSE)",
        value: ""
    },
    {
        name: "FIM",
        value: ""
    }
]


// present pregnancy
const presentPregnancy = [
    {
        name: "GRAVIDA:",
        value: "",
        className: "w-14"
    },
    {
        name: "PARA:",
        value: "",
        className: "w-14"
    },
    {
        name: "FULLTERM:",
        value: "",
        className: "w-14"
    },
    {
        name: "PRETERM:",
        value: "",
        className: "w-14"
    },
    {
        name: "LMP:",
        value: "",
        className: "w-[208px]"
    },
    {
        name: "EDC:",
        value: "",
        className: "w-[208px]"
    }
]

const presentPregnancyFieldGroups = [
    [presentPregnancy[0], presentPregnancy[1], presentPregnancy[2], presentPregnancy[3]], //gravida, para, fullterm, preterm
    [presentPregnancy[4], presentPregnancy[5]] // lmp, edc
]


// guide for 4ANC Visits
const guide4ANCVisits = [
    {
        name: "1st tri up to 12 weeks and 6 days",
        value: "",
    },
    {
        name: "2nd tri up to 13-27 wks and 6 days",
        value: "",
    },
    {
        name: "3rd tri 28 wks and more",
        value: "",
    }
]

// laboratory results
const labResults = [
    {
        name: "URINALYSIS:",
        value: "",
        className: "mr-20 w-20"
    },
    {
        name: "SYPHILLIS:",
        value: "",
        className: "mr-20 w-20"
    },
    {
        name: "OGCT: 50GMS 24-28WKS",
        value: "",
        className: "w-14" 
    },
    {
        name: "100GMS:",
        value: "",
        className: "w-14"
    },
    {
        name: "CBC:",
        value: "",
        className: "mr-20 w-32"
    },
    {
        name: "HIV TEST:",
        value: "",
        className: "w-24"
    },
    {
        name: "SGOT/SGPT:",
        value: "",
        className: "mr-20 w-20"
    },
    {
        name: "HEPA B:",
        value: "",
        className: "w-20"
    },
    {
        name: "CREATININE SERUM:",
        value: "",
        className: "mr-[3.1rem] w-14"
    },
    {
        name: "BLOOD TYPING:",
        value: "",
        className: "w-24"
    },
    {
        name: "BUE/BUN:",
        value: "",
        className: "w-20"
    }
]

const labResultsFieldGroups = [
    [labResults[0], labResults[1], labResults[2], labResults[3]], // urinalysis, syphillis, ogct 50gms, 100gms
    [labResults[4], labResults[5]], // cbc, hiv test
    [labResults[6], labResults[7]], // sgot, sgpt
    [labResults[8], labResults[9]], // creatinine serum, blood typing
    [labResults[10]] // bue/bun
]


// checklist preeclampsia
const checklist = [
    {
        name: "INCREASED BP", value: "", className: "w-10"
    },
    {
        name: "EPIGASTRIC PAIN", value: "", className: "w-10"
    },
    {
        name: "NAUSEA/VOMITING", value: "", className: "w-10"
    },
    {
        name: "BLURRING OF VISION", value: "", className: "w-10"
    },
    {
        name: "EDEMA", value: "", className: "w-10"
    },
    {
        name: "SEVERE HEADACHE", value: "", className: "w-10"
    },
    {
        name: "ABNORMAL VAGINALDISCHARGES", value: "", className: "w-10"
    },
    {
        name: "VAGINAL BLEEDING", value: "", className: "w-10"
    },
    {
        name: "CHILLS & FEVER", value: "", className: "w-10"
    },
    {
        name: "DIFF. IN BREATHING", value: "", className: "w-10"
    },
    {
        name: "VARICOSITIES", value: "", className: "w-10"
    },
    {
        name: "ABDOMINAL PAIN", value: "", className: "w-10"
    }
]

const checklistFieldGroups = [
    // increased bp, epigastric pain, nausea/vomiting, blurring of vision, edema, severe headache
    [checklist[0], checklist[1], checklist[2], checklist[3], checklist[4], checklist[5]],
    // abnormal vaginal discharges, vaginal bleeding, chills & fever, diff. in breathing, varicosities, abdominal pain
    [checklist[6], checklist[7], checklist[8], checklist[9], checklist[10], checklist[11]]
]


// plan during pregnancy
const pregnancyPlan = [
    {
        name: "PLAN FOR PLACE OF DELIVERY:", value: "", className:"w-20"
    },
    {
        name: "PLAN FOR NEWBORN SCREENING:", value: "", className:"w-20"
    }
]


// micronutrient supplementation
const micronutrientSupp = [
    {
        name: "IRON W/ FOLIC ACID: (DATE STARTED)", value: "", className: "w-[160px]"
    },
    {
        name: "(DATE COMPLETED)", value: "", className: "w-[150px]"
    },
    {
        name: "DEWORMING TAB: (PREFERABLY 3RD TRIMESTER) DATE GIVEN:", value: "", className: "w-[150px]"
    }
]

const micronutrientSuppFieldGroups = [
    [micronutrientSupp[0], micronutrientSupp[1]], // iron w/ folic acid date started, date completed
    [micronutrientSupp[2]] // deworming tab date given
]


// risk codes
const riskCodes = [
    {
        name: "PREVIOUS CAESARIAN", value: "", className: "w-20"
    },
    {
        name: "3 consecutive miscarriages of stillborn baby", value: "", className: "w-20"
    },
    {
        name: "Postpartum hemorrhage", value: "", className: "w-20"
    },
    {
        name: "Tuberculosis", value: "", className: "w-20"
    },
    {
        name: "Heart Disease", value: "", className: "w-20"
    },
    {
        name: "Diabetes", value: "", className: "w-20"
    },
    {
        name: "Bronchial Asthma", value: "", className: "w-20"
    },
    {
        name: "Goiter", value: "", className: "w-20"
    }
]

const riskCodesFieldGroups = [
    [riskCodes[0], riskCodes[1], riskCodes[2]], // previous cs, 3 consecutive miscarriages, postpartum hemorrhage
    [riskCodes[3], riskCodes[4], riskCodes[5], riskCodes[6], riskCodes[7]] // tb, heart disease, diabetes, bronchial asthma, goiter
]


// input line readOnly component
export const InputLine = ({className}: {className: string}) => (
    <Input className={cn("w-1/2 mr-2 border-0 border-b border-black rounded-none", className)} readOnly/>

)

// // checkbox component
// export const CheckBox = ({label, checked}: {label: string; checked: boolean}) => (
//     <Checkbox className={cn("mt-4 mr-2", { 'checked-class' : checked })} checked={checked} disabled></Checkbox>
// )


// default funtion
export default function PrenatalViewingOne() {
    return (
        <div className="max-w-5xl mx-auto m-5 p-5 border border-gray-300">
            {/* upper text of header & header */}
            <div>
                <p className="text-sm pb-3 mt-10"> CEBU CITY HEALTH DEPARTMENT <br /> 2020 </p>
                <h4 className="text-center pb-3"> <b>MATERNAL HEALTH RECORD</b> </h4>
            </div>

            {/* personal information */}
            <div className="flex flex-col">
                {personalInfoFieldGroups.map((group, index) => (
                    <div className="flex pb-2" key={index}>
                        {group.map((info, i) => (
                            <React.Fragment key={i}>
                                <Label className="mt-4">{info.name}</Label>
                                <InputLine className={info.className} />
                                <Label className="mt-4"><b>{info.ageGroup}</b></Label>
                                <Label className="mt-4">{info.bmiCategory}</Label>
                            </React.Fragment>
                        ))}
                    </div>
                ))}
            </div>

            
            <div className="flex justify-between pr-[10rem]">
                {/* obstetric history */}
                <div className="flex flex-col">
                    <h6 className="text-sm mt- underline"><b>OBSTETRIC HISTORY</b></h6>
                    {obstetricHistory.map((info) => (
                        <div className="flex">
                            <React.Fragment>
                                <Label className="mt-4">{info.name}</Label>
                                <InputLine className={info.className}/>
                            </React.Fragment>
                        </div>
                    ))}
                </div>

                {/* medical history */}
                <div className="flex">
                    <div className="flex flex-col">
                        <h6 className="text-sm mt-3 underline"><b>MEDICAL HISTORY</b></h6>
                        {medicalHistory.map((info) => (
                            <React.Fragment>
                                <Label className="mt-4">{info.name}</Label>
                                <InputLine className={info.className}/>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* previous pregnancy */}
            <div className="flex">
                <h6 className="text-sm mt-5 underline"><b>PREVIOUS PREGNANCY</b></h6>

            </div>

            {/* tetanus toxoid */}
            <div className="flex">
                <h6 className="text-sm mt-5 underline"><b>TETANUS TOXOID GIVEN: (DATE GIVEN)</b></h6>

            </div>

            <div className="flex justify-between">
                {/* present pregnancy */}
                <div className="flex flex-col">
                    <h6 className="text-sm mt-4 underline"><b>PRESENT PREGNANCY</b></h6>
                    {presentPregnancyFieldGroups.map((group, index) => (
                        <div className="flex" key={index}>
                            {group.map((info, i) => (
                                <React.Fragment key={i}>
                                    <Label className="mt-4">{info.name}</Label>
                                    <InputLine className={info.className}></InputLine>
                                </React.Fragment>
                            ))}
                        </div>
                    ))}
                </div>
                {/* guide 4ANC visits */}
                <h6 className="text-sm mt-4 "><b>Guide for 4ANC Visits: (date)</b></h6>
                <div className="">

                </div>
            </div>
            
            {/* laboratory results */}
            <div className="flex flex-col">
                <h6 className="text-sm mt-4 underline"><b>LABORATORY RESULTS: (DATE AND RESULT)</b></h6>
                <p className="text-sm mt-2 underline">PRE-ECLAMPSIA PANEL:</p> 
                {labResultsFieldGroups.map((group, index) => (
                    <div className="flex" key={index}>
                        {group.map((info, i) => (
                            <React.Fragment key={i}>
                                <Label className="mt-4">{info.name}</Label>
                                <InputLine className={info.className}/>
                            </React.Fragment>
                        ))}
                    </div>
                ))}
            </div>
            
            {/* risk checklist */}
            <div className="flex flex-col">
                <h6 className="text-sm mt-4 underline"><b>CHECKLIST</b></h6>
                <p className="text-sm mt-4">( ) PRE-ECLAMPSIA</p>
                <div className="flex flex-row">
                    {checklistFieldGroups.map((group, index) => (
                        <div className="flex flex-col" key={index}>
                            {group.map((info, i) => (
                                <div className="flex ml-20">
                                    <React.Fragment key={i}>
                                    <Checkbox className="mt-4 mr-2" checked={false} disabled></Checkbox>
                                    <Label className="mt-4 mr-20">{info.name}</Label>
                                </React.Fragment>
                                </div>
                            ))}

                        </div>
                    ))}
                </div>
            </div>

            {/* pregnancy plan */}
            <div className="flex mt-5">
                {pregnancyPlan.map((info, index) => (
                    <React.Fragment key={index}>
                        <Label className="mt-4">{info.name}</Label>
                        {index == 1 ? (
                            <div className="flex">
                                <Checkbox className="mt-4 mr-2 ml-4" checked={false} disabled></Checkbox>
                                <p className="mt-3">YES</p>
                                <Checkbox className="mt-4 mr-2 ml-4" checked={false} disabled></Checkbox>
                                <p className="mt-3">NO</p>
                            </div>
                        ) : (
                            <InputLine className={info.className}></InputLine>
                        )}
                        
                    </React.Fragment>
                ))}
            </div>

            {/* micronutrient supplementation */}
            <div className="flex flex-col">
                <h6 className="text-sm mt-4 underline"><b>MICRONUTRIENT SUPPLEMENTATION:</b></h6>
                {micronutrientSuppFieldGroups.map((group, index) => (
                    <div className="flex" key={index}>
                        {group.map((info, i) => (
                            <React.Fragment key={i}>
                                <Label className="mt-4">{info.name}</Label>
                                <InputLine className={info.className}></InputLine>
                            </React.Fragment>
                        ))}
                    </div>
                ))}
            </div>

            {/* risk codes */}
            <div className="flex flex-col">
                <h6 className="text-sm mt-4 underline"><b>RISK CODES:</b></h6>
                <div className="flex justify-between">
                    <p className="text-sm mt-4">( ) HAS ONE OR MORE OF THE FF: </p>
                    <p className="text-sm mt-4 mr-[20rem]">( ) Having one or more 1 conditions: </p>
                </div>
                
                <div className="flex flex-row">
                    {riskCodesFieldGroups.map((group, index) => (
                        <div className="flex flex-col" key={index}>
                            {group.map((info, i) => (
                                <div className="flex">
                                    <React.Fragment key={i}>
                                        <Checkbox className="ml-10 mr-2 mt-4" disabled></Checkbox>
                                        <Label className="mr-[8rem] mt-4">{info.name}</Label>
                                    </React.Fragment>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* assessed by */}
            <div className="flex flex-col mb-10">
                <Label className="mt-4">ASSESSED BY:</Label>
                <InputLine className="w-1/6"></InputLine>
            </div>
        </div>
    )
}