import React from "react";
import { router } from "expo-router";
import { useProgressContext } from "@/contexts/ProgressContext";
import AccountSetup from "../account/AccountSetup";

export default function AccountRegNew() {
  const {
    completeStep,
    completedSteps
  } = useProgressContext();

  const submit = () => {
    completeStep(1)
    router.replace("/registration/family/register-new");
  }
  
  return (
    <AccountSetup params={{
      next: () => submit(),
      isFamilyRegistration: true,
      complete: completedSteps.includes(1)
    }} />
  )
}