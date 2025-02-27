import {createBrowserRouter, RouterProvider} from 'react-router'
import { donation_router } from './routes/donation-router';

const router = createBrowserRouter([
  ...donation_router
]);

function App() {

  return (
    <>
      <RouterProvider router={router}/>
    </> 
  )
}

export default App;
