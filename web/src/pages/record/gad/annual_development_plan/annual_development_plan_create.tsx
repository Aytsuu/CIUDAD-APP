import React, { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createAnnualDevPlan } from "./restful-api/annualPostAPI";
import { toast } from "sonner";

interface BudgetItem {
  name: string;
  pax: string;
  price: string;
}

export default function AnnualDevelopmentPlanCreate() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    dev_date: "",
    dev_client: "",
    dev_issue: "",
    dev_project: "",
    dev_res_person: "",
    dev_indicator: "",
    dev_gad_budget: "0",
    staff: "00001250609", // Default staff ID, you might want to make this dynamic
  });
  const [budgetItems, setBudgetItems] = useState<{gdb_name: string, gdb_pax: string, gdb_price: string}[]>([]);
  const [currentBudgetItem, setCurrentBudgetItem] = useState({
    gdb_name: "",
    gdb_pax: "",
    gdb_price: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBudgetItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentBudgetItem(prev => ({ ...prev, [name]: value }));
  };

  const addBudgetItem = () => {
    if (currentBudgetItem.gdb_name && currentBudgetItem.gdb_pax && currentBudgetItem.gdb_price) {
      setBudgetItems(prev => [...prev, currentBudgetItem]);
      // Update total budget
      const totalBudget = budgetItems.reduce((sum, item) => sum + parseFloat(item.gdb_price), 0) + parseFloat(currentBudgetItem.gdb_price);
      setFormData(prev => ({ ...prev, dev_gad_budget: totalBudget.toString() }));
      setCurrentBudgetItem({ gdb_name: "", gdb_pax: "", gdb_price: "" });
    }
  };

  const clearBudgetItem = () => {
    setCurrentBudgetItem({ gdb_name: "", gdb_pax: "", gdb_price: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = { ...formData, budgets: budgetItems };
      await createAnnualDevPlan(payload);
      toast.success("Annual development plan created successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error creating annual development plan:", error);
      toast.error("Failed to create annual development plan");
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
          <h1 className="font-semibold text-2xl text-darkBlue2">ANNUAL DEVELOPMENT PLAN YEAR 2024</h1>
        </div>
        <p className="text-sm text-gray-600 ml-10">Create a new annual development plan for the year 2024</p>
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
                      name="gdb_name"
                      value={currentBudgetItem.gdb_name}
                      onChange={handleBudgetItemChange}
                      className="border rounded-md px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <label className="text-sm font-medium mb-2 text-gray-700">Pax</label>
                    <input
                      type="text"
                      name="gdb_pax"
                      value={currentBudgetItem.gdb_pax}
                      onChange={handleBudgetItemChange}
                      className="border rounded-md px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <label className="text-sm font-medium mb-2 text-gray-700">Price</label>
                    <input
                      type="text"
                      name="gdb_price"
                      value={currentBudgetItem.gdb_price}
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
                            {item.gdb_name} - {item.gdb_pax} - ₱{item.gdb_price}
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
                {isLoading ? "Saving..." : "Save"}
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
