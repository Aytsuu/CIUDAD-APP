import { BudgetPlanStep2Schema } from "@/form-schema/treasurer/budgetplan-schema"
import {z} from "zod"

export const initialFormData1 = (): z.infer<typeof BudgetPlanStep2Schema> => {
  return {
    honorariaOfficials: "",
    cashOfficials: "",
    midBonusOfficials: "",
    endBonusOfficials: "",
    honorariaTanods: "",
    honorariaLupon: "",
    honorariaBarangay: "",
    prodEnhancement: "",
    leaveCredits: "",
    memDues: "",
    miscExpense: "",
    cleanAndGreen: "",
    streetLighting: "",
    rehabMultPurpose: "",
    skFund: "",
    qrfFund: "",
    disasterTraining: "",
    disasterSupplies: "",
    disasterProg: "",
    gadProg: "",
    seniorProg: "",
  }
}


