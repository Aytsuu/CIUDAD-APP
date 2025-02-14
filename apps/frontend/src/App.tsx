import { createBrowserRouter, RouterProvider} from 'react-router'
import Home from "./pages/landing/home"
import SignIn from "./pages/landing/sign-in"

const router = createBrowserRouter([
  {
    path: "/home",
    element: <Home/>
  },
  {
    path: "/sign-in",
    element: <SignIn/>
  }
])

function App() {

  return (
    <>
      <RouterProvider router={router}/>
    </> 
  )
}

export default App
  