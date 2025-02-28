import path from "path";
import MainPatientQueueTable from "@/pages/healthQueueing/patientsQueue/mainPatientsQueue";
import ProcessingQueueTable from "@/pages/healthQueueing/processingQueue/processingQueueTable";
    export const patientQueue=[
        {
            path: '/healthQueueing',
            element: <MainPatientQueueTable/>
          },
          {
            path: '/processingQueue', 
            element: <ProcessingQueueTable/>
          }



    ]