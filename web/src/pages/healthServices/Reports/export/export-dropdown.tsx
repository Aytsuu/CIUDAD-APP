// components/ui/export-dropdown.tsx
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button/button";

interface ExportDropdownProps {
  onExportCSV: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  align?: "start" | "center" | "end";
}

export function ExportDropdown({
  onExportCSV,
  onExportExcel,
  onExportPDF,
  className = "",
  size = "default",
  variant = "outline",
  align = "end",
}: ExportDropdownProps) {
  return (
    <div className={`w-full ${className}`.trim()}>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
        variant={variant}
        size={size}
        className="flex items-center gap-2 w-full"
        >
        <Download className="h-4 w-4" />
        <span>Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuItem onClick={onExportCSV}>
        Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportExcel}>
        Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPDF}>
        Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}