import { z } from "zod";

// Sample data for findings with type labels
export const findings = [
  { id: 1, type_id: 1, typeLabel: "Skin", name: "skin_essentiallyNormal", label: "Essentially Normal" },
  { id: 2, type_id: 1, typeLabel: "Skin", name: "skin_coldCalmly", label: "Cold/Calmly" },
  { id: 3, type_id: 1, typeLabel: "Skin", name: "skin_edematousSwelling", label: "Edematous/Swelling" },
  { id: 4, type_id: 2, typeLabel: "Eyes", name: "eyes_abnormalPupillaryReaction", label: "Abnormal Pupillary Reaction" },
  { id: 5, type_id: 2, typeLabel: "Eyes", name: "eyes_coldCalmly", label: "Cold/Calmly" },
  { id: 6, type_id: 3, typeLabel: "Nose", name: "nose_abnormalPupillaryReaction", label: "Abnormal Pupillary Reaction" },
  { id: 7, type_id: 3, typeLabel: "Nose", name: "nose_coldCalmly", label: "Cold/Calmly" },
];

// Dynamically generate the schema with better type handling
export const PESchema = z.object({
  // Add a field for each finding as an array
  ...Object.fromEntries(
    findings.map((finding) => [finding.name, z.array(z.string()).default([])])
  ),
  // Update these to handle the correct data types
  others: z.array(z.string()).default([]),
  othersTypeIds: z.array(z.number()).default([]),
});

// Infer the type from the schema
export type PEType = z.infer<typeof PESchema>;