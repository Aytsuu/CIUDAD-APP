import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";

function IncomeandExpenseTracking() {
    const [selectedFromDate, setSelectedFromDate] = useState("");
    const [selectedToDate, setSelectedToDate] = useState("");
    const [selectedEntry, setSelectedEntry] = useState("");

    const endDate = new Date().toISOString().split('T')[0];

    const entrytype = [
        { id: "0", name: "Income" },
        { id: "1", name: "Expense" }
    ];

    const columns: ColumnDef<any>[] = [
        { accessorKey: "serialNo", header: "Serial No." },
        { accessorKey: "date", header: "Date" },
        { accessorKey: "particulars", header: "Particulars" },
        { accessorKey: "amount", header: "Amount" },
        { accessorKey: "receiver", header: "Receiver" },
        { accessorKey: "receipt", header: "Receipt" },
        { accessorKey: "addNotes", header: "Additional Notes" }
    ];

    const data = [
        {
            serialNo: 12345,
            date: 'MM/DD/YYYY',
            particulars: 'Particulars',
            amount: 0.00,
            receiver: 'Receiver',
            receipt: 'Receipt',
            addNotes: 'Additional Notes'
        }
    ];

    return (
        <div className="mx-4 mb-4 mt-10">
            {/* Button and Date Filters */}
            <div className="mb-[1rem] flex flex-col items-end gap-2">
                <DialogLayout
                    trigger={<Button className="bg-green">+ New Entry</Button>}
                    className="max-w-md"
                    title="Add New Entry"
                    description="Fill in the details for your entry."
                    mainContent={
                        <div>
                            <Label className="block text-sm font-medium mt-[20px] mb-[5px]">Serial No.</Label>
                            <Input type="number" />

                            <Label className="block text-sm font-medium mt-[20px] mb-[5px]">Type of Entry</Label>
                            <SelectLayout className="w-full" label="" placeholder="Entry Type" options={entrytype} value={selectedEntry} onChange={setSelectedEntry} />

                            <Label className="block text-sm font-medium mt-[20px] mb-[5px]">Particulars</Label>
                            <Input type="text" />

                            <Label className="block text-sm font-medium mt-[20px] mb-[5px]">Amount</Label>
                            <Input type="number" />

                            <Label className="block text-sm font-medium mt-[20px] mb-[5px]">Receiver</Label>
                            <Input type="text" />

                            <Label className="block text-sm font-medium mt-[20px] mb-[5px]">Additional Notes</Label>
                            <textarea className="w-full border border-gray-300 p-2 rounded-md"></textarea>

                            <button className="bg-tealBlue text-white px-4 py-2 rounded-md hover:bg-darkTeal mt-4">Save Entry</button>
                        </div>
                    }
                />
                <div className="flex gap-5">
                    <div className="flex gap-3">
                        From: <Input type="date" className="border border-tealBlue border-[2px] rounded-md p-2" value={selectedFromDate} onChange={(e) => setSelectedFromDate(e.target.value)} max={endDate} />
                    </div>
                    <div className="flex gap-3">
                        To: <Input type="date" className="border border-tealBlue border-[2px] rounded-md p-2" value={selectedToDate} onChange={(e) => setSelectedToDate(e.target.value)} min={selectedFromDate} max={endDate} />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white border border-gray-300 rounded-[5px] p-5">
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    );
}

export default IncomeandExpenseTracking;
