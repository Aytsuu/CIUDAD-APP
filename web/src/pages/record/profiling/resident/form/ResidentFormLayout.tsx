import { useLocation } from "react-router";
import { Type } from "../../profilingEnums";
import ResidentCreateForm from "./ResidentCreateForm";
import ResidentViewForm from "./ResidentViewForm";
import ResidentRequestForm from "./ResidentRequestForm";

export default function ResidentFormLayout() {
   // ============= STATE INITIALIZATION ===============
  const { state } = useLocation();
  const { type = Type.Create } = state?.params || {};

  // ==================== RENDER ====================
  switch (type) {
    case Type.Viewing:
      return <ResidentViewForm params={state?.params} />;
    case Type.Request:
      return <ResidentRequestForm params={state?.params} />;
    default:
      return <ResidentCreateForm params={state?.params} />;
  }
}