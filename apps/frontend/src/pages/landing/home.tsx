import SanRoqueLogo from '@/assets/images/sanRoqueLogo.svg'
import { Label } from '@/components/ui/label';

export default function Home(){
    return (
        <div className="w-full h-[100vh] bg-snow flex flex-row">
            <div className="w-full h-full flex flex-col justify-center items-center gap-10">
                <img src={SanRoqueLogo} className='w-[25%] h-[25%]'></img>
                <div className='w-full flex flex-col items-center'>
                    <Label className='text-[25px] font-semibold'>BARANGAY SAN ROQUE (CIUDAD)</Label>
                    <Label></Label>
                </div>
            </div>
        </div>
    );
}