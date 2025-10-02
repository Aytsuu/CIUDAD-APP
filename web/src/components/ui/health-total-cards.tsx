// components/ui/card/card-layout-enhanced.tsx
import { ReactNode } from "react";

interface EnhancedCardLayoutProps {
  title: string;
  description: string;
  value: string | number;
  valueDescription?: string;
  icon: ReactNode;
  cardClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function EnhancedCardLayout({ 
  title, 
  description, 
  value, 
  valueDescription,
  icon,
  cardClassName = "",
  headerClassName = "",
  contentClassName = ""
}: EnhancedCardLayoutProps) {
  return (
    <div className={`border shadow-sm rounded-lg bg-white ${cardClassName}`}>
      <div className={`p-4 ${headerClassName}`}>
        <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className={`p-4 pt-0 ${contentClassName}`}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{value}</span>
            {valueDescription && (
              <span className="text-xs text-muted-foreground">{valueDescription}</span>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}