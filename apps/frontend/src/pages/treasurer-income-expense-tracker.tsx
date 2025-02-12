import { useState } from "react";
import TableLayout from "@/components/ui/table/table-layout";
import { Input } from "@/components/ui/input";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";

function IncomeandExpenseTracking(){
    const [selectedFromDate, setSelectedFromDate] = useState("");
    const [selectedToDate, setSelectedToDate] = useState("");
    const [selectedEntry, setSelectedEntry] = useState("")

    const endDate = new Date().toISOString().split('T')[0];

    const styles = {
        header: "text-white text-15px font-bold px-1 flex text-center",
        row: "bg-gray p-[1rem] flex justify-between",
        column: "px-1 flex text-center",
        biggerCol: "flex text-center w-[150px]",
        biggerHeader: "text-white text-15px font-bold w-[150px] flex text-center",
        inputLabel: "block text-sm font-medium mt-[20px] mb-[5px]"
    }

    let rowVal = {
        serialNo: 12345,
        date: 'MM/DD/YYYY',
        particulars: 'Particulars',
        amount: 0.00,
        receiver: 'Receiver',
        receipt: 'Receipt',
        addNotes: 'Additional Notes'
    }

    const entrytype = [
        {id: "0", name: "Income"},
        {id: "1", name: "Expense"}
    ];


    const createRow = (
        <div className={styles.row}>
            {Object.values(rowVal).map((value, idx) => 
            (<div key={idx}className={idx === 2 || idx == 6  ? styles.biggerCol : styles.column}>{value}</div>)
            )}
        </div>
    );

    const headerProp = [
        <div className="bg-tealBlue py-2 flex justify-between px-4">
            {["Serial No.", "Date", "Particulars", "Amount", "Receiver", "Receipt", "Additional Notes"].map(
                (text, idx) => (<div key={idx} className={idx === 2 || idx === 6 ? styles.biggerHeader : styles.header}>{text}</div>)
            )}
        </div>
    ];

    const rowsProp = [[createRow]];

    return(
        <div className="mx-4 mb-4 mt-10">
        {/* Button and Date Filters */}
        <div className="mb-[1rem] flex flex-col items-end gap-2">
            <DialogLayout
                trigger={
                    <button className="rounded-md bg-green text-white font-semibold text-[13px] p-[0.7rem]">+ New Entry</button>}
                className="max-w-md" title="Add New Entry" description="Fill in the details for your entry."
                mainContent={
                    <div>
                        {/* Example Input Fields */}
                        <label className={styles.inputLabel}>Serial No.</label>
                        <Input type="number"/>

                        <label className={styles.inputLabel}>Type of Entry</label>
                        <SelectLayout className="w-full" label="" placeholder="Select Entry Type" options={entrytype} value={selectedEntry} onChange={setSelectedEntry}/>


                        <label className={styles.inputLabel}>Particulars</label>
                        <Input type="text"/>

                        <label className={styles.inputLabel}>Amount</label>
                        <Input type="number"/>

                        <label className={styles.inputLabel}>Receiver</label>
                        <Input type="text" />

                        <label className={styles.inputLabel}>Additional Notes</label>
                        <textarea className="w-full border border-gray-300 p-2 rounded-md"></textarea>

                        <button className="bg-tealBlue">Save Entry</button>
                    </div>
                }
            />
            <div className="flex gap-5">
                <div className="flex gap-3">
                    From: <Input type="date" className="border border-tealBlue border-[2px] rounded-md p-2" value={selectedFromDate} onChange={(e) => setSelectedFromDate(e.target.value)} max={endDate} />
                </div>
                <div className="flex gap-3"> 
                    To: <Input type="date" className="border border-tealBlue border-[2px] rounded-md p-2" value={selectedToDate} onChange={(e) => setSelectedToDate(e.target.value)}  min={selectedFromDate} max={endDate} />
                </div>
            </div>
        </div>

        {/* Table Section */}
        <div className="bg-white border border-gray rounded-[5px] p-5">
            <TableLayout header={headerProp} rows={rowsProp} />
        </div>
    </div>
    )
}
export default IncomeandExpenseTracking