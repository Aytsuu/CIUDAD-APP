import CreateAnnouncements from "./pages/announcement/CreateAnnouncement";


import { createBrowserRouter, RouterProvider } from 'react-router'
import { landing_router } from './routes/landing-router';
import { main_router } from './routes/main-router';

const router = createBrowserRouter([
  ...main_router,
  { path: "*", element: ""}
])

function App() {

  return <RouterProvider router={router} />

}
export default App;