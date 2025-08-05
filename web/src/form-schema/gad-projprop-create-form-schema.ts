import { z } from "zod";
import { ProposalStatus } from "@/pages/record/gad/project-proposal/projprop-types";

const DataRequirement = z.union([
  z.string()
      .default("")
      .refine((val) => val.trim() !== "", { message: "This field is required" }) 
      .transform((val) => parseFloat(val))
      .refine((val) => val > -1, { message: "Value must be a positive number" }), 
  z.number()
      .refine((val) => val > -1, { message: "Value must be a positive number" }) 
]).transform((val) => String(val));

export const ProjectProposalSchema = z.object({
  projectTitle: z.string().min(1, "Project Title is required"),
  background: z.string().min(1, "Background is required"),
  objectives: z
    .array(z.string().min(1, "Objective cannot be empty"))
    .min(1, "At least one objective is required"),
  participants: z
    .array(
      z.object({
        category: z.string().min(1, "Category is required"),
        count: DataRequirement,
      })
    )
    .min(1, "At least one participant category is required"),
  date: z.string().min(1, "Date is required"),
  venue: z.string().min(1, "Venue is required"),
  budgetItems: z
    .array(
      z.object({
        name: z.string().min(1, "Item name is required"),
        pax: z.string().min(1, "Pax is required"),
        amount: DataRequirement,
      })
    )
    .min(1, "At least one budget item is required"),
  monitoringEvaluation: z.string().min(1, "Monitoring Evaluation is required"),
  signatories: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
        position: z.string().min(1, "Position is required"),
        type: z.enum(["prepared", "approved"]),
      })
    )
    .min(1, "At least one signatory is required"),
  paperSize: z.enum(["a4", "letter", "legal"]),
  headerImage: z.array(z.any()).optional(),
  supportingDocs: z.array(z.any()).optional(),
  status: z.custom<ProposalStatus>().optional(),
  statusReason: z.string().optional(),
});