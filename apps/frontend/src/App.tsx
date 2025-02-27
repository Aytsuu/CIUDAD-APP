import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router-dom";
import { vaccination } from "./routes/vaccination";

const router = createBrowserRouter([
...vaccination,
])

function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App;