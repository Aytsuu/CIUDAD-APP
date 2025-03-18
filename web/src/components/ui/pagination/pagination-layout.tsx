<<<<<<< HEAD
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
=======
import React, { useState, useEffect } from 'react';
import {
  Pagination,
  PaginationContent,
>>>>>>> master
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
<<<<<<< HEAD
} from "@/components/ui/pagination/pagination"

export default function PaginationLayout({className} : {className?: string}){
  return(
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>1</PaginationLink>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" /> 
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
=======
} from "@/components/ui/pagination/pagination";
import { cn } from "@/lib/utils";

interface PaginationLayoutProps {
  className?: string;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function PaginationLayout({ 
  className, 
  totalPages = 10,
  currentPage = 1,
  onPageChange
}: PaginationLayoutProps) {
  const [visibleStart, setVisibleStart] = useState(1);
  
  // Update visible range whenever current page changes
  useEffect(() => {
    // Adjust visible window when navigating
    if (currentPage < visibleStart) {
      // Moving backward
      setVisibleStart(Math.max(1, currentPage));
    } else if (currentPage > visibleStart + 2) {
      // Moving forward
      setVisibleStart(Math.min(totalPages - 2, currentPage - 2));
    }
  }, [currentPage, totalPages, visibleStart]);
  
  // render 3 visible pages
  const renderPageNumbers = () => {
    const pageNumbers = [];
    
    // Calculate end page (ensuring we don't exceed totalPages)
    const visibleEnd = Math.min(visibleStart + 2);
    
    // Add the 3 (or fewer) visible page numbers
    for (let i = visibleStart; i <= visibleEnd; i++) {
      pageNumbers.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink 
            href="#"
            isActive={currentPage === i}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(i);
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return pageNumbers;
  };
  
  // Handler for previous button with sliding effect
  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  // Handler for next button with sliding effect
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  return (
    <div className="flex flex-row items-center gap-x-10">
      <Pagination className={cn("text-darkGray", className)}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#"
              onClick={handlePrevious}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {renderPageNumbers()}
          
          <PaginationItem>
            <PaginationNext 
              href="#"
              onClick={handleNext}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
>>>>>>> master
}
