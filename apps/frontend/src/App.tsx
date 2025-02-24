// import PatientsQueueTable from "./pages/PATIENTSQUEUE/patientsQueueTable";
// import PatientQueueForm from "./pages/PATIENTSQUEUE/patientQueueForm";
// import MainPatientQueueTable from "./pages/PATIENTSQUEUE/mainPatientsQueue";
// function App() {

//   return (
//     <> 
//     <MainPatientQueueTable/>
//     </> 
//   )
// }

// export default App;


import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router-dom";
import { patientQueue } from "./routes/patientsQueue";

const router = createBrowserRouter([
...patientQueue,
])

function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App;
