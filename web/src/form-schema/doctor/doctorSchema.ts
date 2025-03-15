// // import { z } from "zod";

// // export const MedConNoPHSchema = z.object({
// //   subjective: z.string(),
// //   objective: z.string(),
// //   assessment: z.string(),
// // });


// // // Sample data for findings with type labels
// // export const findings = [
// //   { id: 1, type_id: 1, typeLabel: "Skin", name: "skin_essentiallyNormal", label: "Essentially Normal" },
// //   { id: 2, type_id: 1, typeLabel: "Skin", name: "skin_coldCalmly", label: "Cold/Calmly" },
// //   { id: 3, type_id: 1, typeLabel: "Skin", name: "skin_edematousSwelling", label: "Edematous/Swelling" },
// //   { id: 4, type_id: 2, typeLabel: "Eyes", name: "eyes_abnormalPupillaryReaction", label: "Abnormal Pupillary Reaction" },
// //   { id: 5, type_id: 2, typeLabel: "Eyes", name: "eyes_coldCalmly", label: "Cold/Calmly" },
// //   { id: 6, type_id: 3, typeLabel: "Nose", name: "nose_abnormalPupillaryReaction", label: "Abnormal Pupillary Reaction" },
// //   { id: 7, type_id: 3, typeLabel: "Nose", name: "nose_coldCalmly", label: "Cold/Calmly" },
// // ];

// // // Dynamically generate the schema with better type handling
// // export const PESchema = z.object({
// //   // Add a field for each finding as an array
// //   ...Object.fromEntries(
// //     findings.map((finding) => [finding.name, z.array(z.string()).default([])])
// //   ),
// //   // Update these to handle the correct data types
// //   others: z.array(z.string()).default([]),
// //   othersTypeIds: z.array(z.number()).default([]),
// // });

// // // Infer the type from the schema
// // export type PEType = z.infer<typeof PESchema>;

// // export type MedConNoPHType = z.infer<typeof MedConNoPHSchema>;


// // src/form-schema/doctor/doctorSchema.ts
// import { z } from "zod";

// export const MedConNoPHSchema = z.object({
//   subjective: z.string(),
//   objective: z.string(),
//   assessment: z.string(),
// });

// export const findings = [
//   { id: 1, type_id: 1, typeLabel: "Skin", name: "skin_essentiallyNormal", label: "Essentially Normal" },
//   { id: 2, type_id: 1, typeLabel: "Skin", name: "skin_coldCalmly", label: "Cold/Calmly" },
//   { id: 3, type_id: 1, typeLabel: "Skin", name: "skin_edematousSwelling", label: "Edematous/Swelling" },
//   { id: 4, type_id: 2, typeLabel: "Eyes", name: "eyes_abnormalPupillaryReaction", label: "Abnormal Pupillary Reaction" },
//   { id: 5, type_id: 2, typeLabel: "Eyes", name: "eyes_coldCalmly", label: "Cold/Calmly" },
//   { id: 6, type_id: 3, typeLabel: "Nose", name: "nose_abnormalPupillaryReaction", label: "Abnormal Pupillary Reaction" },
//   { id: 7, type_id: 3, typeLabel: "Nose", name: "nose_coldCalmly", label: "Cold/Calmly" },
// ];

// export const PESchema = z.object({
//   ...Object.fromEntries(findings.map((finding) => [finding.name, z.array(z.string()).default([])])),
//   others: z.array(z.string()).default([]),
//   othersTypeIds: z.array(z.number()).default([]),
// });

// export type PEType = z.infer<typeof PESchema>;
// export type MedConNoPHType = z.infer<typeof MedConNoPHSchema>;




import { z } from "zod";

export const AssessmentSchema = z.object({
  findings: z.array(z.string()),
}); 

// MedConNoPHSchema
export const MedConNoPHSchema = z.object({
  subjective: z.string(),
  objective: z.string(),
  assessments: z.array(AssessmentSchema), // Array of assessments


});

// Findings data
export const findings = [
  { id: 1, type_id: 1, typeLabel: "Skin", name: "skin_essentiallyNormal", label: "Essentially Normal" },
  { id: 2, type_id: 1, typeLabel: "Skin", name: "skin_coldCalmly", label: "Cold/Calmly" },
  { id: 3, type_id: 1, typeLabel: "Skin", name: "skin_edematousSwelling", label: "Edematous/Swelling" },
  { id: 4, type_id: 2, typeLabel: "Eyes", name: "eyes_abnormalPupillaryReaction", label: "Abnormal Pupillary Reaction" },
  { id: 5, type_id: 2, typeLabel: "Eyes", name: "eyes_coldCalmly", label: "Cold/Calmly" },
  { id: 6, type_id: 3, typeLabel: "Nose", name: "nose_abnormalPupillaryReaction", label: "Abnormal Pupillary Reaction" },
  { id: 7, type_id: 3, typeLabel: "Nose", name: "nose_coldCalmly", label: "Cold/Calmly" },
];

// PESchema
export const PESchema = z.object({
  ...Object.fromEntries(findings.map((finding) => [finding.name, z.array(z.string()).default([])])),
  others: z.array(z.string()).default([]),
  othersTypeIds: z.array(z.number()).default([]),
});

// Merge the schemas
export const CombinedSchema = MedConNoPHSchema.merge(PESchema);

// Infer the combined type
export type CombinedType = z.infer<typeof CombinedSchema>;

export type PEType = z.infer<typeof PESchema>;
export type MedConNoPHType = z.infer<typeof MedConNoPHSchema>;


