import { z } from "zod";

const DataRequirement = z.union([
        z.string()
            .default("")
            .refine((val) => val.trim() !== "", { message: "This field is required" }) 
            .transform((val) => parseFloat(val)) // Convert to float
            .refine((val) => val > -1, { message: "Value must be a positive number" }), 
        z.number()
            .refine((val) => val > -1, { message: "Value must be a positive number" }) 
    ]).transform((val) => String(val)); 

export const EditPersonalServicesSchema = z.object({
  honorariaOfficials: DataRequirement,
  cashOfficials: DataRequirement,
  midBonusOfficials: DataRequirement,
  endBonusOfficials: DataRequirement,
  honorariaTanods: DataRequirement,
  honorariaLupon: DataRequirement,
  honorariaBarangay: DataRequirement,
  prodEnhancement: DataRequirement,
  leaveCredits: DataRequirement,
});

export const EditOtherExpenseSchema1 = z.object({
  travelingExpenses: DataRequirement,
  trainingExpenses: DataRequirement,
  officeExpenses: DataRequirement,
  accountableExpenses: DataRequirement,
  medExpenses: DataRequirement,
  waterExpenses: DataRequirement,
  electricityExpenses: DataRequirement,
  telephoneExpenses: DataRequirement,
  memDues: DataRequirement,
  officeMaintenance: DataRequirement,
  vehicleMaintenance: DataRequirement,
});

export const EditOtherExpenseSchema2 = z.object({
  fidelityBond: DataRequirement,
  insuranceExpense: DataRequirement,
  gadProg: DataRequirement,
  seniorProg: DataRequirement,
  juvJustice: DataRequirement,
  badacProg: DataRequirement,
  nutritionProg: DataRequirement,
  aidsProg: DataRequirement,
  assemblyExpenses: DataRequirement,
  disasterProg: DataRequirement,
  miscExpense: DataRequirement,
});

export const EditCapitalOutlayAndNonOfficeSchema = z.object({
  capitalOutlays: DataRequirement,
  cleanAndGreen: DataRequirement,
  streetLighting: DataRequirement,
  rehabMultPurpose: DataRequirement,
  skFund: DataRequirement,
  qrfFund: DataRequirement,
  disasterTraining: DataRequirement,
  disasterSupplies: DataRequirement,
});

export const EditBudgetPlanSchema = EditPersonalServicesSchema.merge(EditOtherExpenseSchema1)
                                     .merge(EditOtherExpenseSchema2)
                                     .merge(EditCapitalOutlayAndNonOfficeSchema);

export type FormDataEdit = z.infer<typeof EditBudgetPlanSchema>;

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          