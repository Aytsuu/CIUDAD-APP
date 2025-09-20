import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUpdateAnnualDevPlan, type BudgetItem as BudgetItemType } from "./queries/annualDevPlanFetchQueries";
import { ComboboxInput } from "@/components/ui/form/form-combo-box-search";
import { getStaffList, getAnnualDevPlanYears, getAnnualDevPlansByYear, getAnnualDevPlanById } from "./restful-api/annualGetAPI";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GADAnnualDevPlanCreateSchema, type GADAnnualDevPlanCreateInput } from "@/form-schema/gad-annual-dev-plan-create-shema";
import { useAuth } from "@/context/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";

const clientOptions = [
  { value: "Women", label: "Women" },
  { value: "LGBTQIA+", label: "LGBTQIA+" },
  { value: "Senior", label: "Senior" },
  { value: "PWD", label: "PWD" },
  { value: "Solo Parent", label: "Solo Parent" },
  { value: "Erpat", label: "Erpat" },
  { value: "Children", label: "Children" }
];

const getClientOptions = () => (
  <>
    {clientOptions.map(option => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </>
);

export default function AnnualDevelopmentPlanEdit() {
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

  // Year and plans for selected year (picker)
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [plansForYear, setPlansForYear] = useState<Array<{ dev_id: number; dev_project: string }>>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [plansLoading, setPlansLoading] = useState<boolean>(false);

  const updateMutation = useUpdateAnnualDevPlan();

  const isEditable = Boolean(selectedYear) && Boolean(selectedPlanId);

  useEffect(() => {
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

  useEffect(() => {
    const loadYears = async () => {
      try {
        const y = await getAnnualDevPlanYears();
        setYears(y || []);
        // If 2025 exists, preselect it as requested
        if ((y || []).includes(2025)) {
          setSelectedYear("2025");
          void fetchPlansForYear("2025");
        }
      } catch (e) {
        // silent
      }
    };
    loadYears();
  }, []);

  const fetchPlansForYear = async (year: string) => {
    try {
      setPlansLoading(true);
      const list = await getAnnualDevPlansByYear(year);
      const normalized = (Array.isArray(list) ? list : []).map((p: any) => ({ dev_id: p.dev_id, dev_project: p.dev_project }));
      setPlansForYear(normalized);
    } catch (e) {
      setPlansForYear([]);
    } finally {
      setPlansLoading(false);
    }
  };


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
      const { dev_gad_budget, ...formData } = data;
      if (!selectedPlanId) {
        toast.error("Please select a plan to update.");
        return;
      }
      await updateMutation.mutateAsync({ 
        devId: selectedPlanId,
        formData: (staffId ? { ...formData, staff: staffId } : formData) as any,
        budgetItems: budgetItems as BudgetItemType[],
      });
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
          <h1 className="font-semibold text-3xl text-darkBlue2">Edit Annual Development Plan</h1>
        </div>
        <p className="text-sm text-gray-600 ml-12">Select a year and plan to load, then update the details below</p>
      </div>

      {/* Year and plan picker */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700">Year</label>
            <select
              value={selectedYear}
              onChange={async (e) => {
                const y = e.target.value;
                setSelectedYear(y);
                await fetchPlansForYear(y);
              }}
              className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select year</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-medium mb-1 text-gray-700">Plans for selected year</label>
            <select
              disabled={!selectedYear || plansLoading}
              onChange={async (e) => {
                const id = e.target.value;
                if (!id) return;
                setSelectedPlanId(Number(id));
                // Fetch plan data and populate form without navigation
                try {
                  let loadedActivities: { activity: string; participants: number }[] = [];
                  const plan = await getAnnualDevPlanById(id);
                  // Basic
                  form.setValue('dev_date', plan.dev_date || '');
                  form.setValue('dev_client', plan.dev_client || '');
                  form.setValue('dev_issue', plan.dev_issue || '');
                  form.setValue('dev_project', plan.dev_project || '');
                  form.setValue('dev_res_person', plan.dev_res_person || '');
                  form.setValue('dev_indicator', plan.dev_indicator || '');
                  try {
                    let activitiesSrc: any = plan.dev_activity;
                    let parsedActs: any[] = [];
                    if (Array.isArray(activitiesSrc)) {
                      parsedActs = activitiesSrc;
                    } else if (typeof activitiesSrc === 'string') {
                      const t = activitiesSrc.trim();
                      // Try strict JSON first
                      try {
                        parsedActs = JSON.parse(t);
                        if (!Array.isArray(parsedActs)) parsedActs = [parsedActs];
                      } catch {
                        // Try to coerce single quotes to double quotes for JSON-like strings
                        try {
                          const coerced = t
                            .replace(/\s+/g, ' ')
                            .replace(/'/g, '"');
                          const maybe = JSON.parse(coerced);
                          parsedActs = Array.isArray(maybe) ? maybe : [maybe];
                        } catch {
                          // Fallback: extract object-like blocks { ... }
                          const objectMatches = t.match(/\{[\s\S]*?\}/g);
                          if (objectMatches) {
                            parsedActs = objectMatches.map((block) => {
                              const act = (block.match(/['\"]activity['\"]\s*:\s*['\"]([^'\"]+)['\"]/)
                                || block.match(/activity\s*:\s*['\"]([^'\"]+)['\"]/))?.[1] || '';
                              const p = (block.match(/['\"]participants['\"]\s*:\s*(\d+)/)
                                || block.match(/participants\s*:\s*(\d+)/))?.[1];
                              return { activity: act, participants: p ? Number(p) : 1 };
                            });
                          } else {
                            // Treat as comma/newline separated list of activity strings
                            parsedActs = t.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).map((s) => ({ activity: s, participants: 1 }));
                          }
                        }
                      }
                    }
                    // Normalize shape
                    const normalizedActs = (parsedActs || []).map((it: any) => ({
                      activity: String(it?.activity ?? it?.name ?? it ?? ''),
                      participants: Number(it?.participants ?? it?.count ?? 1) || 1,
                    })).filter((it: any) => it.activity);
                    loadedActivities = normalizedActs;
                    setActivityInputs(loadedActivities);
                    // keep form value in sync so updates persist even without user edits
                    try {
                      form.setValue('dev_activity', JSON.stringify(loadedActivities));
                    } catch {}
                  } catch { setActivityInputs([]); }
                  // Indicators - normalize into indicatorInputs as in create
                  try {
                    const raw = plan.dev_indicator as unknown as any;
                    let next: {indicator: string, participants: number}[] = [];
                    if (Array.isArray(raw)) {
                      next = raw.map((it: any) => typeof it === 'string' ? (() => { const m = it.match(/^(.*)\s*\((\d+)\s*participants?\)$/i); return m ? { indicator: m[1].trim(), participants: parseInt(m[2], 10) } : { indicator: it, participants: 1 }; })() : { indicator: (it.category || it.name || it.type || ''), participants: Number(it.count ?? it.participants ?? 1) });
                    } else if (typeof raw === 'string') {
                      const t = raw.trim();
                      if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('{') && t.endsWith('}'))) {
                        try {
                          const parsed = JSON.parse(t);
                          const arr = Array.isArray(parsed) ? parsed : [parsed];
                          next = arr.map((it: any) => ({ indicator: (it.category || it.name || it.type || ''), participants: Number(it.count ?? it.participants ?? 1) }));
                        } catch {
                          const objectMatches = t.match(/\{[\s\S]*?\}/g);
                          if (objectMatches) {
                            next = objectMatches.map((block) => {
                              const c = block.match(/['\"]count['\"]\s*:\s*(\d+)/);
                              const cat = block.match(/['\"]category['\"]\s*:\s*['\"]([^'\"]+)['\"]/);
                              return { indicator: cat ? cat[1] : '', participants: c ? Number(c[1]) : 1 };
                            });
                          }
                        }
                      } else {
                        next = t.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).map((s) => { const m = s.match(/^(.*)\s*\((\d+)\s*participants?\)$/i); return m ? { indicator: m[1].trim(), participants: parseInt(m[2], 10) } : { indicator: s, participants: 1 }; });
                      }
                    }
                    setIndicatorInputs(next);
                    // If there are no activities stored, derive a sensible default from indicators
                    if ((!loadedActivities || loadedActivities.length === 0) && next && next.length > 0) {
                      const derived = next.map(i => ({ activity: i.indicator, participants: i.participants }));
                      setActivityInputs(derived);
                      try { form.setValue('dev_activity', JSON.stringify(derived)); } catch {}
                    }
                  } catch { setIndicatorInputs([]); }
        
                  // Budgets - prefer dev_budget_items JSON: [{ name, pax, amount }]
                  try {
                    let src: any = plan.dev_budget_items ?? plan.budgets ?? plan.dev_gad_items ?? [];
                    if (typeof src === 'string') {
                      try { src = JSON.parse(src); } catch { src = []; }
                    }
                    const sanitizePrice = (v: any) => {
                      const s = String(v ?? '0').replace(/[\,\s]/g, '').replace(/[^0-9.+\-]/g, '');
                      return s === '' || s === '.' || s === '-' ? '0' : s;
                    };
                    const normalized: Array<{ gdb_name: string; gdb_pax: string; gdb_amount: string }> = (Array.isArray(src) ? src : [])
                      .map((it: any) => ({
                        gdb_name: String(it.name ?? it.gdb_name ?? ''),
                        gdb_pax: String(it.pax ?? it.gdb_pax ?? it.quantity ?? '0'),
                        gdb_amount: sanitizePrice(it.amount ?? it.gdb_amount ?? it.price ?? '0'),
                      }));
                    setBudgetItems(normalized);
                  } catch {
                    setBudgetItems([]);
                  }
                  
                  try {
                    const positionsCsv: string = plan.dev_res_person || '';
                    const positions = positionsCsv.split(',').map((s: string) => s.trim()).filter(Boolean);
                    let list = staffOptions;
                    if (!list || list.length === 0) {
                      list = await getStaffList();
                      setStaffOptions(list || []);
                    }
                    const matched = positions
                      .map((pos: string) => (list || []).find((s: any) => s.position === pos))
                      .filter(Boolean) as Array<{ staff_id: string; full_name: string; position: string }>;
                    setSelectedStaff(matched);
                    if (matched.length > 0) {
                      form.setValue('staff', matched[0].staff_id);
                    }
                  } catch {
                    
                  }
                } catch (err) {
                  toast.error('Failed to load plan');
                }
              }}
              className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
            >
              <option value="">{plansLoading ? 'Loading plans...' : 'Select a plan to edit'}</option>
              {plansForYear.map((p) => (
                <option key={p.dev_id} value={p.dev_id}>
                  {p.dev_project || `Plan #${p.dev_id}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${!isEditable ? 'pointer-events-none opacity-60' : ''}`}>
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
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${!isEditable ? 'pointer-events-none opacity-60' : ''}`}>
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
                  {clientOptions.map((option) => {
                    const isSelected = indicatorInputs.some(input => input.indicator === option.value);
                    return (
                      <option 
                        key={option.value} 
                        value={option.value} 
                        disabled={isSelected}
                        className={isSelected ? "text-gray-400 bg-gray-100" : ""}
                      >
                        {option.label} {isSelected ? "(Already Selected)" : ""}
                      </option>
                    );
                  })}
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

      
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${!isEditable ? 'pointer-events-none opacity-60' : ''}`}>
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">Responsible Person</h2>
          <div className="space-y-4">
            <ComboboxInput
              value={form.watch("dev_res_person")}
              options={staffOptions.map(staff => ({
                ...staff,
                isSelected: selectedStaff.some(selected => selected.staff_id === staff.staff_id),
                full_name: selectedStaff.some(selected => selected.staff_id === staff.staff_id) 
                  ? `${staff.full_name} (Already Selected)` 
                  : staff.full_name
              }))}
              isLoading={staffLoading}
              label=""
              placeholder="Search staff by name to assign responsibilities"
              emptyText="No staff found"
              onSelect={(_, item) => {
                if (!item || item.isSelected) return;
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

        
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${!isEditable ? 'pointer-events-none opacity-60' : ''}`}>
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
            disabled={isLoading || !isEditable}
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
