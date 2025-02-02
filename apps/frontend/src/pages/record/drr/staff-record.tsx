import TableLayout from "@/components/ui/table/table-layout";

const header = [
    {head: "Last Name"}, {head: "First Name"}, {head: "M.I"}, {head: "Suffix"},
    {head: "Date of Birth"}, {head: "Contact"}, {head: "Date Assigned"}, {head: "Action"}
]

const body = [
    {cell: "Lorem"}, {cell: "Lorem"}, {cell: "Lorem"}, {cell: "Lorem"},
    {cell: "Lorem"}, {cell: "Lorem"}, {cell: "Lorem"}, {cell: ""},
]

export default function StaffRecord(){
    return(
        <div className="w-full h-[100vh] bg-snow flex justify-center items-center">
            <div className="w-[80%] h-4/5 bg-white border border-gray rounded-[5px] p-5">
                <TableLayout header={header} body={body} />
            </div>
        </div>
    );
}