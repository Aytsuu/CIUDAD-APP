import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router";
import { MaternalServices } from "./routes/maternal-services";
const router = createBrowserRouter([
  ...MaternalServices,
])
function App() {
  return (
    <> 
      <RouterProvider router={router}/>
    </> 
  )
}

export default App;
