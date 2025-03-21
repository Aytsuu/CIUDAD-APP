import api from '@/api/api'
import { formatDate } from '@/helpers/dateFormatter';
import { parseFloatSafe } from '@/helpers/floatformatter';

const budget_plan = async (budgetInfo: Record<string, any>) => {
    try {
        console.log({
            plan_year: new Date().getFullYear().toString(),
            plan_actual_income: parseFloatSafe(budgetInfo.actualIncome), 
            plan_rpt_income: parseFloatSafe(budgetInfo.actualRPT), 
            plan_balance: parseFloatSafe(budgetInfo.balance), 
            plan_tax_share: parseFloatSafe(budgetInfo.realtyTaxShare),
            plan_tax_allotment: parseFloatSafe(budgetInfo.taxAllotment), 
            plan_cert_fees: parseFloatSafe(budgetInfo.clearanceAndCertFees), 
            plan_other_income: parseFloatSafe(budgetInfo.otherSpecificIncome), 
            plan_issue_date: new Date().toISOString().split('T')[0], 
        });

        const res = await api.post('treasurer/budget-plan/', {
            plan_year: new Date().getFullYear().toString(),
            plan_actual_income: parseFloatSafe(budgetInfo.actualIncome), 
            plan_rpt_income: parseFloatSafe(budgetInfo.actualRPT), 
            plan_balance: parseFloatSafe(budgetInfo.balance), 
            plan_tax_share: parseFloatSafe(budgetInfo.realtyTaxShare),
            plan_tax_allotment: parseFloatSafe(budgetInfo.taxAllotment), 
            plan_cert_fees: parseFloatSafe(budgetInfo.clearanceAndCertFees), 
            plan_other_income: parseFloatSafe(budgetInfo.otherSpecificIncome), 
            plan_issue_date: formatDate(new Date().toISOString().split('T')[0]), 
        });

        return res.data.plan_id;
    } catch (err) {
        console.error(err);
    }
};

const current_expenditures_personal = async (personalExpenditureInfo: Record<string, any>, planId: number) => {
    try {
        console.log({
            cep_official_honoraria: parseFloatSafe(personalExpenditureInfo.honorariaOfficials),
            cep_cash_gift: parseFloatSafe(personalExpenditureInfo.cashOfficials),
            cep_mid_year_bonus: parseFloatSafe(personalExpenditureInfo.midBonusOfficials), 
            cep_year_end_bonus: parseFloatSafe(personalExpenditureInfo.endBonusOfficials), 
            cep_tanod_honoraria: parseFloatSafe(personalExpenditureInfo.honorariaTanods),
            cep_lupon_honoraria: parseFloatSafe(personalExpenditureInfo.honorariaLupon),
            cep_brgy_workers_honoraria: parseFloatSafe(personalExpenditureInfo.honorariaBarangay),
            cep_enhancement_incentive: parseFloatSafe(personalExpenditureInfo.prodEnhancement),
            cep_leave_credits: parseFloatSafe(personalExpenditureInfo.leaveCredits),
            plan: planId,
            
        });

        const res = await api.post('treasurer/current-expenditure-personal/', {
            cep_official_honoraria: parseFloatSafe(personalExpenditureInfo.honorariaOfficials),
            cep_cash_gift: parseFloatSafe(personalExpenditureInfo.cashOfficials),
            cep_mid_year_bonus: parseFloatSafe(personalExpenditureInfo.midBonusOfficials), 
            cep_year_end_bonus: parseFloatSafe(personalExpenditureInfo.endBonusOfficials), 
            cep_tanod_honoraria: parseFloatSafe(personalExpenditureInfo.honorariaTanods),
            cep_lupon_honoraria: parseFloatSafe(personalExpenditureInfo.honorariaLupon),
            cep_brgy_workers_honoraria: parseFloatSafe(personalExpenditureInfo.honorariaBarangay),
            cep_enhancement_incentive: parseFloatSafe(personalExpenditureInfo.prodEnhancement),
            cep_leave_credits: parseFloatSafe(personalExpenditureInfo.leaveCredits),
            plan: planId,
        });

        return res.data.cep_id;
    } catch (err) {
        console.error(err);
    }
};

const current_expenditures_maintenance = async (maintenanceInfo: Record<string, any>, planId: number) => {
    try {
        console.log({
            cem_travel_expense: parseFloatSafe(maintenanceInfo.travelingExpenses),
            cem_training_expense: parseFloatSafe(maintenanceInfo.trainingExpenses),
            cem_office_expense: parseFloatSafe(maintenanceInfo.officeExpenses),
            cem_accountable_expense: parseFloatSafe(maintenanceInfo.accountableExpenses),
            cem_medicine_expense: parseFloatSafe(maintenanceInfo.medExpenses),
            cem_water_expense: parseFloatSafe(maintenanceInfo.waterExpenses),
            cem_electricity_expense: parseFloatSafe(maintenanceInfo.electricityExpenses),
            cem_telephone_expense: parseFloatSafe(maintenanceInfo.telephoneExpenses),
            cem_membership_dues: parseFloatSafe(maintenanceInfo.memDues),
            cem_office_maintenance: parseFloatSafe(maintenanceInfo.officeMaintenance),
            cem_vehicle_maintenance: parseFloatSafe(maintenanceInfo.vehicleMaintenance),
            plan: planId,
        });

        const res = await api.post('treasurer/current-expenditure-maintenance/', {
            cem_travel_expense: parseFloatSafe(maintenanceInfo.travelingExpenses),
            cem_training_expense: parseFloatSafe(maintenanceInfo.trainingExpenses),
            cem_office_expense: parseFloatSafe(maintenanceInfo.officeExpenses),
            cem_accountable_expense: parseFloatSafe(maintenanceInfo.accountableExpenses),
            cem_medicine_expense: parseFloatSafe(maintenanceInfo.medExpenses),
            cem_water_expense: parseFloatSafe(maintenanceInfo.waterExpenses),
            cem_electricity_expense: parseFloatSafe(maintenanceInfo.electricityExpenses),
            cem_telephone_expense: parseFloatSafe(maintenanceInfo.telephoneExpenses),
            cem_membership_dues: parseFloatSafe(maintenanceInfo.memDues),
            cem_office_maintenance: parseFloatSafe(maintenanceInfo.officeMaintenance),
            cem_vehicle_maintenance: parseFloatSafe(maintenanceInfo.vehicleMaintenance),
            plan: planId,
        });

        return res.data.cem_id;
    } catch (err) {
        console.error(err);
    }
};


const other_maint_and_operating_expenses = async (otherMaintInfo: Record<string, any>, planId: number) => {
    try {
        console.log({
            ome_gad_program: parseFloatSafe(otherMaintInfo.gadProg),
            ome_senior_pwd_program: parseFloatSafe(otherMaintInfo.seniorProg),
            ome_bcpc: parseFloatSafe(otherMaintInfo.juvJustice),
            ome_badac_program: parseFloatSafe(otherMaintInfo.badacProg),
            ome_nutrition_program: parseFloatSafe(otherMaintInfo.nutritionProg),
            ome_aids_program: parseFloatSafe(otherMaintInfo.aidsProg),
            ome_assembly_expense: parseFloatSafe(otherMaintInfo.assemblyExpenses),
            ome_disaster_program: parseFloatSafe(otherMaintInfo.disasterProg),
            ome_fidelity_bond: parseFloatSafe(otherMaintInfo.fidelityBond),
            ome_insurance_expense: parseFloatSafe(otherMaintInfo.insuranceExpense),
            ome_misc_expense: parseFloatSafe(otherMaintInfo.miscExpense),
            plan: planId,
        });

        const res = await api.post('treasurer/other-maintenance-and-operating-expense/', {
            ome_gad_program: parseFloatSafe(otherMaintInfo.gadProg),
            ome_senior_pwd_program: parseFloatSafe(otherMaintInfo.seniorProg),
            ome_bcpc: parseFloatSafe(otherMaintInfo.juvJustice),
            ome_badac_program: parseFloatSafe(otherMaintInfo.badacProg),
            ome_nutrition_program: parseFloatSafe(otherMaintInfo.nutritionProg),
            ome_aids_program: parseFloatSafe(otherMaintInfo.aidsProg),
            ome_assembly_expense: parseFloatSafe(otherMaintInfo.assemblyExpenses),
            ome_disaster_program: parseFloatSafe(otherMaintInfo.disasterProg),
            ome_fidelity_bond: parseFloatSafe(otherMaintInfo.fidelityBond),
            ome_insurance_expense: parseFloatSafe(otherMaintInfo.insuranceExpense),
            ome_misc_expense: parseFloatSafe(otherMaintInfo.miscExpense),
            plan: planId,
        });

        return res.data.ome_id;
    } catch (err) {
        console.log(err);
    }
};

const capital_outlays_and_non_office = async (capitalAndNonOfficeInfo: Record<string, any>, planId: number  ) => {
    try {
        console.log({
            con_capital_outlay: parseFloatSafe(capitalAndNonOfficeInfo.capitalOutlays),
            con_clean_and_green: parseFloatSafe(capitalAndNonOfficeInfo.cleanAndGreen),
            con_street_lighting: parseFloatSafe(capitalAndNonOfficeInfo.streetLighting),
            con_rehab_multi_purpose: parseFloatSafe(capitalAndNonOfficeInfo.rehabMultPurpose),
            con_sk_fund: parseFloatSafe(capitalAndNonOfficeInfo.skFund),
            con_quick_response: parseFloatSafe(capitalAndNonOfficeInfo.qrfFund),
            con_disaster_training: parseFloatSafe(capitalAndNonOfficeInfo.disasterTraining),
            con_disaster_supplies: parseFloatSafe(capitalAndNonOfficeInfo.disasterSupplies),
            plan: planId,
        });

        const res = await api.post('treasurer/capital-outlays-and-nonoffice/', {
            con_capital_outlay: parseFloatSafe(capitalAndNonOfficeInfo.capitalOutlays),
            con_clean_and_green: parseFloatSafe(capitalAndNonOfficeInfo.cleanAndGreen),
            con_street_lighting: parseFloatSafe(capitalAndNonOfficeInfo.streetLighting),
            con_rehab_multi_purpose: parseFloatSafe(capitalAndNonOfficeInfo.rehabMultPurpose),
            con_sk_fund: parseFloatSafe(capitalAndNonOfficeInfo.skFund),
            con_quick_response: parseFloatSafe(capitalAndNonOfficeInfo.qrfFund),
            con_disaster_training: parseFloatSafe(capitalAndNonOfficeInfo.disasterTraining),
            con_disaster_supplies: parseFloatSafe(capitalAndNonOfficeInfo.disasterSupplies),
            plan: planId,
        });

        return res.data.con_id;
    } catch (err) {
        console.log(err);
    }
};

export {budget_plan, current_expenditures_personal, current_expenditures_maintenance, other_maint_and_operating_expenses, capital_outlays_and_non_office}