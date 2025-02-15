import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Link, Outlet } from 'react-router';

const NavItemList = [
    {
        path: "/home",
        title: "Home"
    },
    {
        path: "/about-us",
        title: "About Us"
    },
    {
        path: "/services",
        title: "Services"
    },
    {
        path: "/donation",
        title: "Donation"
    },
    {
        path: "/barangay-council",
        title: "Barangay Council"
    },  
    {
        path: "/download-app",
        title: "Download App"
    },
]

export default function LandingLayout(){
    return(
        <div className="w-screen h-screen bg-snow">
            <header className='fixed w-full bg-white flex justify-center p-3 border shadow-md'>
                <div className='w-4/5 flex justify-end'>
                    <nav className='flex items-center gap-4 xl:gap-6'>
                        {NavItemList.map((navitem) => (
                            <Link key={navitem.path} to={navitem.path}>
                                <Label className='cursor-pointer'>{navitem.title}</Label>
                            </Link>
                        ))}
                        <Link to="/sign-in">
                            <Button >Sign In</Button>
                        </Link>
                    </nav>
                </div>
            </header>
            <Outlet />
        </div>
    )
}