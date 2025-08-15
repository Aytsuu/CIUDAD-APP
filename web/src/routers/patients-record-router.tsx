import PatientsRecord from "@/pages/record/health/patientsRecord/PatientsRecordMain"
import CreatePatientRecord from "@/pages/record/health/patientsRecord/CreatePatientRecord"
import ViewPatientsRecord from "@/pages/record/health/patientsRecord/ViewDisplay/Main"

export const patientsRecordRouter = [

    {
        path: 'patients-record-main',
        element: <PatientsRecord />
    },
    
    {
        path: 'create-patients-record',
        element: <CreatePatientRecord />
    },
    {
        path: 'view-patients-record',
        element: <ViewPatientsRecord />
    },
 ]
 