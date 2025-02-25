import AppointmentTable from "./pages/APPOINTMENTS/appoinmentTable";
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
