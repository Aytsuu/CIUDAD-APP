import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import AllChildHealthRecordsTable from "./ChildHR_all_records";

export default function MainChildHealthRecords() {
  return (
    <MainLayoutComponent title="Child Health Record" description="Manage and View Child's Record">
      <AllChildHealthRecordsTable />
    </MainLayoutComponent>
  );
}