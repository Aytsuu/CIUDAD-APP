import {createBrowserRouter, RouterProvider} from 'react-router'
import DonationTracker from './pages/clerk-donation-main';

const router = createBrowserRouter([{
  path: '/',
  element: <DonationTracker/>,
},
]);

function App() {

  return (
    <>
      <RouterProvider router={router}/>
    </> 
  )
}

export default App;
