// components/pages/Page2.tsx
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {PageProps} from "./type"

export default function Page9({ state, onBack, onNext }: PageProps) {
  return (
    <div className="min-h-[500px] flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Page 2: Detailed Analysis</h2>
        <p className="text-gray-600">Analyzing data for: <strong>{state.monthName}</strong></p>
      </div>
      
      <div className="flex-1">
        <div className="bg-green-50 p-6 rounded-lg mb-6">
          <h3 className="font-semibold text-green-900 mb-3">Analysis Section</h3>
          <p className="text-green-700">This page contains detailed analysis for {state.monthName}</p>
        </div>
        
        {/* Add your page 2 specific content here */}
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Analysis Item 1</h4>
            <p className="text-sm text-gray-600">Content for analysis...</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Analysis Item 2</h4>
            <p className="text-sm text-gray-600">More analysis content...</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-8 pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back 
        </Button>
        
        <Button onClick={onNext}>
          Continue 
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}