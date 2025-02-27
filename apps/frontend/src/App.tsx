import {createBrowserRouter, RouterProvider} from 'react-router'
import { waste_router } from "./routes/waste-router";

const router = createBrowserRouter([
...waste_router
]);

function App() {

  return (
    <>
    <RouterProvider router={router}/>
    </> 
  )
}

export default App;

export default App;
