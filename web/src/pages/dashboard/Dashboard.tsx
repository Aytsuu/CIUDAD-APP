import api from "@/api/api";
import React from "react";

export default function Dashboard(){

    const [data, setData] = React.useState(null);
    const hasFetchData = React.useRef(false);    

    React.useEffect(()=>{
        if(!hasFetchData.current){
            getData();
            hasFetchData.current = true
        }
    }, [])

    const getData = React.useCallback(()=>{
        api
            .get("profiling/personal/")
            .then((res)=>res.data)
            .then((data)=> {
                setData(data)
            })
            .catch((error)=>alert(error))
        }, [])

    console.log(data)

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header Section */}
            <div className="flex flex-col justify-center mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                Overview of key metrics, data, and insights
                </p>
            </div>

            <hr className="border-gray mb-6 sm:mb-8" />
        </div>
    )
}
