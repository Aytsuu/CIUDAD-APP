import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Link } from "react-router"

interface InputLineProps {
  className?: string
  value: string
}
// Header details
const Header = [
  { name: "CLIENT ID.:", value: "", className: "w-48 md:w-64" },
  { name: "PHILHEALTH NO.:", value: "", className: "w-56 md:w-72" },
]; 

// NHTS details
const NHTS = [
  { name: "NHTS?", value: "", className: "w-12" },
  { name: "Pantawid Pamilya Pilipino (4Ps):", value: "", className: "w-12" },
];

// const ClientType = [
//   { name: "New Acceptor", value: "", classname: "w-12" },
//   { name: "Current User", value: "", classname: "w-12" },
// ];

// const CurrentUserType = [
//   { name: "Changing Method", value: "", classname: "w-12" },
//   { name: "Changing Clinic", value: "", classname: "w-12" },
//   { name: "Dropout/Restart", value: "", classname: "w-12" }
// ];

// const ReasonFP = [
//   { name: "spacing", value: "", classname: "w-12" },
//   { name: "limiting", value: "", classname: "w-12" },
//   { name: "others", value: "", classname: "w-12" }
// ];

// const Reason = [
//   { name: "medical condition", value: "", classname: "w-12" },
//   { name: "side-effects", value: "", classname: "w-12" },
// ];

// const MethodsCurrentlyUsed = [
//   { name: "COC", value: "", classname: "w-12" },
//   { name: "IUD", value: "", classname: "w-12" },
//   { name: "BOM/CMM", value: "", classname: "w-12" },
//   { name: "LAM", value: "", classname: "w-12" },
//   { name: "POP", value: "", classname: "w-12" },
//   { name: "Interval", value: "", classname: "w-12" },
//   { name: "BBT", value: "", classname: "w-12" },
//   { name: "Others", value: "", classname: "w-12" },
//   { name: "Injectable", value: "", classname: "w-12" },
//   { name: "Post Partum", value: "", classname: "w-12" },
//   { name: "STM", value: "", classname: "w-12" },
//   { name: "Implant", value: "", classname: "w-12" },
//   { name: "Condom", value: "", classname: "w-12" },
//   { name: "SDM", value: "", classname: "w-12" }
// ];

// // Medical History questions
// const MedicalHistoryQuestions = [
//   { name: "severe headaches / migraine", value: "" },
//   { name: "history of stroke / heart attack / hypertension", value: "" },
//   { name: "non-traumatic hematoma / frequent bruising or gum bleeding", value: "" },
//   { name: "current or history of breast cancer / breast mass", value: "" },
//   { name: "severe chest pain", value: "" },
//   { name: "cough for more than 14 days", value: "" },
//   { name: "jaundice", value: "" },
//   { name: "unexplained vaginal bleeding", value: "" },
//   { name: "abnormal vaginal discharge", value: "" },
//   { name: "intake of phenobarbital (anti-seizure) or rifampicin (anti-TB)", value: "" },
//   { name: "Is this client a SMOKER?", value: "" },
//   { name: "With Disability?", value: "" }
// ];

// // VAW Risk Assessment items
// const VAWRiskItems = [
//   { name: "unpleasant relationship with partner", value: "" },
//   { name: "partner does not approved of the visit to FP clinic", value: "" },
//   { name: "history of domestic violence or VAW", value: "" }
// ];

// // Referral options
// const ReferralOptions = [
//   { name: "DSWD", value: "" },
//   { name: "WCPU", value: "" },
//   { name: "NGOs", value: "" },
//   { name: "Others", value: "", hasSpecify: true }
// ];
// const Obstetrical = [
//   { name: "G", value: "" },
//   { name: "P", value: "" },
//   { name: "Full term", value: "" },
//   { name: "Abortion", value: ""},
//   { name: "Premature", value: "" },
//   { name: "Living Children", value: ""},
// ];


interface InputLineProps {
  className?: string;
  value: string;
}


const InputLine: React.FC<InputLineProps> = ({ className, value }) => (
  <Input
    className={cn("border-0 border-b border-black rounded-none w-full px-2 py-1 h-6", className)}
    readOnly
    value={value}
  />
)

// Radio button component for yes/no options
const YesNoRadio = ({ name, value }: { name: string; value?: string }) => (
  <div className="flex items-center space-x-4">
    <div className="flex items-center space-x-1">
      <input
        type="radio"
        id={`${name}-yes`}
        name={name}
        value="yes"
        checked={value === "yes"}
        readOnly
        className="h-4 w-4"
      />
      <Label htmlFor={`${name}-yes`} className="text-sm">
        Yes
      </Label>
    </div>
    <div className="flex items-center space-x-1">
      <input
        type="radio"
        id={`${name}-no`}
        name={name}
        value="no"
        checked={value === "no"}
        readOnly
        className="h-4 w-4"
      />
      <Label htmlFor={`${name}-no`} className="text-sm">
        No
      </Label>
    </div>
  </div>
)

const FamilyPlanningView: React.FC = () => {
  return (
    <div className="mx-auto p-4 bg-white">
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-bold">SIDE A</div>
        <div className="text-center font-bold text-base md:text-lg">
          FAMILY PLANNING (FP) FORM 1
        </div>
        <div className="text-sm font-bold">ver 3.0</div>
      </div>

      <div className="border p-4">
        {/* Top Section */}
        <div className="">

          <div className="flex  bg-gray ">
          <div className="md:col-span-2 bg-gray p-2 border border-black">
            <Label className="font-bold block mb-2">
              FAMILY PLANNING CLIENT ASSESSMENT RECORD
            </Label>
            <p className="text-sm">
              Instructions for Physicians, Nurses, and Midwives:{" "}
              <strong>
                Make sure that the client is not pregnant by using the question
                listed in SIDE B.
              </strong>{" "}
              Completely fill out or check the required information. Refer
              accordingly for any abnormal history/findings for further medical
              evaluation.
            </p>
          </div>
             {/* Right Section */}
          <div className="border border-black flex-grow pl-3 pt-1 pr-3">
            {Header.map((field, index) => (
              <div className="flex items-center mb-2 w-full" key={index}>
                <Label className="text-sm font-bold whitespace-nowrap mr-2">
                  {field.name}
                </Label>
                <div className="w-full">
                  <InputLine className="w-full box-border" value={field.value} />
                </div>
              </div>
            ))}
           <div className="flex gap-8">
              {NHTS.map((field, index) => (
                <div className="flex items-center gap-2" key={index}>
                  <Label className="text-sm font-bold whitespace-nowrap">
                    {field.name}
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Checkbox checked={field.value === "Yes"} disabled />
                      <Label className="text-sm">Yes</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <Checkbox checked={field.value === "No"} disabled />
                      <Label className="text-sm">No</Label>
                    </div>
                  </div>
                </div>
              ))}
              </div>
              </div>
           
          </div>
          
          <div className="p-2">
           
           
          </div>
        </div>
        <div className="w-full border border-black p-3">
        <div className="w-full">
          <Label className="font-bold whitespace-nowrap">NAME OF CLIENT:</Label>
          <div className="flex-1">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2 space-y-1">
                <InputLine value="" />
                <Label className="text-xs text-center block">Last Name</Label>
              </div>


              <div className="col-span-2 space-y-1">
                <InputLine value="" />
                <Label className="text-xs text-center block">Given Name</Label>
              </div>
              <div className="col-span-1 space-y-1">
                <InputLine value="" />
                <Label className="text-xs text-center block">MI</Label>
              </div>
              <div className="col-span-2 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Date of Birth</Label>
            </div>
            <div className="col-span-1 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Age</Label>
            </div>
            <div className="col-span-2 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Educ. Attain.</Label>
            </div>
            <div className="col-span-2 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Occupation</Label>
            </div>
            </div>
          </div>
          {/* Demographics Row */}
          
        </div>

        {/* Address Section */}
        <div className="flex items-start gap-2 mt-6">
          <Label className="font-bold whitespace-nowrap">ADDRESS:</Label>
          <br></br>
          <div className="grid grid-cols-12 gap-4">
            <div className="">
              <InputLine value="" />
              <Label className="text-xs text-center block">No.</Label>
            </div>
            <div className="col-span-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Street</Label>
            </div>
            <div className="col-span-2">
              <InputLine value="" />
              <Label className="text-xs text-center block">Barangay</Label>
            </div>
            <div className="col-span-2">
              <InputLine value="" />
              <Label className="text-xs text-center block">Municipality/City</Label>
            </div>
            <div className="col-span-2 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Province</Label>
            </div>
            <div className="col-span-2">
              <InputLine value="" />
              <Label className="text-xs text-center block">Contact Number</Label>
            </div>
        
            <div className="col-span-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Civil Status</Label>
            </div>
            <div className="col-span-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Religion</Label>
            </div>
         
        </div> 
        </div>

        {/* Spouse Section */}
        <div className="flex items-start gap-2 mt-6">
          <Label className="font-bold block mb-2">NAME OF SPOUSE:</Label>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Last Name</Label>
            </div>
            <div className="col-span-3 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Given Name</Label>
            </div>
            <div className="col-span-1 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">MI</Label>
            </div>
            <div className="col-span-2 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Date of Birth</Label>
            </div>
            <div className="col-span-1 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Age</Label>
            </div>
            <div className="col-span-2 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Occupation</Label>
            </div>
          </div>
        </div>
        

        {/* Bottom Row */}
        <div className="grid grid-cols-12 gap-4 mt-5 mb-5">
          <div className="col-span-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-bold whitespace-nowrap">NO. OF LIVING CHILDREN:</Label>
              <div className="flex-grow">
                <InputLine value="" />
              </div>
            </div>
          </div>
          <div className="col-span-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-bold whitespace-nowrap mt-2">PLAN TO HAVE MORE CHILDREN?</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 mt-2">
                  <Checkbox id="plan-more-yes" disabled />
                  <Label htmlFor="plan-more-yes" className="text-sm">Yes</Label>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Checkbox id="plan-more-no" disabled />
                  <Label htmlFor="plan-more-no" className="text-sm">No</Label>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-5">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-bold whitespace-nowrap">AVERAGE MONTHLY INCOME:</Label>
              <div className="flex-grow">
                <InputLine value="" />
              </div>
            </div>
          </div>
        </div>
        </div>
      

        {/* Type of Client Section */}
        <div className="grid grid-cols-12 p-2  border border-black">
           {/* Left Column */}
           <div className="col-span-6 p-2 ">
            <div className="font-bold mb-4">Type of Client</div>
            <div className="grid grid-rows-2 gap-2">
              <div className="flex items-center space-x-2">
                <input type="radio" id="new-acceptor" name="client-type" value="new-acceptor" />
                <Label htmlFor="new-acceptor">New Acceptor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="current-user" name="client-type" value="current-user" />
                <Label htmlFor="current-user">Current User</Label>
              </div>
            </div>
            <div className="ml-8 mt-2">
              <div className="flex items-center space-x-2">
                <input type="radio" id="changing-method" name="current-user-type" value="changing-method" />
                <Label htmlFor="changing-method">Changing Method</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="changing-clinic" name="current-user-type" value="changing-clinic" />
                <Label htmlFor="changing-clinic">Changing Clinic</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="dropout-restart" name="current-user-type" value="dropout-restart" />
                <Label htmlFor="dropout-restart">Dropout/Restart</Label>
              </div>
            </div>

            <div className="mt-4">
              <div className="font-bold">Reason for FP:</div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="spacing" name="reason-fp" value="spacing" />
                <Label htmlFor="spacing">spacing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="limiting" name="reason-fp" value="limiting" />
                <Label htmlFor="limiting">limiting</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="others-fp" name="reason-fp" value="others" />
                <Label htmlFor="others-fp">others</Label>
                <InputLine value="" className="w-32 inline-block" />
              </div>
            

            <div className="mt-4">
              <div className="font-bold">Reason:</div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="medical-condition" name="reason" value="medical-condition" />
                <Label htmlFor="medical-condition">medical condition</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="side-effects" name="reason" value="side-effects" />
                <Label htmlFor="side-effects">side-effects</Label>
                <InputLine value="" className="w-32 inline-block" />
              </div>
            </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-5 p-2">
            <div>Method currently used (for Changing Method):</div>
            <div className="grid grid-cols-2 mt-4 gap-4">
              {[
                "COC",
                "BOM/CMM",
                "POP",
                "LAM",
                "Injectable",
                "BBT",
                "Implant",
                "IUD",
                "SDM",
                "Interval",
                "STM",
                "Post Partum",
                "Condom",
                "Others",
              ].map((method) => (
                <div key={method} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={method.toLowerCase().replace(/\//g, "-")}
                    name="method-used"
                    value={method.toLowerCase().replace(/\//g, "-")}
                  />
                  <Label htmlFor={method.toLowerCase().replace(/\//g, "-")}>{method}</Label>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Label className="text-sm">specify:</Label>
              <InputLine value="" className="w-32 ml-2 inline-block" />
            </div>
          </div>
        </div>

        {/* Medical History and VAW Risk Section */}
        <div className="grid grid-cols-2 border border-black">
          {/* Medical History */}
          <div className="border-r border-black p-2">
            <div className="font-bold">I. MEDICAL HISTORY</div>
            <div className="text-sm mb-2">Does the client have any of the following?</div>

            {[
              "severe headaches / migraine",
              "history of stroke / heart attack / hypertension",
              "non-traumatic hematoma / frequent bruising or gum bleeding",
              "current or history of breast cancer / breast mass",
              "severe chest pain",
              "cough for more than 14 days",
              "jaundice",
              "unexplained vaginal bleeding",
              "abnormal vaginal discharge",
              "intake of phenobarbital (anti-seizure) or rifampicin (anti-TB)",
              "Is this client a SMOKER?",
              "With Disability?",
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className="mr-2">■</span>
                  <Label className="text-sm">{item}</Label>
                </div>
                <YesNoRadio name={`medical-${index}`} />
              </div>
            ))}

            <div className="ml-4 mt-1">
              <Label className="text-sm">If YES please specify:</Label>
              <InputLine value="" className="w-full" />
            </div>
          </div>

          {/* VAW Risk Assessment */}
          <div className="p-2 border border-black">
            <div className="font-bold">IV. RISKS FOR VIOLENCE AGAINST WOMEN (VAW)</div>

            {[
              "unpleasant relationship with partner",
              "partner does not approved of the visit to FP clinic",
              "history of domestic violence or VAW",
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className="mr-2">■</span>
                  <Label className="text-sm">{item}</Label>
                </div>
                <YesNoRadio name={`vaw-${index}`} />
              </div>
            ))}

            <div className="mt-2">
              <Label className="font-bold text-sm">Referred to:</Label>
              <div className="grid grid-rows gap-1 mt-1">
                {["DSWD", "WCPU", "NGOs", "Others"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`referral-${option.toLowerCase()}`}
                      name="referral"
                      value={option.toLowerCase()}
                    />
                    <Label className="text-sm">{option}</Label>
                    {option === "Others" && <InputLine value="" className="w-24 inline-block" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>


        <div className="border  border-black p-2 grid grid-cols-2">
          <div>
            <div className="font-bold">II. OBSTETRICAL HISTORY</div>
            <div className="flex items-center mt-2">
              <Label className="text-sm">Number of pregnancies: G:</Label>
              <InputLine value="" className="w-12 ml-1 inline-block" />
              <Label className="text-sm ml-4">P:</Label>
              <InputLine value="" className="w-12 ml-1 inline-block" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <div className="flex items-center">
                  <Label className="text-sm">Full term</Label>
                  <InputLine value="" className="flex-1 ml-2" />
                </div>
                <div className="flex items-center mt-2">
                  <Label className="text-sm">Abortion</Label>
                  <InputLine value="" className="flex-1 ml-2" />
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <Label className="text-sm">Premature</Label>
                  <InputLine value="" className="flex-1 ml-2" />
                </div>
                <div className="flex items-center mt-2">
                  <Label className="text-sm">Living Children</Label>
                  <InputLine value="" className="flex-1 ml-2" />
                </div>
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-center">
                <Label className="text-sm">Date of last delivery</Label>
                <InputLine value="" className="w-32 ml-2 inline-block" />
              </div>
              <div className="flex items-center mt-2">
                <Label className="text-sm">Type of last delivery:</Label>
                <div className="flex items-center space-x-1 ml-2">
                  <input type="radio" id="vaginal" name="delivery-type" value="vaginal" />
                  <Label className="text-sm">Vaginal</Label>
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  <input type="radio" id="cesarean" name="delivery-type" value="cesarean" />
                  <Label className="text-sm">Cesarean Section</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <div className="flex items-center">
                  <Label className="text-sm">Last menstrual period</Label>
                  <InputLine value="" className="flex-1 ml-2" />
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <Label className="text-sm">Previous menstrual period</Label>
                  <InputLine value="" className="flex-1 ml-2" />
                </div>
              </div>
            </div>

            <div className="mt-2">
              <Label className="text-sm">Menstrual Flow:</Label>
              <div className="ml-4">
                <div className="flex items-center space-x-1">
                  <input type="radio" id="scanty" name="menstrual-flow" value="scanty" />
                  <Label className="text-sm">Scanty (1-2 pads per day)</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <input type="radio" id="moderate" name="menstrual-flow" value="moderate" />
                  <Label className="text-sm">Moderate (3-5 pads per day)</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <input type="radio" id="heavy" name="menstrual-flow" value="heavy" />
                  <Label className="text-sm">Heavy (more than 5 pads per day)</Label>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="dysmenorrhea" />
                <Label className="text-sm">Dysmenorrhea</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="hydatidiform-mole" />
                <Label className="text-sm">Hydatidiform mole (within the last 12 months)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="ectopic-pregnancy" />
                <Label className="text-sm">History of ectopic pregnancy</Label>
              </div>
            </div>
          </div>

             {/* Physical Examination Section */}
        <div className="border-l pl-3 border-black">
          <div className="font-bold">V. PHYSICAL EXAMINATION</div>
          <div className="grid grid-cols-2 gap-4 mt-2 ">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center">
                  <Label className="text-sm">Weight:</Label>
                  <InputLine value="" className="w-16 ml-1 inline-block" />
                  <span className="text-sm ml-1">kg</span>
                </div>
                <div className="flex items-center mt-2">
                  <Label className="text-sm">Height:</Label>
                  <InputLine value="" className="w-16 ml-1 inline-block" />
                  <span className="text-sm ml-1">m</span>
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <Label className="text-sm">Blood pressure:</Label>
                  <InputLine value="" className="w-16 ml-1 inline-block" />
                  <span className="text-sm ml-1">mmHg</span>
                </div>
                <div className="flex items-center mt-2">
                  <Label className="text-sm">Pulse rate:</Label>
                  <InputLine value="" className="w-16 ml-1 inline-block" />
                  <span className="text-sm ml-1">/min</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="font-bold text-sm">SKIN:</div>
                <div className="flex items-center space-x-1">
                  <input type="radio" id="skin-normal" name="skin" value="normal" />
                  <Label className="text-sm">normal</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <input type="radio" id="skin-pale" name="skin" value="pale" />
                  <Label className="text-sm">pale</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <input type="radio" id="skin-yellowish" name="skin" value="yellowish" />
                  <Label className="text-sm">yellowish</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <input type="radio" id="skin-hematoma" name="skin" value="hematoma" />
                  <Label className="text-sm">hematoma</Label>
                </div>
              </div>
              <div>
                <div className="font-bold text-sm">EXTREMITIES</div>
                <div className="flex items-center space-x-1">
                  <input type="radio" id="extremities-normal" name="extremities" value="normal" />
                  <Label className="text-sm">normal</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <input type="radio" id="extremities-edema" name="extremities" value="edema" />
                  <Label className="text-sm">edema</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <input type="radio" id="extremities-varicosities" name="extremities" value="varicosities" />
                  <Label className="text-sm">varicosities</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <div className="font-bold text-sm">CONJUNCTIVA:</div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="conjunctiva-normal" name="conjunctiva" value="normal" />
                <Label className="text-sm">normal</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="conjunctiva-pale" name="conjunctiva" value="pale" />
                <Label className="text-sm">pale</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="conjunctiva-yellowish" name="conjunctiva" value="yellowish" />
                <Label className="text-sm">yellowish</Label>
              </div>
            </div>
            <div>
              <div className="font-bold text-sm">NECK:</div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="neck-normal" name="neck" value="normal" />
                <Label className="text-sm">normal</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="neck-mass" name="neck" value="neck-mass" />
                <Label className="text-sm">neck mass</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="neck-enlarged" name="neck" value="enlarged-lymph-nodes" />
                <Label className="text-sm">enlarged lymph nodes</Label>
              </div>
            </div>
            <div>
              <div className="font-bold text-sm">BREAST:</div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="breast-normal" name="breast" value="normal" />
                <Label className="text-sm">normal</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="breast-mass" name="breast" value="mass" />
                <Label className="text-sm">mass</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="breast-discharge" name="breast" value="nipple-discharge" />
                <Label className="text-sm">nipple discharge</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <div className="font-bold text-sm">ABDOMEN:</div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="abdomen-normal" name="abdomen" value="normal" />
                <Label className="text-sm">normal</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="abdomen-mass" name="abdomen" value="abdominal-mass" />
                <Label className="text-sm">abdominal mass</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="abdomen-varicosities" name="abdomen" value="varicosities" />
                <Label className="text-sm">varicosities</Label>
              </div>
            </div>
            <div>
              <div className="font-bold text-sm">PELVIC EXAMINATION</div>
              <div className="text-sm">(For IUD Acceptors)</div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="pelvic-normal" name="pelvic" value="normal" />
                <Label className="text-sm">normal</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="pelvic-mass" name="pelvic" value="mass" />
                <Label className="text-sm">mass</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="pelvic-discharge" name="pelvic" value="abnormal-discharge" />
                <Label className="text-sm">abnormal discharge</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="pelvic-abnormalities" name="pelvic" value="cervical-abnormalities" />
                <Label className="text-sm">cervical abnormalities</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="pelvic-warts" name="pelvic" value="warts" />
                <Label className="text-sm">warts</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="pelvic-polyp" name="pelvic" value="polyp-or-cyst" />
                <Label className="text-sm">polyp or cyst</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="pelvic-inflammation" name="pelvic" value="inflammation-or-erosion" />
                <Label className="text-sm">inflammation or erosion</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="pelvic-bloody" name="pelvic" value="bloody-discharge" />
                <Label className="text-sm">bloody discharge</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <div className="font-bold text-sm">CERVICAL CONSISTENCY:</div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="cervical-firm" name="cervical-consistency" value="firm" />
                <Label className="text-sm">firm</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="cervical-soft" name="cervical-consistency" value="soft" />
                <Label className="text-sm">soft</Label>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <input type="checkbox" id="cervical-tenderness" />
                <Label className="text-sm">cervical tenderness</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="checkbox" id="adnexal-mass" />
                <Label className="text-sm">adnexal mass / tenderness</Label>
              </div>
            </div>
            <div>
              <div className="font-bold text-sm">UTERINE POSITION:</div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="uterine-mid" name="uterine-position" value="mid" />
                <Label className="text-sm">mid</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="uterine-anteflexed" name="uterine-position" value="anteflexed" />
                <Label className="text-sm">anteflexed</Label>
              </div>
              <div className="flex items-center space-x-1">
                <input type="radio" id="uterine-retroflexed" name="uterine-position" value="retroflexed" />
                <Label className="text-sm">retroflexed</Label>
              </div>
              <div className="flex items-center mt-1">
                <Label className="text-sm">uterine depth:</Label>
                <InputLine value="" className="w-16 ml-1 inline-block" />
                <span className="text-sm ml-1">cm</span>
              </div>
            </div>
          </div>
        </div>

          </div>
          <div className="grid grid-cols-2">



        <div className="border border-black p-2">
            <div className="font-bold">III. RISKS FOR SEXUALITY TRANSMITTED INFECTIONS</div>
            <div className="text-sm mb-2">Does the client or the client's partner have any of the following?</div>

            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <span className="mr-2">■</span>
                <Label className="text-sm">abnormal discharge from the genital area</Label>
              </div>
              <YesNoRadio name="abnormal-discharge" />
            </div>

            <div className="ml-4 mb-2">
              <Label className="text-sm italic">if "YES" please indicate if from:</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <input type="checkbox" id="vagina-discharge" />
                  <Label className="text-sm">Vagina</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <input type="checkbox" id="penis-discharge" />
                  <Label className="text-sm">Penis</Label>
                </div>
              </div>
            </div>

            {[
              "sores or ulcers in the genital area",
              "pain or burning sensation in the genital area",
              "history or treatment for sexually transmitted infections",
              "HIV / AIDS / Pelvic inflammatory disease",
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className="mr-2">■</span>
                  <Label className="text-sm">{item}</Label>
                </div>
                <YesNoRadio name={`sti-${index}`} />
              </div>
            ))}
         <div className="p-2 mt-6 text-[13px] text-center border-t border-black">
          <p>
            Implant = Progestin subdermal implant; IUD = Intrauterine device; BTL = Bilateral tubal ligation; NSV =
            No-scalpel vasectomy; COC = Combined oral contraceptives; POP = Progestin only pills; CMM = Cervical mucus
            method; SDM = Standard days method; BBT = Basal body temperature; BOM = Billings ovulation method; CMM
            =Cervical mucus method; STM = Symptothermal method
          </p>
        </div>
          </div>
          

          <div className="p-4 border border-black">
  <div className="font-bold">ACKNOWLEDGEMENT:</div>
  <p className="mt-2 text-md ">
    This is to certify that the Physician/Nurse/Midwife of the clinic has fully
    explained to me the different methods available in family planning and I
    freely choose the <InputLine className="w-48 mx-1" value={""} /><p> method. </p>
    
  </p>

  <div className="flex justify-between mt-6 mb-6">
    <div className="text-center">
      <InputLine className="w-48" value={""} />
      <div>Client Signature</div>
    </div>
    <div className="text-center">
      <InputLine className="w-48" value={""} />
      <div>Date</div>
    </div>
  </div>
  
  <div>
    <p>For WEA below 18 yrs. Old:</p>
    <p className="mt-1 flex">
      I hereby consent <InputLine className="w-48 mx-1" value={""} /> to accept the Family Planning
      method.
    </p>
  </div>

  <div className="flex justify-between mt-6">
    <div className="text-center">
      <InputLine className="w-48" value={""} />
      <div>Parent/Guardian Signature</div>
    </div>
    <div className="text-center">
      <InputLine className="w-48" value={""} />
      <div>Date</div>
    </div>
  </div>
</div>

   

</div>
</div>
      {/* Navigation Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <Link to="/FamilyPlanning_view2">
        <Button>Next</Button>
        </Link>
      </div>
    </div>
  )
}

export default FamilyPlanningView







