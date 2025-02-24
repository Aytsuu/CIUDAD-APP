import { createBrowserRouter, RouterProvider } from 'react-router'
import { drr_router } from "./routes/drr-router";
import { landing_router } from './routes/landing-router';
import { administration_router } from './routes/administration-router';
import { AppSidebar } from './components/ui/sidebar/app-sidebar';
import { SidebarProvider } from './components/ui/sidebar/sidebar';

const router = createBrowserRouter([
  ...drr_router, 
  ...landing_router,
  ...administration_router
])

function App() {

  return (
    <div>
      <SidebarProvider>
        <AppSidebar/>
      </SidebarProvider>
    {/* <RouterProvider router={router} /> */}
    </div>    
  )

}

export default App;
