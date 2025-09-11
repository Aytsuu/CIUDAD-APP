// components/AccordionSection.tsx
import {
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
  } from "@/components/ui/accordion";
  import { Card, CardContent } from "@/components/ui/card";
  import { ReactNode } from "react";
  
  interface AccordionSectionProps {
    value: string;
    title: string;
    icon: ReactNode;
    children: ReactNode;
    className?: string;
  }
  
  export function AccordionSection({
    value,
    title,
    icon,
    children,
    className = "",
  }: AccordionSectionProps) {
    return (
      <AccordionItem 
        value={value} 
        className={`border rounded-lg shadow-sm bg-white ${className}`}
      >
        <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180 hover:no-underline">
          <div className="flex items-center">
            <span className="text-gray-600 mr-3">{icon}</span>
            {title}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Card className="mb-0 border-t rounded-t-none shadow-none">
            <CardContent className="overflow-x-auto p-6">
              {children}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    );
  }