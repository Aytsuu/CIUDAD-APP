import React from "react";
import {
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Sheet,
} from "./sheet";

export function SheetLayout({trigger, title, description, content, footer, contentClassname, onOpenChange} : {
  trigger: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  contentClassname?: string;
  onOpenChange?: () => void;
}) {
  return (
    <Sheet onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent className={contentClassname}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {description}
          </SheetDescription>
        </SheetHeader>
        {content}
        {footer && 
          <SheetFooter>
            {footer}
          </SheetFooter>
        }
      </SheetContent>
    </Sheet>
  );
}
