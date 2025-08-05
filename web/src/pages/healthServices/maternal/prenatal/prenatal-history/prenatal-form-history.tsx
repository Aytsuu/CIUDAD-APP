"use client"

// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
// import { DataTable } from "@/components/ui/table/data-table"
// import type { ColumnDef } from "@tanstack/react-table"
// import { TooltipProvider } from "@/components/ui/tooltip"

// type bodyMeasurement = {
// 	weight: number;
// 	height: number;
// 	bmi: number;
// 	bmiCategory: string;
// }

// type obstetricHistory = {
// 	noOfChildrenBornAlive: number;
// 	noOfLivingChildren: number;
// 	noOfAbortion: number;
// 	noOfStillBirths: number;
// 	historyOfLargeBabies: number;
// 	historyOfDiabetes: boolean
// }

// type medicalHistory = {
// 	prevIllnesses: string[];
// 	yearOfIllness: string[];
// 	prevHospitalization: string[];
// 	yearOfHospitalization: string[];
// }

// type previousPregnancy = {
// 	dateOfDevilery: string;
// 	outcome: string;
// 	typeOfDelivery: string;
// 	babysWt: string;
// 	gender: string;
// 	ballardScore: string;
// 	apgarScore: string;
// }

// type tetanusToxoid = {
// 	ttStatus: string;
// 	ttStatusDate: string;
// 	tdapGiven: boolean;
// }

// type presentPregnancy = {
// 	gravida: number;
// 	para: number;
// 	fullterm: number;
// 	preterm: number;
// 	lmp: string;
// 	edc: string;
// }

// type laboratoryTests = {
// 	labTests: string[];
// 	// labTestDate: string;
// }

// type guide4AncVisit = {
// 	firstTrimester: string;
// 	secondTrimester: string;
// 	thirdTrimesterOne: string;
// 	thirdTrimesterTwo: string;
// }

// type checklist = {
// 	checklistItems: string[];
// }

// type birthPlan = {
// 	planPlaceOfDelivery: string;
// 	planForNewbornScreening: string;
// }

// type micronutrientSupplementation = {
// 	supplementationName: string[];
// 	// supplementationDate: string;
// }

// type riskCodeAssessment = {
// 	riskCodes: string[];
// }

// type prenatalCareVisit = {
// 	visitDate: string;
// 	weight: number;
// 	gestationalAge: number;
// 	bloodPressure: string;
// 	leopoldsFindings: {
// 		fundalHeight: string;
// 		fetalHeartbeat: string;
// 		fetalPosition: string;
// 	};
// 	complaints: string;
// 	advises: string;
// }

// type AttributeValue = {
//   attribute: string
//   value: React.ReactNode // Use React.ReactNode to handle various data types
// }

// Helper function to transform an object into an array of attribute-value pairs
// function transformObjectToAttributeValueArray<T extends Record<string, any>>(obj: T): AttributeValue[] {
//   return Object.entries(obj).map(([key, value]) => {
//     let displayValue: React.ReactNode

//     if (Array.isArray(value)) {
//       displayValue = value.join(", ")
//     } else if (typeof value === "boolean") {
//       displayValue = value ? "Yes" : "No"
//     } else if (typeof value === "object" && value !== null) {
//       // For nested objects, you might want a more specific display or stringify
//       displayValue = JSON.stringify(value)
//     } else {
//       displayValue = String(value)
//     }

//     // Convert camelCase keys to "Camel Case" for display
//     const displayAttribute = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())

//     return {
//       attribute: displayAttribute,
//       value: displayValue,
//     }
//   })
// }

// const attributeValueColumns: ColumnDef<AttributeValue>[] = [
//   {
//     accessorKey: "attribute",
//     header: "Attribute",
//     cell: ({ row }) => <span className="font-medium">{row.original.attribute}</span>,
// 	 size: 100,
//   },
//   {
//     accessorKey: "value",
//     header: "Value",
//   },
// ]



export default function PrenatalFormHistory() {
	return (
		<>
		<div>
			
		</div>
		</>
	)
}