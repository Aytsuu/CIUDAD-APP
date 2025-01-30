import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/datepicker";
import { Textarea } from "@/components/ui/textarea";

export default function BlotterDetails(){
    return(
        <div className="w-full h-[100vh] bg-snow flex flex-col justify-center items-center">
            <div className="w-2/3 h-2/3 bg-white border border-gray rounded-[10px] p-5 flex flex-col gap-10">

                {/* Accused's Details */}

                <div className="w-full flex flex-row gap-10">
                    <Label className="w-[10%]">Accused:</Label>
                    <div className="flex flex-row gap-3"> 
                        
                        <div>
                            <Label>Name</Label>
                            <Input type="text"/>
                        </div>
                        <div>
                            <Label>Address</Label>
                            <Input type="text"/>
                        </div>
                    </div>
                </div>

                {/* Complainant's Details */}

                <div className="w-full flex flex-row gap-10">
                    <Label className="w-[10%]">Complainant:</Label>
                    <div className="w-full flex flex-row gap-3"> 
                        <div className="flex flex-col gap-3">
                            <div>
                                <Label>Name</Label>
                                <Input type="text"/>
                            </div>
                            <div>
                                <Label>Address</Label>
                                <Input type="text"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label>Date</Label>
                                <DatePicker/>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Allegation */}

                <div className="w-full flex flex-col gap-3">
                    <Label>Allegation:</Label>
                    <Textarea placeholder="Please enter your allegations."/>
                </div>
            </div>
        </div>
    );
}