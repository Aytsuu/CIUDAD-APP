// "use client"

// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import type * as z from "zod"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Form } from "@/components/ui/form"
// import { DemographicData } from "./DemographicData"
// import { demographicDataSchema } from "@/form-schema/schema"


// export default function FamilyProfileForm() {
//   const form = useForm<z.infer<typeof demographicDataSchema>>({
//     resolver: zodResolver(demographicDataSchema),
//     defaultValues: {
//       building: undefined,
//       quarter: undefined,
//       householdNo: "",
//       familyNo: "",
//       respondent: {
//         lastName: "",
//         firstName: "",
//         middleName: "",
//         mothersMaidenName: "",
//         gender: undefined,
//         contactNumber: "",
//       },
//       address: "",
//       nhtsHousehold: undefined,
//       indigenousPeople: undefined,
//       householdHead: {
//         lastName: "",
//         firstName: "",
//         middleName: "",
//         gender: undefined,
//       },
//       father: {
//         lastName: "",
//         firstName: "",
//         middleName: "",
//         age: "",
//         civilStatus: undefined,
//         philHealthId: "",
//         covidVaxStatus: "",
//         educationalAttainment: "",
//         religion: "",
//         bloodType: "",
//         birthYear: "",
//       },
//       mother: {
//         lastName: "",
//         firstName: "",
//         middleName: "",
//         age: "",
//         civilStatus: undefined,
//         philHealthId: "",
//         covidVaxStatus: "",
//         educationalAttainment: "",
//         religion: "",
//         bloodType: "",
//         birthYear: "",
//       },
//       healthRiskClassification: undefined,
//       immunizationStatus: "",
//       familyPlanning: {
//         method: undefined,
//         source: "",
//       },
//       noFamilyPlanning: false,
//     },
//   })

//   function onSubmit(values: z.infer<typeof demographicDataSchema>) {
//     console.log(values)
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//         <Card className="w-full max-w-5xl mx-auto">
//           <CardHeader>
//             <CardTitle className="text-2xl text-center">San Roque Health Center</CardTitle>
//             <h2 className="text-xl font-semibold mt-4">I. Demographic Data</h2>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <DemographicData />
//             <div className="flex justify-end space-x-4 pt-6">
//               <Button type="button" variant="outline" onClick={() => form.reset()}>
//                 Cancel
//               </Button>
//               <Button type="submit">Proceed</Button>
//             </div>
//           </CardContent>
//         </Card>
//       </form>
//     </Form>
//   )
// }

