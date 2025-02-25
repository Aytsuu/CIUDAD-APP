
import {createBrowserRouter} from "react-router"
import { RouterProvider } from "react-router"
import { childHealthServices } from "./routes/childHealthServices"
const router= createBrowserRouter([
...childHealthServices

])
function App() {
  return (
    <>
      <RouterProvider router={router}/>
    </> 
  )
}

export default App
  