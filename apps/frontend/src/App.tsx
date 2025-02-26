import { administration_router } from "./routes/administration-router";
import { createBrowserRouter, RouterProvider } from 'react-router'

const router = createBrowserRouter([
  ...administration_router
])

function App() {

  return (
    <>
      <RouterProvider router={router}/>
    </> 
  )
}

export default App;
