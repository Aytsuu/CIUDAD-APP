import PatientsRecord from "@/pages/record/health/patientsRecord/PatientsRecordMain"
import CreatePatientRecord from "@/pages/record/health/patientsRecord/CreatePatientRecord"
import ViewPatientsRecord from "@/pages/record/health/patientsRecord/ViewDisplay/Main"

export const patientsRecordRouter = [

    {
        path: 'patientrecords',
        element: <PatientsRecord />
    },
    
    {
        path: 'patientrecords/form',
        element: <CreatePatientRecord />
    },
    {
        path: 'patientrecords/view',
        element: <ViewPatientsRecord />
    },
 ]
 