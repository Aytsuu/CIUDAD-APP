import { Label } from '@/components/ui/label';
import { Link, Outlet } from 'react-router';
import SanRoqueLogo from '@/assets/images/sanRoqueLogo.svg';
import { FaFacebook, FaPhoneAlt } from 'react-icons/fa';
import { GoVerified } from 'react-icons/go';
import DialogLayout from '@/components/ui/dialog/dialog-layout';
import SignIn from '@/pages/landing/sign-in';

const NavItemList = [
  { path: '/home', title: 'Home' },
  { path: '/about', title: 'About' },
  { path: '/services', title: 'Services' },
  { path: '/donation', title: 'Donation' },
  { path: '/barangay-council', title: 'Barangay Council' },
  { path: '/mobile-app', title: 'Mobile App' },
];

export default function LandingLayout() {

    return (
        <div className="w-screen h-screen bg-snow overflow-x-hidden">
            {/* Top Header */}
            <header className="w-full bg-darkBlue1 flex justify-center p-4">
                <div className="w-[90%] text-white/80 flex gap-5">
                    <Label className="font-poppins border-r-2 pr-4 flex gap-1">
                        <GoVerified /> The Official Website of Barangay San Roque
                    </Label>
                    <div className="flex gap-3">
                        <FaFacebook className="hover:text-white cursor-pointer" />
                        <FaPhoneAlt className="hover:text-white cursor-pointer" />
                    </div>
                </div>
            </header>

            {/* Main Header */}
            <header className="w-full bg-white flex justify-center shadow-lg">
                <div className="w-full h-full flex justify-between items-center">
                {/* Logo and Barangay Name */}
                    <div className="w-1/3 h-full flex items-center slope-right p-3 bg-blue">
                        <div className='w-full flex justify-center items-center gap-3'>
                            <img src={SanRoqueLogo} alt="San Roque Logo" className="w-[50px] h-[50px]" />
                            <div className='grid text-white'>
                                <Label className="text-[15px]">BARANGAY SAN ROQUE (CIUDAD)</Label>
                                <Label className="font-poppins">Cebu City</Label>
                            </div>
                        </div>
                    </div>

                {/* Navigation */}
                    <nav className="w-1/2 flex items-center gap-3">
                        {NavItemList.map(({ path, title }) => (
                        <Link key={path} to={path}>
                            <Label className="p-[10px] rounded-lg hover:bg-lightBlue cursor-pointer">{title}</Label>
                        </Link>
                        ))}
                        <DialogLayout
                            trigger={<Label className="pt-2.5 pb-2.5 pl-4 pr-4 bg-[#2563EB] text-white rounded-lg cursor-pointer hover:bg-[#2563EB]/90">Sign in</Label>}
                            className='w-1/4 h-1/2 flex flex-col'
                            title='Sign In'
                            description="Authorized personnel only. Sign in to manage records, oversee programs, and access tools essential for barangay operations."
                            mainContent={
                                <SignIn/>
                            }
                        />
                    </nav>
                </div>
            </header>

            {/* Page Content */}
            <main className='w-full h-full flex justify-center p-8'>
                <Outlet />
            </main>
        </div>
    );
}