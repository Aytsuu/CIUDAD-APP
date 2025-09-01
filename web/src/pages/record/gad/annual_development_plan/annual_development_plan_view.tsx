import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getAnnualDevPlansByYear } from "./restful-api/annualGetAPI";
import { toast } from "sonner";

interface AnnualDevelopmentPlanViewProps {
  year: number;
  onBack: () => void;
}

interface BudgetItem {
  name: string;
  pax: string;
  price: string;
}

interface DevelopmentPlan {
  dev_id: number;
  dev_date: string;
  dev_client: string;
  dev_issue: string;
  dev_project: string;
  dev_indicator: string;
  dev_res_person: string;
  staff: string;
  dev_gad_items?: BudgetItem[];
  total?: string;
}

export default function AnnualDevelopmentPlanView({ year, onBack }: AnnualDevelopmentPlanViewProps) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, [year]);

  const fetchPlans = async () => {
    try {
      const data = await getAnnualDevPlansByYear(year);
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to fetch annual development plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (devId: number) => {
    navigate(`/gad-annual-development-plan/edit/${devId}`);
  };

  return (
    <div className="bg-snow w-full min-h-screen p-6">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex flex-row items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack}><ChevronLeft /></Button>
          <h1 className="font-semibold text-2xl text-darkBlue2">ANNUAL DEVELOPMENT PLAN YEAR {year}</h1>
        </div>
        <p className="text-xs sm:text-sm text-darkGray ml-12">Manage and monitor your annual development goals</p>
      </div>
      <hr className="border-gray mb-5 sm:mb-4" />
      <div className="flex justify-end mb-2">
        <Link to="/gad-annual-development-plan/create"><Button>+ Create New</Button></Link>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading data...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p>No development plans found for this year.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded border border-gray-200">
          <table className="min-w-full text-sm border border-gray-200 border-collapse">
            <colgroup>
              <col className="w-48" />
              <col className="w-64" />
              <col className="w-56" />
              <col className="w-40" />
              <col className="w-20" />
              <col className="w-24" />
              <col className="w-56" />
            </colgroup>
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b border-gray-200">
                <th className="px-3 py-2 text-left align-bottom border border-gray-200" rowSpan={2}>GENDER ISSUE OR<br />GAD MANDATE</th>
                <th className="px-3 py-2 text-left align-bottom border border-gray-200" rowSpan={2}>GAD PROGRAM/ PROJECT/ ACTIVITY</th>
                <th className="px-3 py-2 text-left align-bottom border border-gray-200" rowSpan={2}>PERFORMANCE INDICATOR AND TARGET</th>
                <th className="px-3 py-2 text-center align-bottom border border-gray-200" colSpan={3}>GAD BUDGET</th>
                <th className="px-3 py-2 text-left align-bottom border border-gray-200" rowSpan={2}>RESPONSIBLE PERSON</th>
              </tr>
              <tr className="bg-gray-100 text-gray-700 border-b border-gray-200">
                <th className=""></th>
              </tr>
              <tr className="bg-blue-50 text-blue-900 font-semibold border-b border-blue-100">
                <td className="bg-sky-100 px-3 py-2 border border-blue-200" colSpan={4}>CLIENT FOCUSED</td>
                <th className="bg-sky-100 px-3 py-1 text-center border border-gray-200">pax</th>
                <th className="bg-sky-100 px-3 py-1 text-center border border-gray-200">amount (PHP)</th>
                <th className="bg-sky-100"></th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.dev_id}>
                  <td className="px-3 py-2 align-top border border-gray-200">
                    <div>
                      <div className="font-semibold text-blue-900 underline cursor-pointer">{plan.dev_client}</div>
                      <div className="text-xs mt-2 text-gray-700">{plan.dev_issue}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top border border-gray-200">{plan.dev_project}</td>
                  <td className="px-3 py-2 align-top border border-gray-200">
                    <div>
                      {plan.dev_indicator}
                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(plan.dev_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top border border-gray-200">
                    {plan.dev_gad_items && plan.dev_gad_items.length > 0 ? (
                      plan.dev_gad_items.map((item, idx) => (
                        <div key={idx}>{item.name}</div>
                      ))
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top border border-gray-200">
                    {plan.dev_gad_items && plan.dev_gad_items.length > 0 ? (
                      plan.dev_gad_items.map((item, idx) => (
                        <div key={idx}>{item.pax}</div>
                      ))
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top border border-gray-200">
                    {plan.dev_gad_items && plan.dev_gad_items.length > 0 ? (
                      plan.dev_gad_items.map((item, idx) => (
                        <div key={idx}>₱{item.price}</div>
                      ))
                    ) : (
                      <span>₱{plan.total || '0'}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top border border-gray-200">
                    <ul className="list-disc list-inside">
                      <li>{plan.dev_res_person}</li>
                    </ul>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-3 py-2 text-right border border-gray-200" colSpan={5}>Total</td>
                <td className="px-3 py-2 border border-gray-200">
                  ₱{plans.reduce((sum, plan) => sum + parseFloat(plan.total || '0'), 0).toFixed(2)}
                </td>
                <td className="px-3 py-2 border border-gray-200"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end gap-4 mt-6">
        <Button 
          onClick={() => handleEdit(plans[0]?.dev_id)}
          className="text-white hover:bg-ligh-blue-1000 w-28"
        >
          Edit
        </Button>
        <Button className="bg-red-600 text-white hover:bg-red-700 w-28">Delete</Button>
      </div>
    </div>
  );
} 