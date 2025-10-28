
export default function ComplaintList () {
    return (
           <div className="w-full h-full flex flex-col">
             <div className="flex flex-col justify-center mb-4">
               <h1 className="flex flex-row font-semibold text-xl sm:text-2xl text-darkBlue2 items-center">
                Blotter Record
               </h1>
               <p className="text-xs sm:text-sm text-darkGray">
                View documented incidents and their corresponding actions.
               </p>
             </div>
             <hr className="pb-4" />
           </div>
    )
}