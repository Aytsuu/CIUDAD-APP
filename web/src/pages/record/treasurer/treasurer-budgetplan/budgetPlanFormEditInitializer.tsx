import { initialFormData1, initialFormData2, initialFormData3, initialFormData4 } from "./formDataInitializer";

// Main function to return form data based on mode
export function getInitialFormData(isEdit: boolean, details?: any[]) {
  const forms = {
      form1: { ...initialFormData1 },
      form2: { ...initialFormData2 },
      form3: { ...initialFormData3 },
      form4: { ...initialFormData4 },
  };

  if (isEdit && details) {
      details.forEach((item) => {
          const fieldName = mapApiFieldToFormField(item.dtl_budget_item);
          if (fieldName) {
              // Find which form contains this field
              if (fieldName in forms.form1) {
          (forms.form1 as Record<string, string>)[fieldName] = item.dtl_proposed_budget;
        } else if (fieldName in forms.form2) {
          (forms.form2 as Record<string, string>)[fieldName] = item.dtl_proposed_budget;
        } else if (fieldName in forms.form3) {
          (forms.form3 as Record<string, string>)[fieldName] = item.dtl_proposed_budget;
        } else if (fieldName in forms.form4) {
          (forms.form4 as Record<string, string>)[fieldName] = item.dtl_proposed_budget;
        }
          }
      });
  }

  return forms;
}

function mapApiFieldToFormField(apiField: string): string | null {
  const mapping: Record<string, string> = {
    "Honoraria for Officials": "honorariaOfficials",
    "Cash Gift for Officials": "cashOfficials",
    "Mid-Year Bonus for Officials": "midBonusOfficials",
    "Year-End Bonus for Officials": "endBonusOfficials",
    "Honoraria for Tanods": "honorariaTanods",
    "Honoraria for Lupon Members": "honorariaLupon",
    "Honoraria for Barangay Workers": "honorariaBarangay",
    "Productivity Enhancement Incentive": "prodEnhancement",
    "Commutation of Leave Credits": "leaveCredits",
    "Traveling Expense": "travelingExpenses",
    "Training Expenses": "trainingExpenses",
    "Office Supplies Expenses": "officeExpenses",
    "Accountable Forms Expenses": "accountableExpenses",
    "Drugs and Medicine Expense": "medExpenses",
    "Water Expenses": "waterExpenses",
    "Electricity Expenses": "electricityExpenses",
    "Telephone Expenses": "telephoneExpenses",
    "Membership Dues/ Contribution to Organization": "memDues",
    "Repair and Maintenance of Office Equipment": "officeMaintenance",
    "Repair and Maintenance of Motor Vehicle": "vehicleMaintenance",
    "Fidelity Bond Premiums": "fidelityBond",
    "Insurance Expenses": "insuranceExpense",
    "GAD Program": "gadProg",
    "Senior Citizen/ PWD Program": "seniorProg",
    "BCPC (Juvenile Justice System)": "juvJustice",
    "BADAC Program": "badacProg",
    "Nutrition Program": "nutritionProg",
    "Combating AIDS Program": "aidsProg",
    "Barangay Assembly Expenses": "assemblyExpenses",
    "Disaster Response Program": "disasterProg",
    "Extraordinary & Miscellaneous Expense": "miscExpense",
    "Total Capital Outlays": "capitalOutlays",
    "Clean & Green Environmental": "cleanAndGreen",
    "Street Lighting Project": "streetLighting",
    "Rehabilitation of Multi-Purpose": "rehabMultPurpose",
    "Subsidy to Sangguniang Kabataan (SK) Fund": "skFund",
    "Quick Response Fund (QRF)": "qrfFund",
    "Disaster Training": "disasterTraining",
    "Disaster Supplies": "disasterSupplies",
  };
  return mapping[apiField] || null;
}