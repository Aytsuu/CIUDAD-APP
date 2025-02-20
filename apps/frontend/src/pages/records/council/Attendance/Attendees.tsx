// import { Label } from "@/components/ui/label";
// import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form";
// import { Checkbox } from "@/components/ui/checkbox";

// //Schema
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import MarkAttendeesSchema from "@/form-schema/mark-attendees";



// function Attendees(){

//     const form = useForm<z.infer<typeof MarkAttendeesSchema>>({
//         resolver: zodResolver(MarkAttendeesSchema),
//         defaultValues: {
//             atttendees: [],
//         },
//     });

//     function onSubmit(values: z.infer<typeof MarkAttendeesSchema>) {
//         // Do something with the form values.
//         // ✅ This will be type-safe and validated.
//         console.log(values)
//     }


//     return(
//         let atttendees = ["Katty Sheen", "Howdy Schema"].map(
//             (attend) =>
//                 <div className="w-full h-full">
//                     <div className="flex w-full h-[55px] bg-[#3D4C77] justify-center">
//                         <Form {...form}>
//                             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                                 <div>
//                                     <FormField
//                                         control={form.control}
//                                         name="atttendees"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                             <FormLabel>Event Title</FormLabel>
//                                             <FormControl>
//                                                 <Checkbox
//                                                     id="hasDisability"
//                                                     checked={!!field.value}
//                                                     onCheckedChange={(checked) => {
//                                                         field.onChange(checked);
//                                                     }}
//                                                 />
//                                             </FormControl>
//                                             <FormLabel>
//                                                 {attend}
//                                             </FormLabel>
//                                             </FormItem>
//                                         )}
//                                     />                            
//                                 </div>
//                             </form>
//                         </Form>
//                     </div>
//                 </div>                
//         );
       
//     )
// }
// export default Attendees;


// import { Label } from "@/components/ui/label";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";

// // Schema
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import MarkAttendeesSchema from "@/form-schema/mark-attendees";

// function Attendees() {
//     const form = useForm<z.infer<typeof MarkAttendeesSchema>>({
//         resolver: zodResolver(MarkAttendeesSchema),
//         defaultValues: {
//             attendees: [], // Default state is an empty array
//         },
//     });

//     function onSubmit(values: z.infer<typeof MarkAttendeesSchema>) {
//         console.log(values);
//     }

//     // Attendees list
//     let attendees = [
//         "HON.KATTY SHEEN WERDS", "HON.HOWDY SCHEMA ANDYSUS", 
//         "HON.HOWDY SCHEMA ANDYSUSASDWSDWADAWDASD", "HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUS", "HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUS", "HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUS", "HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUS" ,"HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUS" , "HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUSADADAADA", "HON.HOWDY SCHEMA ANDYSUSASDWSDWADAWDASD",
//         "HON.HOWDY SCHEMA ANDYSUS", "HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUS", "HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUS", "HON.HOWDY SCHEMA ANDYSUS",
//     ];

//     return (
//         <div className="w-full h-screen flex flex-col">
//             {/* Header */}
//             {/* <div className="flex w-full h-[45px] bg-[#263D67] justify-center items-center">
//                 <Label className="text-[15px] text-white">MARK ATTENDEES</Label>
//             </div> */}

//             {/* Form */}
//             <div className="p-4 flex-grow">
//                 <Form {...form}>
//                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                         <div className="grid grid-cols-2 gap-4 pt-3">
//                             {attendees.map((attendee, index) => (
//                                 <FormField
//                                     key={index}
//                                     control={form.control}
//                                     name="attendees"
//                                     render={({ field }) => {
//                                         const selectedAttendees = field.value ?? [];
//                                         return (
//                                             <FormItem className="flex flex-row items-start space-x-3 space-y-0.5">
//                                                 <FormControl>
//                                                     <Checkbox
//                                                         id={`attendee-${index}`}
//                                                         className="h-5 w-5"
//                                                         checked={selectedAttendees.includes(attendee)}
//                                                         onCheckedChange={(checked) => {
//                                                             field.onChange(
//                                                                 checked
//                                                                     ? [...selectedAttendees, attendee]
//                                                                     : selectedAttendees.filter((name: string) => name !== attendee)
//                                                             );
//                                                         }}
//                                                     />
//                                                 </FormControl>
//                                                 <FormLabel htmlFor={`attendee-${index}`} className="cursor-pointer">
//                                                     {attendee}
//                                                 </FormLabel>
//                                             </FormItem>
//                                         );
//                                     }}
//                                 />
//                             ))}
//                         </div>                    
//                     </form>
//                 </Form>
//             </div>
//             <div className="flex justify-center pt-10 pb-10">
//                 <Button className="w-full">Save</Button>
//             </div>
//         </div>
//     );
// }

// export default Attendees;



// import { Label } from "@/components/ui/label";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";

// // Schema
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import MarkAttendeesSchema from "@/form-schema/mark-attendees";

// function Attendees() {
//     const form = useForm<z.infer<typeof MarkAttendeesSchema>>({
//         resolver: zodResolver(MarkAttendeesSchema),
//         defaultValues: {
//             attendees: [], // Default state is an empty array
//         },
//     });

//     function onSubmit(values: z.infer<typeof MarkAttendeesSchema>) {
//         console.log(values);
//     }

//     // Attendees list
//     let attendees = [
//         "HON.KATTY SHEEN WERDS", "HON.HOWDY SCHEMA ANDYSUS", 
//         "HON.HOWDY SCHEMA ANDYSUSASDWSDWADAWDASD", "HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUS", "HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUS", "HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUS", "HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUS" ,"HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUS" , "HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUSADADAADA", "HON.HOWDY SCHEMA ANDYSUSASDWSDWADAWDASD",
//         "HON.HOWDY SCHEMA ANDYSUS", "HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUS", "HON.HOWDY SCHEMA ANDYSUS",
//         "HON.HOWDY SCHEMA ANDYSUS", "HON.HOWDY SCHEMA ANDYSUS",
//     ];

//     return (
//         <div className="w-full h-screen flex flex-col">
//             {/* Form */}
//             <div className="p-4 flex-grow">
//                 <Form {...form}>
//                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                         <div className="grid grid-cols-2 gap-4 pt-3">
//                             {attendees.map((attendee, index) => (
//                                 <FormField
//                                     key={index}
//                                     control={form.control}
//                                     name="attendees"
//                                     render={({ field }) => {
//                                         const selectedAttendees = field.value ?? [];
//                                         return (
//                                             <FormItem className="flex flex-row items-start space-x-3 space-y-0.5">
//                                                 <FormControl>
//                                                     <Checkbox
//                                                         id={`attendee-${index}`}
//                                                         className="h-5 w-5"
//                                                         checked={selectedAttendees.includes(attendee)}
//                                                         onCheckedChange={(checked) => {
//                                                             field.onChange(
//                                                                 checked
//                                                                     ? [...selectedAttendees, attendee]
//                                                                     : selectedAttendees.filter((name: string) => name !== attendee)
//                                                             );
//                                                         }}
//                                                     />
//                                                 </FormControl>
//                                                 <FormLabel
//                                                     htmlFor={`attendee-${index}`}
//                                                     className="cursor-pointer whitespace-normal overflow-hidden text-ellipsis flex-1"
//                                                 >
//                                                     {attendee}
//                                                 </FormLabel>
//                                             </FormItem>
//                                         );
//                                     }}
//                                 />
//                             ))}
//                         </div>                    
//                     </form>
//                 </Form>
//             </div>
//             <div className="flex justify-center pt-10 pb-10">
//                 <Button className="w-full">Save</Button>
//             </div>
//         </div>
//     );
// }

// export default Attendees;



import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

// Schema
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import MarkAttendeesSchema from "@/form-schema/mark-attendees";

function Attendees() {
    const form = useForm<z.infer<typeof MarkAttendeesSchema>>({
        resolver: zodResolver(MarkAttendeesSchema),
        defaultValues: {
            attendees: [], // Default state is an empty array
        },
    });

    function onSubmit(values: z.infer<typeof MarkAttendeesSchema>) {
        console.log(values);
    }

    // Attendees list
    let attendees = [
        "Hon. Katty Sheen", "Hon. Lewdie Pie Kewpie",
        "Hon. Sem Luiz Warain", "Hon. Helow World Lorem Ipsum",
        "Hon. Warrior Hannah Sheen", "Hon. Castor Troy Bower"
    ];

    return (
        <div className="w-full h-screen flex flex-col">
            {/* Form */}
            <div className="p-4 flex-grow">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 pt-3">
                            {attendees.map((attendee, index) => (
                                <FormField
                                    key={index}
                                    control={form.control}
                                    name="attendees"
                                    render={({ field }) => {
                                        const selectedAttendees = field.value ?? [];
                                        return (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0.5">
                                                <FormControl>
                                                    <Checkbox
                                                        id={`attendee-${index}`}
                                                        className="h-5 w-5"
                                                        checked={selectedAttendees.includes(attendee)}
                                                        onCheckedChange={(checked) => {
                                                            field.onChange(
                                                                checked
                                                                    ? [...selectedAttendees, attendee]
                                                                    : selectedAttendees.filter((name: string) => name !== attendee)
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel
                                                    htmlFor={`attendee-${index}`}
                                                    className="cursor-pointer whitespace-normal break-words flex-1"
                                                    style={{ wordBreak: "break-all" }} // Ensures long words break
                                                >
                                                    {attendee}
                                                </FormLabel>
                                            </FormItem>
                                        );
                                    }}
                                />
                            ))}
                        </div>                    
                    </form>
                </Form>
            </div>
            <div className="flex justify-end pt-10 pb-10">
                <Button className="w-20">Save</Button>
            </div>
        </div>
    );
}

export default Attendees;



