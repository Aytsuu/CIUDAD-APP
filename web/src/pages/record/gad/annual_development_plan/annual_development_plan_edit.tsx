import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAnnualDevPlanById, useUpdateAnnualDevPlan } from "./queries/annualDevPlanFetchQueries";
import { toast } from "sonner";

const getClientOptions = () => (
  <>
    <option value="">Select client</option>
    <option value="Women">Women</option>
    <option value="LGBTQIA+">LGBTQIA+</option>
    <option value="Responsible Person">Responsible Person</option>
    <option value="Senior">Senior</option>
    <option value="PWD">PWD</option>
    <option value="Solo Parent">Solo Parent</option>
    <option value="Erpat">Erpat</option>
    <option value="Children">Children</option>
  </>
);

interface BudgetItem {
  gdb_name: string;
  gdb_pax: string;
  gdb_price: string;
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
    dev_activity: "",
    dev_res_person: "",
    dev_indicator: "",
    dev_budget_items: "0",
    staff: "", // Optional staff ID - can be empty
  });
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [currentBudgetItem, setCurrentBudgetItem] = useState<BudgetItem>({
    gdb_name: "",
    gdb_pax: "",
    gdb_price: "",
  });

  const [activityInputs, setActivityInputs] = useState<{activity: string, participants: number}[]>([]);
  const [currentActivityInput, setCurrentActivityInput] = useState('');
  const [activityParticipantCount, setActivityParticipantCount] = useState<number>(1);

  const { data: planData, isLoading: isFetching } = useGetAnnualDevPlanById(devId);

  useEffect(() => {
    if (planData) {
      setFormData({
        dev_date: planData.dev_date,
        dev_client: planData.dev_client,
        dev_issue: planData.dev_issue,
        dev_project: planData.dev_project,
        dev_activity: planData.dev_activity || "",
        dev_res_person: planData.dev_res_person,
        dev_indicator: planData.dev_indicator,
        dev_budget_items: planData.dev_budget_items,
        staff: planData.staff,
      });
      setBudgetItems(planData.budgets || []);
      
      // Parse dev_activity if it exists
      if (planData.dev_activity) {
        try {
          const activities = typeof planData.dev_activity === 'string' 
            ? JSON.parse(planData.dev_activity) 
            : planData.dev_activity;
          setActivityInputs(Array.isArray(activities) ? activities : []);
        } catch (error) {
          console.error('Error parsing dev_activity:', error);
          setActivityInputs([]);
        }
      } else {
        setActivityInputs([]);
      }
    }
  }, [planData]);

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
    if (currentBudgetItem.gdb_name && currentBudgetItem.gdb_pax && currentBudgetItem.gdb_price) {
      setBudgetItems(prev => [...prev, currentBudgetItem]);
      // Update total budget
      const totalBudget = budgetItems.reduce((sum, item) => sum + parseFloat(item.gdb_price), 0) + parseFloat(currentBudgetItem.gdb_price);
      setFormData(prev => ({
        ...prev,
        dev_gad_budget: totalBudget.toString()
      }));
      setCurrentBudgetItem({ gdb_name: "", gdb_pax: "", gdb_price: "" });
    }
  };

  const clearBudgetItem = () => {
    setCurrentBudgetItem({ gdb_name: "", gdb_pax: "", gdb_price: "" });
  };

  // Activity input handlers (JSON format)
  const addActivityInput = () => {
    if (currentActivityInput.trim()) {
      setActivityInputs(prev => {
        const newActivities = [...prev, {
          activity: currentActivityInput.trim(),
          participants: activityParticipantCount
        }];
        setFormData(prev => ({
          ...prev,
          dev_activity: JSON.stringify(newActivities)
        }));
        return newActivities;
      });
      setCurrentActivityInput('');
      setActivityParticipantCount(1);
    }
  };

  const removeActivityInput = (index: number) => {
    setActivityInputs(prev => {
      const newActivities = prev.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        dev_activity: JSON.stringify(newActivities)
      }));
      return newActivities;
    });
  };

  const updateMutation = useUpdateAnnualDevPlan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!devId) {
        throw new Error("No development plan ID provided");
      }
      await updateMutation.mutateAsync({ devId: parseInt(devId), formData, budgetItems });
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
                  {getClientOptions()}
                </select>
              </div>
            </div>

            {/* Program Details Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Program Details</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* GAD Program Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">GAD Program Title</label>
                    <input
                      type="text"
                      name="dev_project"
                      value={formData.dev_project}
                      onChange={handleInputChange}
                      placeholder="Enter GAD program details..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>

                  {/* GAD Activity Section */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700">GAD Activity Details</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={currentActivityInput}
                        onChange={(e) => setCurrentActivityInput(e.target.value)}
                        placeholder="Enter GAD activity details..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                      <input
                        type="number"
                        value={activityParticipantCount}
                        onChange={(e) => setActivityParticipantCount(parseInt(e.target.value) || 1)}
                        min="1"
                        placeholder="Participants"
                        className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center"
                      />
                      <Button 
                        type="button"
                        onClick={addActivityInput}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors min-w-[60px]"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 h-32 overflow-y-auto p-3">
                      {activityInputs.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-400 text-sm">No activities added yet</p>
                        </div>
                      ) : (
                        activityInputs.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 mb-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex-1">
                              <span className="text-sm text-gray-700">{item.activity}</span>
                              <span className="text-xs text-gray-500 ml-2">({item.participants} participants)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeActivityInput(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Gender Issue */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Gender Issue or GAD Mandate</label>
                    <textarea 
                      name="dev_issue"
                      value={formData.dev_issue}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                      placeholder="Enter gender issue or GAD mandate..."
                      rows={4}
                      required
                    />
                  </div>

                  {/* Performance Indicator */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Performance Indicator and Target</label>
                    <textarea 
                      name="dev_indicator"
                      value={formData.dev_indicator}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                      placeholder="Enter performance indicators..."
                      rows={4}
                      required
                    />
                  </div>
                </div>
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
                {isLoading ? "Saving..." : isFetching ? "Loading..." : "Save Changes"}
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