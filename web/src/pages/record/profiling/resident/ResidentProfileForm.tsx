import { Card } from "@/components/ui/card/card";
import PersonalInfoForm from "./PersonalInfoForm";
import { BsChevronLeft } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function ResidentProfileForm() {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex gap-2 justify-between pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Header - Stacks vertically on mobile */}
          <Button 
            className="text-black p-2 self-start"
            variant={"outline"}
            onClick={() => navigate(-1)}
          >
            <BsChevronLeft />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Registration Form
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Provide your details to complete the registration process.
            </p>
          </div>  
        </div>
      </div>

      <hr className="border-gray mb-6 sm:mb-8" />

      <div>
        <Card className="w-full border-none shadow-none rounded-b-lg rounded-t-none">
            <PersonalInfoForm/>
        </Card>
      </div>
    </>
  );
}
