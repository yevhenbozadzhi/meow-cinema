"use client";

import { PaginationProps } from "@/lib/types";
import Button from "./Button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex flex-row items-center justify-center gap-4 mt-4 ${className}`}
    >
      <Button
        type="button"
        disabled={currentPage <= 1 || loading}
        onClick={() => onPageChange(currentPage - 1)}
        className=""
      >
        <ArrowLeft className="w-4 h-4" />
      </Button>

      <span className="text-sm text-gray-300">
        Page {currentPage} / {totalPages}
      </span>

      <Button
        type="button"
        disabled={currentPage >= totalPages || loading}
        onClick={() => onPageChange(currentPage + 1)}
        className=""
      >
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
