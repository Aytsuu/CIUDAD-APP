import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";

function ClerkDonateDeleteConf() {

    return (
        <div>
        <Label className="block text-center text-[25px] font-medium text-[#263D67]">Are you sure you want to delete this entry?</Label><br></br>
        <div className="grid grid-cols-2 gap-5">
            <Button className="bg-[#263D67] hover:bg-[#394357] text-white px-4 py-2 rounded cursor-pointer"> Yes </Button>
            <Button className="bg-[#263D67] hover:bg-[#394357] text-white px-4 py-2 rounded cursor-pointer"> No </Button>
        </div>
        </div>
    );
  }
  
  export default ClerkDonateDeleteConf;