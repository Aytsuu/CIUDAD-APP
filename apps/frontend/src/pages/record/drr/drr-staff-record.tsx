import TableLayout from "@/components/ui/table/table-layout";

const header = [
    "Last Name", 
    "First Name", 
    "M.I", 
    "Suffix",
    "Date of Birth", 
    "Contact", 
    "Date Assigned", 
    "Action"
]

const rows = [
    [
        "Lorem", 
        "Lorem", 
        "Lorem", 
        "Lorem",
        "Lorem", 
        "Lorem", 
        "Lorem", 
        "",
    ]
]

export default function DRRStaffRecord(){
    return(
        <div className="w-screen h-screen bg-snow flex justify-center items-center">
            <div className="w-[80%] h-4/5 bg-white border border-gray rounded-[5px] p-5">
                <TableLayout header={header} rows={rows} />
            </div>
        </div>
    );
}