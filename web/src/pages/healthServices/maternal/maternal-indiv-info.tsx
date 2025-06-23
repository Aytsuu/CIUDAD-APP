// import Card from "@/components/ui/card/card-layout";
import { Card } from "@/components/ui/card/card";
import { Label } from "@/components/ui/label";

export default function MotherInfo() {
    return (
        <Card className="w-full flex flex-col h-32">
          <h3 className="mt-7 ml-5 text-[20px] font-semibold">Patient's Information</h3>
          <div className="w-full flex flex-col gap-3 ml-5 mt-[10px]">
            {/* Name, Age, Sex Row */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-20 w-full  justify-center items-center">
              <div className="flex gap-2 items-center">
                <Label className="font-medium ">Name:</Label>
                <span className="truncate">
                  Caballes, Katrina Shin Dayuja
                </span>
              </div>

              <div className="flex gap-2 items-center">
                <Label className="font-medium ">Age:</Label>
                <span>27</span>
              </div>

              <div className="flex gap-2 items-center">
                <Label className="font-medium ">Sex:</Label>
                <span>Female</span>
              </div>

              <div className="flex gap-2 w-full items-baseline">
              <Label className="font-medium ">Address:</Label>
              <span className="truncate">
                Bonsai Bolinawan, Carcar City, Cebu
              </span>
            </div>
          </div>

            {/* Address Row */}
            
          </div>
        </Card>
      // />
    );
  }