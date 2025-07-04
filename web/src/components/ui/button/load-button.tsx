import { Loader2 } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils';
interface LoadButtonProps {
  className?: string;
  children: React.ReactNode;
}

export const LoadButton: React.FC<LoadButtonProps> = ({className, children }) => {
  return (
    <Button type="submit" className={cn("w-32", className)} disabled>
      <Loader2 className='animate-spin'/>
      {children}
    </Button>
  )
}