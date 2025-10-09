// components/pages/Page2.tsx
import { Button } from "@/components/ui/button/button";
import {  ChevronRight } from "lucide-react";
import {Page1Props} from "./type"

export default function Page1({ state, onNext }: Page1Props) {
    return (
      <div className="min-h-[500px] flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Page 1: Monthly Overview</h2>
          <p className="text-gray-600">Working with: <strong>{state.monthName}</strong></p>
        </div>
        
        <div className="flex-1">
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Monthly Summary</h3>
            <p className="text-blue-700">This is the overview page for {state.monthName}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-medium mb-2">Month Information</h4>
              <p className="text-sm text-gray-600">ID: {state.month}</p>
              <p className="text-sm text-gray-600">Name: {state.monthName}</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-medium mb-2">Page 1 Content</h4>
              <p className="text-sm text-gray-600">Add your specific content here</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-8 pt-6 border-t">
          <Button onClick={onNext}>
            Continue 
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }