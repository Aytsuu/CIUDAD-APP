import { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Viewing = () => {
    const pdfRef = useRef<HTMLDivElement>(null);

    const generatePDF = async () => {
        if (!pdfRef.current) return;

        const canvas = await html2canvas(pdfRef.current);
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        
        // Instead of saving, open in a new tab
        window.open(pdf.output("bloburl"), "_blank");
    };

    return (
        <div>
            <button
                onClick={generatePDF}
                className="m-4 px-6 py-2 bg-blue-500 bg-green-600 text-white rounded-lg shadow-md hover:bg-blue-700"
            >
                Generate PDF
            </button>

            <div ref={pdfRef} className="p-10 shadow-md bg-white">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                    <div>
                        <Label className="block text- font-medium text-gray-700">To:</Label>
                        <Input type="text" className="mt-1 rounded-lg border-gray-500 p-4 text-sm shadow-sm" />
                    </div>
                    <div>
                        <Label className="block text-sm font-medium text-gray-700">Date:</Label>
                        <Input type="date" className="mt-1 rounded-lg border-gray-500 p-4 text-sm shadow-sm" />
                    </div>
                    <div>
                        <Label className="block text-sm font-medium text-gray-700">From:</Label>
                        <Input type="text" className="mt-1 rounded-lg border-gray-500 p-4 text-sm shadow-sm" />
                    </div>
                </div>

                <div className="w-fullp">
                    <br></br>
                    <p className="mb-3 font-semibold text-gray-900">Respectfully Referring</p>

                    <Label className="mt-5 text-sm text-gray-900">Name:</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                        <Input type="text" placeholder="Last Name" className="rounded-lg border-gray-500 shadow-sm p-4" />
                        <Input type="text" placeholder="First Name" className="rounded-lg border-gray-500 shadow-sm p-4" />
                        <Input type="text"  placeholder="Middle Name" className="rounded-lg border-gray-500 shadow-sm p-4" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">Address:</Label>
                            <Input type="text" className="w-full rounded-lg border-gray-500 shadow-sm p-3" />
                        </div>
                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">Age:</Label>
                            <Input type="number" min={1} className="w-full rounded-lg border-gray-500 shadow-sm p-3" />
                        </div>
                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">Exposure:</Label>
                            <select className="mt-1 w-full h-10 rounded-lg border-gray-900 p-2 text-sm shadow-sm" >
                                <option value="Bite">Bite</option>
                                <option value="Non-Bite">Non-Bite</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">Site of Exposure:</Label>
                            <Input type="text"  className="w-full rounded-lg border-gray-500 shadow-sm p-3" />
                        </div>
                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">Biting Animal:</Label>
                            <Input type="text" className="w-full rounded-lg border-gray-500 shadow-sm p-3" />
                        </div>
                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">Laboratory Exam (if any):</Label>
                            <Input type="text" className="w-full rounded-lg border-gray-500 shadow-sm p-3" />
                        </div>
                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">Actions Desired:</Label>
                            <Textarea className="w-full rounded-lg border-gray-500 shadow-sm p-3" placeholder="Describe the required actions" />
                        </div>
                        <div className="flex flex-col">
                            <Label className="text-sm font-semibold text-gray-900">Referred by:</Label>
                            <Input type="text" className="w-full rounded-lg border-gray-500 shadow-sm p-3" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Viewing;