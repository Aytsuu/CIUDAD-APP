import AppointmentTable from "./pages/APPOINTMENTSREQUEST/appoinmentTable";
import { healthAppointment } from "./routes/sample";
import { createBrowserRouter, RouterProvider } from "react-router";

const router = createBrowserRouter([...healthAppointment]);
function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
