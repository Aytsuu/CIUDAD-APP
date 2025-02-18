// Prenatal Viewing Form

// list of variables
// interface PrenatalViewProps{
//     data: {

//     }
// }

export default function PrenatalViewing() {
    return (
        <div className="max-w-5xl mx-auto p-4 border border-gray-300">
            {/* upper text of header and header */}
            <div>
                <p className="text-sm"> CEBU CITY HEALTH DEPARTMENT <br /> 2020 </p>
                <h4 className="text-center"> <b>MATERNAL HEALTH RECORD</b> </h4>
            </div>

            {/* personal information */}
            <div className="flex flex-col">
                <div className="flex pb-2"> {/*family no. div */}
                    <p>FAMILY NO:</p>
                    <input 
                        className="border-b border-black pl-1" 
                        type="number" 
                        name="family-no" 
                        id="family-no" 
                    />
                </div>
                <div className="flex">
                    <p>NAME: </p>
                    <input 
                        className="border-b border-black pl-1 pr-1 mr-2 w-[500px]" 
                        type="text" 
                        name="mother-name" 
                        id="mother-name" 
                    />

                    <p>AGE: </p>
                    <input  type="text" name="" id="" />
                </div>
            </div>
        </div>
    )
}