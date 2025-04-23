import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import HeaderAndAllocationForm from '../budgetHeaderAndAllocationForms/budgetPlanHeaderandAllocation';
import BudgetPlanForm from './budgetplanMainForm';

import BudgetHeaderSchema from '@/form-schema/treasurer/budgetplan-header-schema';
import BudgetAllocationSchema from '@/form-schema/treasurer/budget-allocation-schema';

const CombinedBudgetForm = () => {
  const [step, setStep] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { budgetData, isEdit: isEditProp, plan_id } = location.state || {};
  const isEdit = Boolean(isEditProp);

  const headerForm = useForm<z.infer<typeof BudgetHeaderSchema>>({
    resolver: zodResolver(BudgetHeaderSchema),
    defaultValues: {
      balance: "",
      realtyTaxShare: "",
      taxAllotment: "",
      clearanceAndCertFees: "",
      otherSpecificIncome: "",
      actualIncome: "",
      actualRPT: ""
    }
  });

  const allocationForm = useForm<z.infer<typeof BudgetAllocationSchema>>({
    resolver: zodResolver(BudgetAllocationSchema),
    defaultValues: {
      personalServicesLimit: "",
      miscExpenseLimit: "",
      localDevLimit: "",
      skFundLimit: "",
      calamityFundLimit: "",
    }
  });

  useEffect(() => {
    if (isEdit && !isInitialized && budgetData) {
      headerForm.reset({
        balance: budgetData.plan_balance,
        realtyTaxShare: budgetData.plan_tax_share,
        taxAllotment: budgetData.plan_tax_allotment,
        clearanceAndCertFees: budgetData.plan_cert_fees,
        otherSpecificIncome: budgetData.plan_other_income,
        actualIncome: budgetData.plan_actual_income,
        actualRPT: budgetData.plan_rpt_income
      });

      allocationForm.reset({
        personalServicesLimit: budgetData.plan_personalService_limit,
        miscExpenseLimit: budgetData.plan_miscExpense_limit,
        localDevLimit: budgetData.plan_localDev_limit,
        skFundLimit: budgetData.plan_skFund_limit,
        calamityFundLimit: budgetData.plan_calamityFund_limit
      });

      setIsInitialized(true);
    }
  }, [isEdit, budgetData, headerForm, allocationForm, isInitialized]);

  const handleHeaderSubmit = () => setStep(2);

  const handleBack = () => setStep(1);

  const handleExit = () => {
    navigate(
      isEdit && plan_id ? '/treasurer-budgetplan-view' : '/treasurer-budget-plan',
      isEdit && plan_id ? { state: { planId: plan_id } } : undefined
    );    
  };

  const getCombinedFormData = () => ({
    ...headerForm.getValues(),
    ...allocationForm.getValues(),
    ...(isEdit && plan_id ? { id: plan_id } : {}),
  });

  return (
    <div>
      {step === 1 && (
        <HeaderAndAllocationForm 
          headerForm={headerForm}
          allocationForm={allocationForm}
          onSubmit={handleHeaderSubmit} 
          isEdit={isEdit}
          editId={plan_id}
          onExit={handleExit}
        />
      )}
      {step === 2 && (
        <BudgetPlanForm 
          onBack={handleBack} 
          headerData={getCombinedFormData()}
          isEdit={isEdit}
          editId={plan_id}
          budgetData={budgetData?.details}
        />
      )}
    </div>
  );
};

export default CombinedBudgetForm;
