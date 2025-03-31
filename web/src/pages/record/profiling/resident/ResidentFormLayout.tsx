/* 

  Note...

  This form is being utilized for creating, viewing, and updating resident records
  Additionally, it is being used for adminstrative position assignment or staff registration 

*/

import React from "react";
import { Card } from "@/components/ui/card/card";
import PersonalInfoForm from "./PersonalInfoForm";
import { useLocation, useNavigate } from "react-router";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export default function ResidentFormLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = React.useMemo(() => {
    return location.state?.params || {};
  }, [location.state]);

  return (
    <LayoutWithBack title={params.title} description={params.description}>
      <Card className="w-full">
        <PersonalInfoForm params={params} />
      </Card>
    </LayoutWithBack>
  );
}
