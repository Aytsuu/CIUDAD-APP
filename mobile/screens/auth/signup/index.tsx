import _ScreenLayout from "@/screens/_ScreenLayout";
import { IdentityVerificationForm } from "./IdentityVerForm"

// This is the main page component
export default () => {
  return (
    <_ScreenLayout
      header="Verifying Identity"
      description="Please enter your date of birth."
    >
      <IdentityVerificationForm />
    </_ScreenLayout>
  );
};