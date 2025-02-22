// import WasteIllegalDumping from "./pages/report/waste/waste-illegal-dumping";
import WasteMainScheduling from "./pages/waste-scheduling/waste-main-sched-page"
import {createBrowserRouter, RouterProvider} from 'react-router'


const router = createBrowserRouter([{
  path: '/',
  element: <WasteMainScheduling/>,
},
]);

function App() {

  return (
    <>
    <RouterProvider router={router}/>
    </> 
  )
}

export default App
  