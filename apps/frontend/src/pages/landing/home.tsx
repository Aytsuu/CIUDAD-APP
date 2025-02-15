import SanRoqueLogo from '@/assets/images/sanRoqueLogo.svg'
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function Home(){
    return (
        <div className="w-full h-full">
            <div>

            </div>
        </div>
    );
}

const ContentContainer = ({className} : {className: string}) => (
    <div className={cn('w-full h-full', className)}>

    </div>
)