import React, { useState } from 'react';
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageProps } from "./type";

interface FormData {
  [key: string]: {
    '<10': string;
    '10-14': string;
    '15-19': string;
    '20-49': string;
    total: string;
  };
}

export default function Page3({ onBack, onNext }: PageProps) {
  const [formData, setFormData] = useState<FormData>({});

  const handleInputChange = (rowId: string, column: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [column]: value
      }
    }));
  };

  const formSections = [
    {
      title: "",
      rows: [
        { id: '1', text: '' },
        { id: '2', text: '' },
        { id: '2a', text: '' },
        { id: '2b', text: '' },
        { id: '3', text: '' },
        { id: '3a', text: '' },
        { id: '3b', text: '' },
        { id: '3c', text: '' },
        { id: '4', text: '' },
        { id: '4a', text: '' },
        { id: '4b', text: '' },
        { id: '4c', text: '' },
        { id: '5', text: '' },
        { id: '6', text: '' },
        { id: '7', text: '' },
        { id: '8', text: '' },
        { id: '9', text: '' },
        { id: '10', text: '' },
        { id: '11', text: '' },
        { id: '12', text: '' },
        { id: '13', text: '' },
        { id: '14', text: '' },
        { id: '15', text: '' },
        { id: '16', text: '' },
        { id: '17', text: '' },
        { id: '18', text: '' },
        { id: '19', text: '' },
        { id: '20', text: '' },
      ]
    },
    {
      title: "Postpartum and Newborn Care",
      rows: [
        { id: '21', text: '' },
        { id: '22', text: '' },
        { id: '22a', text: '' },
        { id: '22b', text: '' },
        { id: '23', text: '' },
        { id: '23a', text: '' },
        { id: '23b', text: '' },
        { id: '23c', text: '' },
        { id: '24', text: '' },
        { id: '25', text: '' },
      ]
    }
  ];

  return (
    <div className="min-h-[500px] flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Page 3:  Prenatal Care Services and Postpartum and Newborn Care Section</h2>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-300">
                  <th className="border border-gray-400 p-2 text-center text-[20px]" colSpan={1}>MUNICIPALITY</th>
                  <th className="border border-gray-400 p-2 text-center text-[16px]" colSpan={6}>MONTH</th>
                </tr>
                <tr className="bg-gray-300">
                  <th className="border border-gray-400 p-2 text-left text-[16px]" colSpan={2}>Intrapartum Care and Delivery Outcome</th>
                  <th className="border border-gray-400 p-2 text-center">{"<10"}</th>
                  <th className="border border-gray-400 p-2 text-center">10-14 years old</th>
                  <th className="border border-gray-400 p-2 text-center">15-19 years old</th>
                  <th className="border border-gray-400 p-2 text-center">20-49 years old</th>
                  <th className="border border-gray-400 p-2 text-center">Total Month 2025</th>
                </tr>
                <tr className="bg-gray-300">
                  <th className="border border-gray-400 p-2 text-left text-sm" colSpan={2}>1. Total No. of deliveries</th>
                  <th className="border border-gray-400 p-2 text-center"></th>
                  <th className="border border-gray-400 p-2 text-center"></th>
                  <th className="border border-gray-400 p-2 text-center"></th>
                  <th className="border border-gray-400 p-2 text-center"></th>
                  <th className="border border-gray-400 p-1 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {formSections.map((section, sectionIdx) => (
                  <React.Fragment key={sectionIdx}>
                    {sectionIdx === 1 && (
                      <tr className="bg-gray-300">
                        <td className="border border-gray-400 p-2 font-bold text-[14px]" colSpan={7}>
                          {section.title}
                        </td>
                      </tr>
                    )}
                    
                    {section.rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="border border-gray-400 p-2 text-xs" colSpan={2}>
                          {row.text}
                        </td>
                        <td className="border border-gray-400 p-1">
                          <input
                            type="text"
                            className="w-full px-1 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={formData[row.id]?.['<10'] || ''}
                            onChange={(e) => handleInputChange(row.id, '10', e.target.value)}
                          />
                        </td>
                        <td className="border border-gray-400 p-1">
                          <input
                            type="text"
                            className="w-full px-1 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={formData[row.id]?.['10-14'] || ''}
                            onChange={(e) => handleInputChange(row.id, '10-14', e.target.value)}
                          />
                        </td>
                        <td className="border border-gray-400 p-1">
                          <input
                            type="text"
                            className="w-full px-1 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={formData[row.id]?.['15-19'] || ''}
                            onChange={(e) => handleInputChange(row.id, '15-19', e.target.value)}
                          />
                        </td>
                        <td className="border border-gray-400 p-1">
                          <input
                            type="text"
                            className="w-full px-1 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={formData[row.id]?.['20-49'] || ''}
                            onChange={(e) => handleInputChange(row.id, '20-49', e.target.value)}
                          />
                        </td>
                        <td className="border border-gray-400 p-1">
                          <input
                            type="text"
                            className="w-full px-1 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={formData[row.id]?.['total'] || ''}
                            onChange={(e) => handleInputChange(row.id, 'total', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
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