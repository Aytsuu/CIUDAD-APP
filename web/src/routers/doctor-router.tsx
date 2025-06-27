
// import NonPHMedicalForm from "@/pages/Doctor/MedicalConNoPH";
import PendingMedicalConsultationRecords from "@/pages/healthServices/doctor/medical-con/tables/forwarded-record";
import PendingDisplayMedicalConsultation from "@/pages/healthServices/doctor/medical-con/medcon-form";
import PrescriptionMedicineStocks from "@/pages/healthServices/doctor/medical-con/med-presciption";
import SoapForm from "@/pages/healthServices/doctor/medical-con/soap-form";
import PhysicalExamForm from "@/pages/healthServices/doctor/medical-con/physical-exam";
import path from "path";

export const doctorRouting = [
  // 
  {
    path: "/pending-medical-con",
    element : <PendingMedicalConsultationRecords/>
  } ,  {
    path: "/pending-medical-con-form",
    element : <PendingDisplayMedicalConsultation/>
  } ,
  {
    path:"/prescription-medicinestocks",
    element:<PrescriptionMedicineStocks/>
  },
  {
    path:"/soap-form",
    element:<SoapForm/>
  },
  {
    path:"/physical-examform",
    element:<PhysicalExamForm/>
  }


];
