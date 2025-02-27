import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import { gad_router } from './routes/gad-router';

const router = createBrowserRouter([
  ...gad_router
])

function App() {

  return (
    <>
      <RouterProvider router={router}/>
   </>
  )
}

export default App;
