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
