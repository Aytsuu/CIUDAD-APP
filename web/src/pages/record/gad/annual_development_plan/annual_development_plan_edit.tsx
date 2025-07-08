import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { updateAnnualDevPlan } from "./restful-api/annualPutAPI";
import { toast } from "sonner";

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
  dev_gad_budget: string;
  dev_res_person: string;
  staff: string;
}

export default function AnnualDevelopmentPlanEdit() {
  const navigate = useNavigate();
  const { devId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    dev_date: "",
    dev_client: "",
    dev_issue: "",
    dev_project: "",
    dev_res_person: "",
    dev_indicator: "",
    dev_gad_budget: "0",
    staff: "00001250609", // Default staff ID
  });
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [currentBudgetItem, setCurrentBudgetItem] = useState<BudgetItem>({
    name: "",
    pax: "",
    price: "",
  });

  useEffect(() => {
    // Fetch the existing plan data
    const fetchPlanData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/gad/gad-annual-development-plan/${devId}/`);
        const data = await response.json();
        setFormData({
          dev_date: data.dev_date,
          dev_client: data.dev_client,
          dev_issue: data.dev_issue,
          dev_project: data.dev_project,
          dev_res_person: data.dev_res_person,
          dev_indicator: data.dev_indicator,
          dev_gad_budget: data.dev_gad_budget,
          staff: data.staff,
        });
        setBudgetItems(data.budgets || []);
      } catch (error) {
        console.error("Error fetching plan data:", error);
        toast.error("Failed to fetch plan data");
      }
    };

    if (devId) {
      fetchPlanData();
    }
  }, [devId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBudgetItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentBudgetItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addBudgetItem = () => {
    if (currentBudgetItem.name && currentBudgetItem.pax && currentBudgetItem.price) {
      setBudgetItems(prev => [...prev, currentBudgetItem]);
      // Update total budget
      const totalBudget = budgetItems.reduce((sum, item) => sum + parseFloat(item.price), 0) + parseFloat(currentBudgetItem.price);
      setFormData(prev => ({
        ...prev,
        dev_gad_budget: totalBudget.toString()
      }));
      setCurrentBudgetItem({ name: "", pax: "", price: "" });
    }
  };

  const clearBudgetItem = () => {
    setCurrentBudgetItem({ name: "", pax: "", price: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!devId) {
        throw new Error("No development plan ID provided");
      }
      const payload = { ...formData, budgets: budgetItems };
      await updateAnnualDevPlan(parseInt(devId), payload);
      toast.success("Annual development plan updated successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error updating annual development plan:", error);
      toast.error("Failed to update annual development plan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-snow w-full min-h-screen p-6">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex flex-row items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-gray-100" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-2xl text-darkBlue2">EDIT ANNUAL DEVELOPMENT PLAN</h1>
        </div>
        <p className="text-sm text-gray-600 ml-10">Update the annual development plan details</p>
      </div>
      <hr className="border-gray mb-6" />
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full max-w-[1600px]">
            <div className="flex flex-row gap-6 mb-6">
              <div className="flex flex-col w-1/4">
                <label className="text-sm font-medium mb-2 text-gray-700">Date</label>
                <input 
                  type="date" 
                  name="dev_date"
                  value={formData.dev_date}
                  onChange={handleInputChange}
                  className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                />
              </div>
              <div className="flex flex-col w-3/4">
                <label className="text-sm font-medium mb-2 text-gray-700">Client Focused</label>
                <select 
                  name="dev_client"
                  value={formData.dev_client}
                  onChange={handleInputChange}
                  className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select client</option>
                  <option value="Women">Women</option>
                  <option value="LGBTQIA+">LGBTQIA+</option>
                  <option value="Responsible Person">Responsible Person</option>
                  <option value="Senior">Senior</option>
                  <option value="PWD">PWD</option>
                  <option value="Solo Parent">Solo Parent</option>
                  <option value="Erpat">Erpat</option>
                  <option value="Children">Children</option>
                </select>
              </div>
            </div>

            <div className="flex flex-row gap-6 mb-6">
              <div className="flex flex-col w-1/3">
                <label className="text-sm font-medium mb-2 text-gray-700">Gender Issue or GAD Mandate</label>
                <textarea 
                  name="dev_issue"
                  value={formData.dev_issue}
                  onChange={handleInputChange}
                  className="border rounded-md px-3 py-2 w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                  placeholder="Enter gender issue or GAD mandate..."
                  required
                />
              </div>
              <div className="flex flex-col w-1/3">
                <label className="text-sm font-medium mb-2 text-gray-700">GAD Program/ Project/ Activity</label>
                <textarea 
                  name="dev_project"
                  value={formData.dev_project}
                  onChange={handleInputChange}
                  className="border rounded-md px-3 py-2 w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                  placeholder="Enter GAD program details..."
                  required
                />
              </div>
              <div className="flex flex-col w-1/3">
                <label className="text-sm font-medium mb-2 text-gray-700">Performance Indicator and Target</label>
                <textarea 
                  name="dev_indicator"
                  value={formData.dev_indicator}
                  onChange={handleInputChange}
                  className="border rounded-md px-3 py-2 w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                  placeholder="Enter performance indicators..."
                  required
                />
              </div>
            </div>

            <div className="flex flex-row gap-6 mb-6">
              <div className="flex flex-col w-1/3">
                <label className="text-sm font-medium mb-2 text-gray-700">Responsible Person</label>
                <input 
                  type="text" 
                  name="dev_res_person"
                  value={formData.dev_res_person}
                  onChange={handleInputChange}
                  placeholder="Enter Responsible Person" 
                  className="border rounded-md px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                />
              </div>

              <div className="flex flex-col w-2/3">
                <div className="flex flex-row gap-4">
                  <div className="flex flex-col w-1/2 border rounded-lg p-4 bg-gray-50">
                    <label className="text-sm font-medium mb-3 text-gray-700">GAD Budget</label>
                    <label className="text-sm font-medium mb-2 text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={currentBudgetItem.name}
                      onChange={handleBudgetItemChange}
                      className="border rounded-md px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <label className="text-sm font-medium mb-2 text-gray-700">Pax</label>
                    <input
                      type="text"
                      name="pax"
                      value={currentBudgetItem.pax}
                      onChange={handleBudgetItemChange}
                      className="border rounded-md px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <label className="text-sm font-medium mb-2 text-gray-700">Price</label>
                    <input
                      type="text"
                      name="price"
                      value={currentBudgetItem.price}
                      onChange={handleBudgetItemChange}
                      className="border rounded-md px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        onClick={addBudgetItem}
                        className="text-white hover:bg-blue-700 text-sm px-4 py-2 rounded-md"
                      >
                        Add
                      </Button>
                      <Button 
                        type="button"
                        onClick={clearBudgetItem}
                        className="bg-red-600 text-white hover:bg-red-700 text-sm px-4 py-2 rounded-md"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col w-1/2 border rounded-lg p-4 bg-gray-50">
                    <label className="text-sm font-medium mb-3 text-gray-700">Budget Table</label>
                    <div className="border rounded-md px-3 py-2 w-full h-[180px] overflow-y-auto">
                      {budgetItems.map((item, index) => (
                        <div key={index} className="mb-2">
                          <p className="text-sm">
                            {item.name} - {item.pax} - ₱{item.price}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button 
                type="submit"
                disabled={isLoading}
                className="text-white hover:bg-blue-700 px-6 py-2 rounded-md text-sm font-medium"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                type="button"
                onClick={() => navigate(-1)}
                className="bg-red-600 text-white hover:bg-red-700 px-6 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 