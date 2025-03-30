import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import BusinessProfileForm from "./BusinessProfileForm";
import { Card } from "@/components/ui/card/card";

export default function BusinessFormLayout() {
  return (
    <LayoutWithBack 
      title="Business Form" 
      description="Register a new business by filling in essential details such as name, location, 
              and respondent information. Required fields must be completed to submit successfully."
    >
      <Card className="w-full">
        <BusinessProfileForm />
      </Card>
    </LayoutWithBack>
  );
}
