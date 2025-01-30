import BlotterTable from "./blotter-table";
import NewComplaintDialog from "./new-complaint-dialog";

export function BlotterRecord(){
    return(

        <div className="w-full h-[100vh] bg-snow flex flex-col justify-center items-center">
            <div className="w-[80%] h-2/3 bg-white border border-gray rounded-[10px] p-5 flex flex-col gap-3">
                <div className="w-full flex flex-row justify-end">
                    <NewComplaintDialog/>
                </div>
                <BlotterTable/>
            </div>
        </div>

    );
}