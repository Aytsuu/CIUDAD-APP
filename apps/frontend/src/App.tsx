import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router-dom";
import { medicalConsultation } from "./routes/medConsultation";

const router = createBrowserRouter([...medicalConsultation]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
