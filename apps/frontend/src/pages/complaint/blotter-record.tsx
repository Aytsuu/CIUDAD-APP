import BlotterTable from "./blotter-table";
import ComplaintDialog from "./complaint-dialog";
import dialogProps from "./props";


export default function BlotterRecord(){
    return(

        <div className="w-full h-[100vh] bg-snow flex flex-col justify-center items-center">
            <div className="w-[80%] h-2/3 bg-white border border-gray rounded-[5px] p-5 flex flex-col gap-3">
                <div className="w-full flex flex-row justify-end">
                    <ComplaintDialog 
                        trigger={dialogProps.addTrigger} 
                        action={dialogProps.addAction}
                        title={dialogProps.addTitle}
                        description={dialogProps.addDescription}
                    />
                </div>
                <BlotterTable/>
            </div>
        </div>

    );
}