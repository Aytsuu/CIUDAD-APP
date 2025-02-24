import { createBrowserRouter, RouterProvider } from 'react-router'
import { drr_router } from "./routes/drr-router";
import { landing_router } from './routes/landing-router';
import { administration_router } from './routes/administration-router';

const router = createBrowserRouter([
  ...drr_router, 
  ...landing_router,
  ...administration_router
])

function App() {

  return (
    <>
      <RouterProvider router={router} />

    </> 
  )
}

export default App;
