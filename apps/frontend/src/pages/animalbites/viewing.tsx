
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


const Viewing = () => {
    return (
        <div>



            <div className='grid grid-cols-2 gap-2 p-10 sm:grid-cols-2 shadow-md'>
                <div>
                    <Label className='block text-sm font-medium text-gray-700'>To:</Label>
                    <Input
                        type="text"
                        className="mt-1 rounded-lg border-gray-500 p-4 text-sm shadow-sm"
                    />
                </div>

                <div>
                    <Label className='block text-sm font-medium text-gray-700'>Date:</Label>
                    <Input
                        type="date"
                        className="mt-1 rounded-lg border-gray-500 p-4 text-sm shadow-sm"
                    />
                </div>
                <div>
                    <Label className='block text-sm font-medium text-gray-700'>From:</Label>
                    <Input
                        type="text"
                        className="mt-1 rounded-lg border-gray-500 p-4 text-sm shadow-sm"
                    />
                </div>
            </div>



            <div className="w-full p-10 shadow-md">
                <div>
                    <p className="mb-3 font-semibold text-gray-900">Respectfully Referring</p>

                    <Label className="mt-5 text-sm text-gray-900">Name:</Label>

                    {/* Grid for horizontal layout */}
                    <div className="grid grid-cols-3 gap-3 mt-2">
                        <Input
                            type="text"
                            placeholder="Last Name"
                            className="rounded-lg border-gray-500 shadow-sm p-4"
                        />
                        <Input
                            type="text"
                            placeholder="First Name"
                            className="rounded-lg border-gray-500 shadow-sm p-4"
                        />
                        <Input
                            type="text"
                            placeholder="Middle Name"
                            className="rounded-lg border-gray-500 shadow-sm p-4"
                        />

                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">

                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">
                                Address: <span className="font-normal text-gray-500">(House No., Street, Purok/Sitio, Barangay)</span>
                            </Label>
                            <Input
                                type="text"
                                className="w-full rounded-lg border-gray-500 shadow-sm p-3"
                            />
                        </div>

                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">Age:</Label>
                            <Input
                                type="number"
                                min={1}
                                className="w-full rounded-lg border-gray-500 shadow-sm p-3"
                            />
                        </div>

                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">
                                Exposure: <span className="font-normal text-gray-500">(Bite or Non-bite)</span>
                            </Label>

                            <select className="mt-1 w-full h-10 rounded-lg border-gray-900 p-2 text-sm shadow-sm" >
                            <DropdownMenu>
                            <option value="Bite">Bite</option>
                            <option value="Non-Bite">Non-Bite</option>
                            </DropdownMenu>
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">
                                Site of Exposure:
                            </Label>
                            <Input
                                type="text"
                                className="w-full rounded-lg border-gray-500 shadow-sm p-3"
                            />
                        </div>

                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">
                                Biting Animal:
                            </Label>
                            <Input
                                type="text"
                                className="w-full rounded-lg border-gray-500 shadow-sm p-3"
                            />
                        </div>

                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">
                                Laboratory Exam (if any):
                            </Label>
                            <Input
                                type="text"
                                className="w-full rounded-lg border-gray-500 shadow-sm p-3"
                            />
                        </div>

                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">
                                Actions Desired:
                            </Label>
                            <Textarea className="className=w-full rounded-lg border-gray-500 shadow-sm p-3" placeholder="Described the required actions">
                            </Textarea>
                            
                        </div>

                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">
                                Referred by:
                            </Label>
                            <Input
                                type="text"
                                className="w-full rounded-lg border-gray-500 shadow-sm p-3"
                            />
                        </div>


                        
                    </div>
                </div>
            </div>

        </div>
    )

}

export default Viewing;

