


// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { cn } from "@/lib/utils"
// import React from "react"

// const personalInfo = [
//     {
//         name: 'Family No.',
//         value: "",
//         className: "w-10"
//     },
//     {
//         name: 'Name',
//         value: "",
//         className: "w-10"
//     },
//     {
//         name: 'Age',
//         value: "",
//         className: "w-30"
//     }
// ]

// export default function Sample(){
//     return(
//         <div className="w-screen h-screen flex items-center justify-center">
//             <div className="w-1/2 h-1/2 flex">
//             {
//                 personalInfo.map((info) => (
//                     <React.Fragment>
//                         <Label>{info.name}</Label>
//                         <InputLine
//                             className={info.className}
//                         />
//                     </React.Fragment>
//                 ))
//             }
//             </div>
//         </div>
//     )
// }

// export const InputLine = ({className}: {className: string}) => (
//     <Input className={cn("w-1/2 border-0 border-b-4 border-black rounded-none", className)}  readOnly/>
// )