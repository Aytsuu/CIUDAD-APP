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

          <div className="md:col-span-2">
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
          <div className="border border-black p-4">
            {Header.map((field, index) => (
              <div className="flex items-center mb-2" key={index}>
                <Label className="text-sm font-bold whitespace-nowrap mr-2">
                  {field.name}
                </Label>
                <div className="flex-grow">
                  <InputLine className={field.className} value={field.value} />
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
        <div className="grid grid-cols-12 gap-4">
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
              <Label className="text-sm font-bold whitespace-nowrap">PLAN TO HAVE MORE CHILDREN?</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Checkbox id="plan-more-yes" disabled />
                  <Label htmlFor="plan-more-yes" className="text-sm">Yes</Label>
                </div>
                <div className="flex items-center gap-1">
                  <Checkbox id="plan-more-no" disabled/>
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
    
    
    </div>


  );
};

export default FamilyPlanningView;