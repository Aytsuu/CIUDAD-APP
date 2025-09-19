import React from "react";
import { useRouter } from "expo-router";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { useRegistrationTypeContext } from "@/contexts/RegistrationTypeContext";
import AccountSetup from "../account/AccountSetup";

export default function IndividualAccountReg() {
  const router = useRouter();
  const { reset } = useRegistrationFormContext();
  const { type } = useRegistrationTypeContext();

  const submit = () => {
   router.push('/registration/individual/information');
  }
  
  return (
    <AccountSetup params={{
      next: () => submit()
    }}/>
  )
}