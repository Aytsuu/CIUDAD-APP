import Layout from "./_layout";
import { IdentityVerificationForm } from "./IdentityVerForm"
import DemographicData from "./DemographicData";

// This is the main page component
export default () => {
  return (
    <Layout
      header="Verifying Identity"
      description="Please enter your date of birth and residency to continue:"
    >
      <IdentityVerificationForm />
    </Layout>
  );
};