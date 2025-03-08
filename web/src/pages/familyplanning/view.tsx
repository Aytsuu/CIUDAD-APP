import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

const ClientType = [
  { name: "New Acceptor", value: "", classname: "w-12" },
  { name: "Current User", value: "", classname: "w-12" },
];

const CurrentUserType = [
  { name: "Changing Method", value: "", classname: "w-12" },
  { name: "Changing Clinic", value: "", classname: "w-12" },
  { name: "Dropout/Restart", value: "", classname: "w-12" }
];

const ReasonFP = [
  { name: "spacing", value: "", classname: "w-12" },
  { name: "limiting", value: "", classname: "w-12" },
  { name: "others", value: "", classname: "w-12" }
];

const Reason = [
  { name: "medical condition", value: "", classname: "w-12" },
  { name: "side-effects", value: "", classname: "w-12" },
];

const MethodsCurrentlyUsed = [
  { name: "COC", value: "", classname: "w-12" },
  { name: "IUD", value: "", classname: "w-12" },
  { name: "BOM/CMM", value: "", classname: "w-12" },
  { name: "LAM", value: "", classname: "w-12" },
  { name: "POP", value: "", classname: "w-12" },
  { name: "Interval", value: "", classname: "w-12" },
  { name: "BBT", value: "", classname: "w-12" },
  { name: "Others", value: "", classname: "w-12" },
  { name: "Injectable", value: "", classname: "w-12" },
  { name: "Post Partum", value: "", classname: "w-12" },
  { name: "STM", value: "", classname: "w-12" },
  { name: "Implant", value: "", classname: "w-12" },
  { name: "Condom", value: "", classname: "w-12" },
  { name: "SDM", value: "", classname: "w-12" }
];

// Medical History questions
const MedicalHistoryQuestions = [
  { name: "severe headaches / migraine", value: "" },
  { name: "history of stroke / heart attack / hypertension", value: "" },
  { name: "non-traumatic hematoma / frequent bruising or gum bleeding", value: "" },
  { name: "current or history of breast cancer / breast mass", value: "" },
  { name: "severe chest pain", value: "" },
  { name: "cough for more than 14 days", value: "" },
  { name: "jaundice", value: "" },
  { name: "unexplained vaginal bleeding", value: "" },
  { name: "abnormal vaginal discharge", value: "" },
  { name: "intake of phenobarbital (anti-seizure) or rifampicin (anti-TB)", value: "" },
  { name: "Is this client a SMOKER?", value: "" },
  { name: "With Disability?", value: "" }
];

// VAW Risk Assessment items
const VAWRiskItems = [
  { name: "unpleasant relationship with partner", value: "" },
  { name: "partner does not approved of the visit to FP clinic", value: "" },
  { name: "history of domestic violence or VAW", value: "" }
];

// Referral options
const ReferralOptions = [
  { name: "DSWD", value: "" },
  { name: "WCPU", value: "" },
  { name: "NGOs", value: "" },
  { name: "Others", value: "", hasSpecify: true }
];
const Obstetrical = [
  { name: "G", value: "" },
  { name: "P", value: "" },
  { name: "Full term", value: "" },
  { name: "Abortion", value: ""},
  { name: "Premature", value: "" },
  { name: "Living Children", value: ""},
];


interface InputLineProps {
  className?: string;
  value: string;
}

const InputLine: React.FC<InputLineProps> = ({ className, value }) => (
  <Input
    className={cn("border-0 border-b border-black rounded-none w-full px-2 py-1", className)}
    readOnly
    value={value}
  />
);

const FamilyPlanningView: React.FC = () => {
  return (
    <div className="mx-auto p-4 border border-gray-300 bg-white shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-bold">SIDE A</div>
        <div className="text-center font-bold text-base md:text-lg">
          FAMILY PLANNING (FP) FORM 1
        </div>
        <div className="text-sm font-bold">ver 3.0</div>
      </div>

      {/* Main Content */}
      <div className="border border-black p-4">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

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
          <div className="border flex-grow border-black p-4 bg-gray overflow-hidden">
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
            <div className="flex flex-col space-y-2">
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

        <div className="flex items-start ">
          <Label className="font-bold whitespace-nowrap">NAME OF CLIENT:</Label>
          <div className="flex-1">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-5 space-y-1">
                <InputLine value="" />
                <Label className="text-xs text-center block">Last Name</Label>
              </div>


              <div className="col-span-5 space-y-1">
                <InputLine value="" />
                <Label className="text-xs text-center block">Given Name</Label>
              </div>
              <div className="col-span-2 space-y-1">
                <InputLine value="" />
                <Label className="text-xs text-center block">MI</Label>
              </div>
            </div>
          </div>
          {/* Demographics Row */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Date of Birth</Label>
            </div>
            <div className="col-span-1 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Age</Label>
            </div>
            <div className="col-span-3 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Educ. Attain.</Label>
            </div>
            <div className="col-span-5 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Occupation</Label>
            </div>
          </div>
        </div>
        {/* Address Section */}
        <div className="flex items-start gap-2 mt-6">
          <Label className="font-bold whitespace-nowrap">ADDRESS:</Label>
          <br></br>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-1 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">No.</Label>
            </div>
            <div className="col-span-2 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Street</Label>
            </div>
            <div className="col-span-2 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Barangay</Label>
            </div>
            <div className="col-span-3 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Municipality/City</Label>
            </div>
            <div className="col-span-2 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Province</Label>
            </div>
            <div className="col-span-2 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Contact Number</Label>
            </div>
          </div>

          {/* Additional Info Row */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Civil Status</Label>
            </div>
            <div className="col-span-6 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Religion</Label>
            </div>
          </div>
        </div>

        {/* Spouse Section */}
        <div className="flex items-start gap-2 mt-6">
          <Label className="font-bold block mb-2">NAME OF SPOUSE:</Label>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Last Name</Label>
            </div>
            <div className="col-span-4 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">Given Name</Label>
            </div>
            <div className="col-span-1 space-y-1">
              <InputLine value="" />
              <Label className="text-xs text-center block">MI</Label>
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
        <div className="grid grid-cols-12 gap-4 mt-5">
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
      <div className="border border-black grid p-4 ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap">
          {/* Left side - Type of Client */}
          <div>
            <div className="font-bold text-md mb-4 grid">Type of Client</div>
            <div className="space-y-2">
              {ClientType.map((field, index) => (
                <div className="flex items-center grid-col" key={index}>
                  <Checkbox checked={field.value === "Yes"} disabled className="mr-2" />
                  <Label className="text-sm whitespace-nowrap">{field.name}</Label>
                  
                </div>
              ))}
               <div className="mt-4">
              <div className="font-bold text-md mb-2 grid grid-cols-4">Reason for FP:</div>
              <div className="flex flex-wrap gap-4">
                {ReasonFP.map((field, index) => (
                  <div className="flex items-center" key={index}>
                    <Checkbox checked={field.value === "Yes"} disabled className="mr-2" />
                    <Label className="text-sm whitespace-nowrap">{field.name}</Label>
                    {field.name === "others" && 
                      <div className="ml-2 w-32">
                        <InputLine value="" />
                      </div>
                    }
                  </div>
                ))}
              </div>
            </div>
            
              
              
              <div className="ml-6 space-y-2">
                {CurrentUserType.map((field, index) => (
                  <div className="flex items-center" key={index}>
                    <Checkbox checked={field.value === "Yes"} disabled className="mr-2" />
                    <Label className="text-sm whitespace-nowrap">{field.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            
           
            <div className="mt-4">
              <div className="flex items-center">
                <Label className="text-sm font-bold whitespace-nowrap mr-2">Reason:</Label>
                <div className="flex flex-wrap gap-4">
                  {Reason.map((field, index) => (
                    <div className="flex items-center" key={index}>
                      <Checkbox checked={field.value === "Yes"} disabled className="mr-2" />
                      <Label className="text-sm whitespace-nowrap">{field.name}</Label>
                    </div>
                  ))}
                  <div className="ml-2 w-32">
                    <InputLine value="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Method currently used */}
          <div>
            <div className="font-bold text-md mb-4">Method currently used (for Changing Method):</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {MethodsCurrentlyUsed.map((field, index) => (
                <div className="flex items-center grid-col" key={index}>
                  <Checkbox checked={field.value === "Yes"} disabled className="mr-2" />
                  <Label className="text-sm whitespace-nowrap">{field.name}</Label>
                  
                </div>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* Medical History and VAW Risk Assessment Section */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* I. MEDICAL HISTORY */}
        <div className="border border-black">
          {/* Header */}
          <div className="bg-gray-100 border-b border-black p-2">
            <Label className="font-bold">I. MEDICAL HISTORY</Label>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <div className="mb-2">
              <Label className="text-sm">Does the client have any of the following?</Label>
            </div>
            
            <div className="space-y-1">
              {MedicalHistoryQuestions.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-2">■</div>
                    <Label className="text-sm">{item.name}</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Checkbox id={`med-yes-${index}`} disabled />
                      <Label htmlFor={`med-yes-${index}`} className="text-sm">Yes</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <Checkbox id={`med-no-${index}`} disabled />
                      <Label htmlFor={`med-no-${index}`} className="text-sm">No</Label>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Special case for "With Disability?" */}
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex">
                    <Label className="text-sm ml-4">If YES please specify:</Label>
                  </div>
                  <div className="mt-1 ml-4">
                    <InputLine value="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* IV. RISKS FOR VIOLENCE AGAINST WOMEN (VAW) */}
        <div className="border border-black">
          {/* Header */}
          <div className="bg-gray-100 border-b border-black p-2">
            <Label className="font-bold">IV. RISKS FOR VIOLENCE AGAINST WOMEN (VAW)</Label>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <div className="space-y-1">
              {VAWRiskItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-2">■</div>
                    <Label className="text-sm">{item.name}</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Checkbox id={`vaw-yes-${index}`} disabled />
                      <Label htmlFor={`vaw-yes-${index}`} className="text-sm">Yes</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <Checkbox id={`vaw-no-${index}`} disabled />
                      <Label htmlFor={`vaw-no-${index}`} className="text-sm">No</Label>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Referred to section */}
              <div className="mt-4">
                <div className="flex items-center">
                  <div className="">
                  <Label className="text-sm font-bold  whitespace-nowrap ml-4 p-3 mr-4">Referred to:</Label>
                    {ReferralOptions.map((option, index) => (
                      <div key={index} className="p-2 flex items-center ">
                        <Checkbox id={`referral-${index}`} disabled className="mr-1" />
                        <Label htmlFor={`referral-${index}`} className="text-sm">{option.name}</Label>
                        {option.hasSpecify && (
                          <div className="ml-2 flex-1">
                            <InputLine value="" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
       
       <div className="border border-black">
        {/* Header */}
        <div className="bg-gray-100 border-b border-black p-2">
          <Label className="font-bold">II. OBSTETRICAL HISTORY</Label>
        </div>
        
        {/* Content */}
        <div className="p-4">
        <Label>Number of pregnancies:</Label> G: <InputLine value="" />
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column */}
            <div>
              <div className="flex items-center mb-2">
                <Label className="text-sm whitespace-nowrap mr-2">Full term</Label>
                <div className="border-b border-black flex-1"></div>
                </div>
              
              <div className="flex items-center mb-4">
                <Label className="text-sm whitespace-nowrap mr-2">Abortion</Label>
                <div className="border-b border-black flex-1"></div>
              </div>
            </div>
          
            {/* Right Column */}
            <div>
              <div className="flex items-center mb-2">
                <Label className="text-sm whitespace-nowrap mr-2">Premature</Label>
                <div className="border-b border-black flex-1"></div>
              </div>
              
              <div className="flex items-center mb-4">
                <Label className="text-sm whitespace-nowrap mr-2">Living Children</Label>
                <div className="border-b border-black flex-1"></div>


              </div>


              <div className="flex items-center mb-2">
                
              <div className="ml-6 space-y-2">
                
              </div>
              
              <div className="mt-">
                  <Label>Menstrual Flow</Label>
                        <div className="ml-10">
                          {["Scanty", "Moderate", "Heavy"].map((flow) => (
                            <div key={flow} className="flex items-center space-x-2 mb-2">
                                <input
                                  type="radio"
                                  id={`flow-${flow.toLowerCase()}`}
                                  className="w-4 h-4"
                                />
                              <Label htmlFor={`flow-${flow.toLowerCase()}`}>
                                {flow} {flow === "Scanty" && "(1-2 pads per day)"}
                                {flow === "Moderate" && "(3-5 pads per day)"}
                                {flow === "Heavy" && "(more than 5 pads per day)"}
                              </Label>
                            </div>
                          ))}
                        </div>

                </div>
            
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default FamilyPlanningView;