import { useEffect } from "react";
import { generateToken, messaging } from "@/firebase/firebase";
import { onMessage } from "firebase/messaging";

export default function Home(){
    useEffect(() => {
        generateToken();
        onMessage(messaging, (payload) => {
            console.log(payload);
        } )
    }, []);
    
    return (
        <div className='w-full flex flex-col items-center gap-10'>
            <div className="w-[90%] h-[40rem] flex">
                <img className="w-full h-full bg-gray"></img>
                <div className="w-1/2 grid">
                    <img className="w-full h-full bg-gray"></img>
                    <img className="w-full h-full bg-gray"></img>
                </div>
            </div>
            <div className="w-[90%] h-[10rem] bg-blue">

            </div>
        </div>
    );
}
