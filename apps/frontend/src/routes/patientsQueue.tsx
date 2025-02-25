import path from "path";
import MainPatientQueueTable from "@/pages/PATIENTSQUEUE/PATIENTSQUEUE/mainPatientsQueue";
import ProcessingQueueTable from "@/pages/PATIENTSQUEUE/PROCESSINGQUEUE/processingQueueTable";
    export const patientQueue=[
        {
            path: '/',
            element: <MainPatientQueueTable/>
          },
          {
            path: '/processingQueue',
            element: <ProcessingQueueTable/>
          }



    ]