import CardLayout from "@/components/ui/card/card-layout";
import { Label } from "@/components/ui/label";

export default function MotherInfo() {
    return (
        <CardLayout
        cardTitle="Patient Information"
        CardTitleClassName="text-blue text-xl"
        cardClassName="mb-8"
        cardContent={
          <div className="w-full flex flex-col gap-3 mt-[-10px]">
            {/* Name, Age, Sex Row */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-20 items-baseline">
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
            </div>

            {/* Address Row */}
            <div className="flex gap-2 w-full items-baseline">
              <Label className="font-medium ">Address:</Label>
              <span className="truncate">
                Bonsai Bolinawan, Carcar City, Cebu
              </span>
            </div>
          </div>
        }
      />
    );
  }