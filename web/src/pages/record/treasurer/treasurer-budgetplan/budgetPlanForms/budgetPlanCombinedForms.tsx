import { useState, useEffect } from 'react';
import HeaderAndAllocationForm from '../budgetHeaderAndAllocationForms/budgetPlanHeaderandAllocation';
import BudgetPlanForm from './budgetplanMainForm';
import { useNavigate, useLocation } from 'react-router';
import BudgetHeaderSchema from '@/form-schema/treasurer/budgetplan-header-schema';
import BudgetAllocationSchema from '@/form-schema/treasurer/budget-allocation-schema';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const CombinedBudgetForm = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get state from navigation
  const { budgetData, isEdit: isEditProp } = location.state || {};
  const [isEdit, setIsEdit] = useState(isEditProp || false);
  const [editId, setEditId] = useState<string | undefined>(budgetData?.plan_id);

  // Combined form for both header and allocation
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

  // Set form values when in edit mode
  useEffect(() => {
    if (isEdit == true && budgetData) {
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

      if (budgetData.plan_personalService_limit) {
        setStep(2);
      }
    }
  }, [isEdit, budgetData, headerForm, allocationForm]);

  const handleHeaderSubmit = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleExit = () => {
    if (isEdit && editId) {
      navigate(`/treasurer-budgetplan-view/${editId}`);
    } else {
      navigate('/treasurer-budget-plan');
    }
  };

  const getCombinedFormData = () => {
    return {
      ...headerForm.getValues(),
      ...allocationForm.getValues(),
      ...(isEdit && editId ? { id: editId } : {}),
    };
  };

  return (
    <div>
      {step === 1 && (
        <HeaderAndAllocationForm 
          headerForm={headerForm}
          allocationForm={allocationForm}
          onSubmit={handleHeaderSubmit} 
          isEdit={isEdit}
          editId={editId}
          onExit={handleExit}
        />
      )}
      {step === 2 && (
        <BudgetPlanForm 
          onBack={handleBack} 
          headerData={getCombinedFormData()}
          isEdit={isEdit}
          editId={editId}
          budgetData = {budgetData.details}
        />
      )}
    </div>
  );
};

export default CombinedBudgetForm;