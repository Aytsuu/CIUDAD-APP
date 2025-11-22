import React, { useState } from 'react';
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageProps } from "./type";

interface FormData {
  [key: string]: {
    '10-14': string;
    '15-19': string;
    '20-49': string;
    total: string;
  };
}

export default function Page2({ onBack, onNext }: PageProps) {
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
        { id: '1', text: '1. Women who gave birth w/ at least 4 prenatal check-ups (01 Jan-Sept 2025 only)' },
        { id: '2', text: '2. Total No. of women who delivered and completed at least 8 ANC' },
        { id: '2a', text: '2.a. No. of women who delivered and provided 1st to 8th ANC on schedule' },
        { id: '2b', text: '2.b. No. of women who delivered and completed at least 8ANC TRANS IN from other LGUs' },
        { id: '3', text: '3. Total No. of Women who delivered and were tracked during pregnancy =(2a+3b)-3c' },
        { id: '3a', text: '3.a. No. of Women who delivered and who were tracked during pregnancy' },
        { id: '3b', text: '3.b. No. of TRANS IN from other LGUs (with MOV)' },
        { id: '3c', text: '3.c. No. of TRANS OUT (with MOV) before completing 8ANC' },
        { id: '4', text: '4. No. of pregnant women assessed of their nutritional status during the 1st trimester' },
        { id: '4a', text: '4.a. normal BMI' },
        { id: '4b', text: '4.b. low BMI' },
        { id: '4c', text: '4.c. high BMI' },
        { id: '5', text: '5. No. of pregnant women for the first time given at least 2 doses of Td-containing vaccine' },
        { id: '6', text: '6. No. of pregnant women for the 2nd or more times given at least 3 doses of tetanus-diphtheria-containing vaccine (Td2 Plus)' },
        { id: '7', text: '7. No. of pregnant women who completed the dose of iron with folic acid supplementation' },
        { id: '8', text: '8. No. of pregnant women who completed the dose of Multiple Micronutrient Supplementation' },
        { id: '9', text: '9. No. of High risk pregnant women who completed doses of calcium carbonate supplementation' },
        { id: '10', text: '10. No. of pregnant women given one dose of deworming tablet' },
        { id: '11', text: '11. No. of pregnant women screened for syphilis' },
        { id: '12', text: '12. No. of pregnant women tested positive for syphilis' },
        { id: '13', text: '13. No. of pregnant women screened for Hepatitis B' },
        { id: '14', text: '14. No. of pregnant women tested positive for Hepatitis B' },
        { id: '15', text: '15. No. of pregnant women screened for HIV' },
        { id: '16', text: '16. No. of pregnant women screened reactive for HIV' },
        { id: '17', text: '17. No. of pregnant women screened for Anemia' },
        { id: '18', text: '18. No. of pregnant women diagnosed with anemia' },
        { id: '19', text: '19. No. of pregnant women screened for Gestational Diabetes Mellitus' },
        { id: '20', text: '20. No. of pregnant women tested positive for Gestational Diabetes Mellitus' },
      ]
    },
    {
      title: "Postpartum and Newborn Care",
      rows: [
        { id: '21', text: '21. No. of postpartum women together with their newborn who completed at least 2 postpartum check-ups (for 01 Jan to 02 May 2025 only)' },
        { id: '22', text: '22. Total no. of women who delivered and completed at least 4 PNC =(22a+22b)' },
        { id: '22a', text: '22.a. No. of women who delivered and provided 1st to 4th PNC on schedule' },
        { id: '22b', text: '22.b. No. of women who delivered and completed at least 4 PNC TRANS IN from other LGUs' },
        { id: '23', text: '23. Total No. of women who delivered and were tracked during pregnancy =(23a+23b)-23c' },
        { id: '23a', text: '23.a. No. of Women who delivered and who were tracked during pregnancy' },
        { id: '23b', text: '23.b. No. of TRANS IN from other LGUs (with MOV)' },
        { id: '23c', text: '23.c. No. of TRANS OUT (with MOV) before completing 4 PNC' },
        { id: '24', text: '24. No. of postpartum women who completed iron with folic acid supplementation' },
        { id: '25', text: '25. No. of postpartum women who received Vitamin A supplementation' },
      ]
    }
  ];

  return (
    <div className="min-h-[500px] flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Page 2:  Prenatal Care Services and Postpartum and Newborn Care Section</h2>
        {/* <p className="text-gray-600">
          Reporting for: <strong>{state.monthName}</strong>
        </p> */}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-300">
                  <th className="border border-gray-400 p-2 text-center text-[20px]" colSpan={3}>MUNICIPALITY</th>
                  <th className="border border-gray-400 p-2 text-center">MUNCITY</th>
                  <th className="border border-gray-400 p-2 text-center text-[16px]" colSpan={3}>MONTH</th>
                </tr>
                <tr className="bg-gray-300">
                  <th className="border border-gray-400 p-2 text-left text-[16px]" colSpan={3}>Prenatal Care Services</th>
                  <th className="border border-gray-400 p-2 text-center">10-14</th>
                  <th className="border border-gray-400 p-2 text-center">15-19</th>
                  <th className="border border-gray-400 p-2 text-center">20-49</th>
                  <th className="border border-gray-400 p-2 text-center">Total</th>
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
                        <td className="border border-gray-400 p-2 text-xs" colSpan={3}>
                          {row.text}
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
                            value={formData[row.id]?.total || ''}
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