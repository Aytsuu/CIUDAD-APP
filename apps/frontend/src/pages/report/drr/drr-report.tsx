import ReportTable from "./report-table"

export default function DrrReport(){
    
    return (
        <div className="w-full h-[100vh] bg-snow flex justify-center items-center">
            <div className="w-[80%] h-2/3 bg-white border border-gray rounded-[5px] p-5">
                <ReportTable/>
            </div>
        </div>

    )

}