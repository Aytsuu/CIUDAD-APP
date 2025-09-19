import React, { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreateAnnualDevPlan, type BudgetItem as BudgetItemType } from "./queries/annualDevPlanFetchQueries";
import { ComboboxInput } from "@/components/ui/form/form-combo-box-search";
import { getStaffList } from "./restful-api/annualGetAPI";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GADAnnualDevPlanCreateSchema, type GADAnnualDevPlanCreateInput } from "@/form-schema/gad-annual-dev-plan-create-shema";
import { useAuth } from "@/context/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";

const getClientOptions = () => (
  <>
    <option value="Women">Women</option>
    <option value="LGBTQIA+">LGBTQIA+</option>
    <option value="Senior">Senior</option>
    <option value="PWD">PWD</option>
    <option value="Solo Parent">Solo Parent</option>
    <option value="Erpat">Erpat</option>
    <option value="Children">Children</option>
  </>
);

export default function AnnualDevelopmentPlanCreate() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const staffId = user?.staff?.staff_id as string | undefined;
  
  const form = useForm<GADAnnualDevPlanCreateInput>({
    resolver: zodResolver(GADAnnualDevPlanCreateSchema),
    defaultValues: {
      dev_date: "",
      dev_client: "",
      dev_issue: "",
      dev_project: "",
      dev_activity: "",
      dev_res_person: "",
      dev_indicator: "",
      dev_budget_items: "0",
      dev_gad_budget: "0",
      staff: staffId || "",
    }
  });
  const [budgetItems, setBudgetItems] = useState<{gdb_name: string, gdb_pax: string, gdb_amount: string}[]>([]);
  const [currentBudgetItem, setCurrentBudgetItem] = useState({
    gdb_name: "",
    gdb_pax: "",
    gdb_amount: "",
  });

  const [staffOptions, setStaffOptions] = useState<{ staff_id: string; full_name: string; position: string }[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<{ staff_id: string; full_name: string; position: string }[]>([]);


  const [activityInputs, setActivityInputs] = useState<{activity: string, participants: number}[]>([]);
  const [currentActivityInput, setCurrentActivityInput] = useState('');
  const [activityParticipantCount, setActivityParticipantCount] = useState<number>(1);

  const [indicatorInputs, setIndicatorInputs] = useState<{indicator: string, participants: number}[]>([]);
  const [currentIndicatorInput, setCurrentIndicatorInput] = useState('');
  const [participantCount, setParticipantCount] = useState<number>(1);

  const createMutation = useCreateAnnualDevPlan();

  React.useEffect(() => {
    const loadStaff = async () => {
      try {
        setStaffLoading(true);
        const data = await getStaffList();
        setStaffOptions(data || []);
      } catch (e) {
        console.error("Failed to fetch staff list", e);
      } finally {
        setStaffLoading(false);
      }
    };
    loadStaff();
  }, []);


  const handleBudgetItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentBudgetItem(prev => ({ ...prev, [name]: value }));
  };

  const addBudgetItem = () => {
    if (currentBudgetItem.gdb_name && currentBudgetItem.gdb_pax && currentBudgetItem.gdb_amount) {
      setBudgetItems(prev => [...prev, currentBudgetItem]);
      // Calculate total budget: sum of (pax * price) for all items
      const totalBudget = budgetItems.reduce((sum, item) => {
        const pax = parseFloat(item.gdb_pax) || 0;
        const amount = parseFloat(item.gdb_amount) || 0;
        return sum + (pax * amount);
      }, 0) + (parseFloat(currentBudgetItem.gdb_pax) || 0) * (parseFloat(currentBudgetItem.gdb_amount) || 0);
      form.setValue("dev_gad_budget", totalBudget.toString());
      setCurrentBudgetItem({ gdb_name: "", gdb_pax: "", gdb_amount: "" });
    }
  };

  const clearBudgetItem = () => {
    setCurrentBudgetItem({ gdb_name: "", gdb_pax: "", gdb_amount: "" });
  };

  const removeBudgetItem = (index: number) => {
    setBudgetItems(prev => {
      const newItems = prev.filter((_, i) => i !== index);
      // Recalculate total budget after removal
      const totalBudget = newItems.reduce((sum, item) => {
        const pax = parseFloat(item.gdb_pax) || 0;
        const amount = parseFloat(item.gdb_amount) || 0;
        return sum + (pax * amount);
      }, 0);
      form.setValue("dev_gad_budget", totalBudget.toString());
      return newItems;
    });
  };

  const clearAllBudgetItems = () => {
    setBudgetItems([]);
    form.setValue("dev_gad_budget", "0");
  };


  // Activity input handlers (JSON format)
  const addActivityInput = () => {
    if (currentActivityInput.trim()) {
      setActivityInputs(prev => {
        const newActivities = [...prev, {
          activity: currentActivityInput.trim(),
          participants: activityParticipantCount
        }];
        form.setValue("dev_activity", JSON.stringify(newActivities));
        return newActivities;
      });
      setCurrentActivityInput('');
      setActivityParticipantCount(1);
    }
  };

  const removeActivityInput = (index: number) => {
    setActivityInputs(prev => {
      const newActivities = prev.filter((_, i) => i !== index);
      form.setValue("dev_activity", JSON.stringify(newActivities));
      return newActivities;
    });
  };

  // Indicator input handlers
  const addIndicatorInput = () => {
    if (currentIndicatorInput.trim()) {
      setIndicatorInputs(prev => {
        const newIndicators = [...prev, {
          indicator: currentIndicatorInput.trim(),
          participants: participantCount
        }];
        form.setValue("dev_indicator", newIndicators.map(i => `${i.indicator} (${i.participants} participants)`).join(', '));
        return newIndicators;
      });
      setCurrentIndicatorInput(''); // Reset dropdown to default option
      setParticipantCount(1); // Reset participant count to 1
    }
  };

  const removeIndicatorInput = (index: number) => {
    setIndicatorInputs(prev => {
      const newIndicators = prev.filter((_, i) => i !== index);
      form.setValue("dev_indicator", newIndicators.map(i => `${i.indicator} (${i.participants} participants)`).join(', '));
      return newIndicators;
    });
  };

  const handleSubmit = async (data: GADAnnualDevPlanCreateInput) => {
    setIsLoading(true);

    try {
      const resPersonsArray = selectedStaff.map(s => s.position);
      const { dev_gad_budget, ...formData } = data; // Remove dev_gad_budget as it's not part of the API
      await createMutation.mutateAsync({ 
        formData: (staffId ? { ...formData, staff: staffId } : formData) as any, // include staff if available
        budgetItems: budgetItems as BudgetItemType[], 
        resPersons: resPersonsArray 
      });
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
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex flex-row items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-gray-100" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-3xl text-darkBlue2">Annual Development Plan 2024</h1>
        </div>
        <p className="text-sm text-gray-600 ml-12">Create a comprehensive annual development plan for gender and development initiatives</p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input 
                type="date" 
                {...form.register("dev_date")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
              />
              {form.formState.errors.dev_date && (
                <p className="text-red-500 text-sm">{form.formState.errors.dev_date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Client Focused</label>
              <select 
                {...form.register("dev_client")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                {getClientOptions()}
              </select>
              {form.formState.errors.dev_client && (
                <p className="text-red-500 text-sm">{form.formState.errors.dev_client.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Gender Issue or GAD Mandate</label>
              <textarea 
                {...form.register("dev_issue")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors" 
                placeholder="Enter gender issue or GAD mandate..."
                rows={3}
              />
              {form.formState.errors.dev_issue && (
                <p className="text-red-500 text-sm">{form.formState.errors.dev_issue.message}</p>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={form.watch("dev_mandated") || false}
                  onCheckedChange={(checked) => {
                    form.setValue("dev_mandated", checked as boolean);
                  }}
                />
                <label className="text-sm font-medium text-gray-700">Mandated</label>
              </div>
            </div>
            </div>
          </div>
       
        {/* Program Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">Program Details</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
            {/* GAD Program/Project/Activity - Single Input */}
            <div className="space-y-4">
              <label className="text-lg font-medium text-gray-700">GAD Program Title</label>
              <input
                type="text"
                {...form.register("dev_project")}
                placeholder="Enter GAD program details..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {form.formState.errors.dev_project && (
                <p className="text-red-500 text-sm">{form.formState.errors.dev_project.message}</p>
              )}
            </div>

            {/* GAD Activity Section */}
            <div className="space-y-4">
              <label className="text-lg font-medium text-gray-700">GAD Activity Details</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentActivityInput}
                  onChange={(e) => setCurrentActivityInput(e.target.value)}
                  placeholder="Enter GAD activity details..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
            <div className="space-y-4">
              {/* Performance Indicator and Target */}
              <div className="space-y-4">
              <label className="text-lg font-medium text-gray-700">Performance Indicator and Target</label>
              <div className="flex gap-3">
                <select
                  value={currentIndicatorInput}
                  onChange={(e) => setCurrentIndicatorInput(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select performance indicator</option>
                  {getClientOptions()}
                </select>
                <input
                  type="number"
                  value={participantCount}
                  onChange={(e) => setParticipantCount(parseInt(e.target.value) || 1)}
                  min="1"
                  placeholder="Participants"
                  className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center"
                />
                <Button 
                  type="button"
                  onClick={addIndicatorInput}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors min-w-[60px]"
                >
                  Add
                </Button>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 h-32 overflow-y-auto p-3">
                {indicatorInputs.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 text-sm">No indicators added yet</p>
                  </div>
                ) : (
                  indicatorInputs.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 mb-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex-1">
                        <span className="text-sm text-gray-700">{item.indicator}</span>
                        <span className="text-xs text-gray-500 ml-2">({item.participants} participants)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeIndicatorInput(index)}
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
          </div>
        </div>

      
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">Responsible Person</h2>
          <div className="space-y-4">
            <ComboboxInput
              value={form.watch("dev_res_person")}
              options={staffOptions}
              isLoading={staffLoading}
              label=""
              placeholder="Search staff by name to assign responsibilities"
              emptyText="No staff found"
              onSelect={(_, item) => {
                if (!item) return;
                setSelectedStaff(prev => {
                  const exists = prev.some(s => s.staff_id === item.staff_id);
                  if (exists) return prev;
                  const next = [...prev, item];
                  form.setValue("dev_res_person", next.map(n => n.position).join(", "));
                  form.setValue("staff", form.getValues("staff") || item.staff_id);
                  return next;
                });
              }}
              onCustomInput={() => { /* disallow free text in multi-select */ }}
              displayKey="full_name"
              valueKey="staff_id"
              additionalDataKey="position"
            />
            {form.formState.errors.dev_res_person && (
              <p className="text-red-500 text-sm">{form.formState.errors.dev_res_person.message}</p>
            )}
            <div className="border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 h-32 overflow-y-auto p-3">
              {selectedStaff.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-sm">No positions selected yet</p>
                </div>
              ) : (
                selectedStaff.map(s => (
                  <div key={s.staff_id} className="flex items-center gap-3 mb-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{s.position}</p>
                      <p className="text-xs text-gray-500">{s.full_name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStaff(prev => {
                          const next = prev.filter(x => x.staff_id !== s.staff_id);
                          form.setValue("dev_res_person", next.map(n => n.position).join(", "));
                          form.setValue("staff", next.length ? (form.getValues("staff") && next.some(n => n.staff_id === form.getValues("staff")) ? form.getValues("staff") : next[0].staff_id) : "");
                          return next;
                        });
                      }}
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

        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">Budget Planning</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Budget Input Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Add Budget Item</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Item Name</label>
                  <input
                    type="text"
                    name="gdb_name"
                    value={currentBudgetItem.gdb_name}
                    onChange={handleBudgetItemChange}
                    placeholder="e.g., AM Snacks, Materials, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity/Pax</label>
                    <input
                      type="number"
                      name="gdb_pax"
                      value={currentBudgetItem.gdb_pax}
                      onChange={handleBudgetItemChange}
                      placeholder="e.g., 50"
                      min="0"
                      step="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Price (₱)</label>
                    <input
                      type="number"
                      name="gdb_amount"
                      value={currentBudgetItem.gdb_amount}
                      onChange={handleBudgetItemChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button"
                    onClick={addBudgetItem}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Add Item
                  </Button>
                  <Button 
                    type="button"
                    onClick={clearBudgetItem}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>

           
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-700">Budget Summary</h3>
                {budgetItems.length > 0 && (
                  <Button 
                    type="button"
                    onClick={clearAllBudgetItems}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 h-80 overflow-y-auto p-4">
                {budgetItems.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 text-sm">No budget items added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {budgetItems.map((item, index) => {
                      const pax = parseFloat(item.gdb_pax) || 0;
                      const amount = parseFloat(item.gdb_amount) || 0;
                      const total = pax * amount;
                      return (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-800">{item.gdb_name}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-green-600">₱{total.toFixed(2)}</span>
                              <button
                                type="button"
                                onClick={() => removeBudgetItem(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">Quantity: {item.gdb_pax} | Price: ₱{amount.toFixed(2)}</p>
                        </div>
                      );
                    })}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">Total Budget:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ₱{budgetItems.reduce((sum, item) => {
                            const pax = parseFloat(item.gdb_pax) || 0;
                            const amount = parseFloat(item.gdb_amount) || 0;
                            return sum + (pax * amount);
                          }, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        
        <div className="flex justify-end gap-4 pt-6">
          <Button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
