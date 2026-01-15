'use client'

import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationDemoProps = {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
};

export function PaginationDemo({ currentPage, totalPages, onPageChange }: PaginationDemoProps) {
  const handlePrevious = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <Pagination>
      <PaginationContent className="w-full justify-between gap-3">
        <PaginationItem>
          <Button
            variant="outline"
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
            aria-disabled={currentPage === 1 ? true : undefined}
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            <ChevronLeft
              className="-ms-1 me-2 opacity-60"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            Previous
          </Button>
        </PaginationItem>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="font-medium text-white">{currentPage}</span>
          <span>/</span>
          <span>{totalPages}</span>
        </div>
        <PaginationItem>
          <Button
            variant="outline"
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
            aria-disabled={currentPage === totalPages ? true : undefined}
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight
              className="-me-1 ms-2 opacity-60"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
