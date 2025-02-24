import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import { treasurer_router } from './routes/treasurer-router';


const router = createBrowserRouter([
  ...treasurer_router
])

function App() {

  return (
      <>
       <RouterProvider router={router}/>
      </>
  )
}

export default App;
