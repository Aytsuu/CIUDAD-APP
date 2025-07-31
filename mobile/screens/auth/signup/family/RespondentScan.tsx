import React from "react";
import CompleteScanProcess from "../CompleteScanProcess";
import { useProgressContext } from "@/contexts/ProgressContext";
import { router } from "expo-router";

export default function RespondentScan() {
  const { completeStep } = useProgressContext();

  const submit = () => {
    completeStep(7);
    router.replace("/registration/family/register-new");
  }

  return (
    <CompleteScanProcess 
      params={{
        submit: submit
      }}
    />
  )
}