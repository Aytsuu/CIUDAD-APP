import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getAnnualDevPlansByYear } from "./restful-api/annualGetAPI";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useGetProjectProposals, useGetProjectProposal } from "@/pages/record/gad/project-proposal/queries/projprop-fetchqueries";
import { useResolution } from "@/pages/record/council/resolution/queries/resolution-fetch-queries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import ViewProjectProposal from "@/pages/record/gad/project-proposal/view-projprop";
import ViewResolution from "./view-resolution-GAD";

interface AnnualDevelopmentPlanViewProps {
  year: number;
  onBack: () => void;
}

interface BudgetItem {
  name: string;
  pax: string | number;
  amount?: string | number;
  price?: string | number; 
}

interface DevelopmentPlan {
  dev_id: number;
  dev_date: string;
  dev_client: string;
  dev_issue: string;
  dev_project: string;
  dev_activity: string;
  dev_indicator: string;
  dev_res_person: string;
  staff: string;
  dev_gad_items?: BudgetItem[];
  total?: string;
  dev_mandated?: boolean;
}

export default function AnnualDevelopmentPlanView({ year, onBack }: AnnualDevelopmentPlanViewProps) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<DevelopmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [_isPdfLoading, setIsPdfLoading] = useState(true);
  const [isResolutionDialogOpen, setIsResolutionDialogOpen] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<any>(null);
  const [_isResolutionLoading, setIsResolutionLoading] = useState(true);

  // Fetch GAD Project Proposals and Resolutions to determine links per mandate
  const { data: proposals = [] } = useGetProjectProposals();
  const { data: resolutions = [] } = useResolution();

  const { data: detailedProject } = useGetProjectProposal(
    selectedProject?.gprId || 0,
    {
      enabled: isViewDialogOpen && !!selectedProject?.gprId,
    }
  );


  // Build quick lookup maps
  const proposalByDevId = useMemo(() => {
    const map = new Map<number, any>();
    (proposals || []).forEach((p: any) => {
      if (p && typeof p.devId === 'number') {
        map.set(p.devId, p);
      }
    });
    return map;
  }, [proposals]);

  // Only allow resolutions that belong to an existing proposal
  const validGprIds = useMemo(() => {
    const set = new Set<number>();
    (proposals || []).forEach((p: any) => {
      if (p && typeof p.gprId === 'number') {
        set.add(p.gprId);
      }
    });
    return set;
  }, [proposals]);

  const resolutionByGprId = useMemo(() => {
    const map = new Map<number, any>();
    (resolutions || []).forEach((r: any) => {
      if (r && typeof r.gpr_id === 'number' && validGprIds.has(r.gpr_id)) {
        map.set(r.gpr_id, r);
      }
    });
    return map;
  }, [resolutions, validGprIds]);

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

  const handleViewProject = (proposal: any) => {
    if (selectedProject?.gprId === proposal.gprId && isViewDialogOpen) return;

    setIsViewDialogOpen(false);
    setSelectedProject(null);

    setTimeout(() => {
      setSelectedProject(proposal);
      setIsViewDialogOpen(true);
    }, 50);
  };

  const closePreview = () => {
    setIsViewDialogOpen(false);
    setSelectedProject(null);
  };

  const handleViewResolution = (resolution: any) => {
    if (selectedResolution?.res_num === resolution.res_num && isResolutionDialogOpen) return;

    setIsResolutionDialogOpen(false);
    setSelectedResolution(null);

    setTimeout(() => {
      setSelectedResolution(resolution);
      setIsResolutionDialogOpen(true);
    }, 50);
  };

  const closeResolutionPreview = () => {
    setIsResolutionDialogOpen(false);
    setSelectedResolution(null);
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
          <Spinner size="lg" />
        </div>
      ) : plans.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p>No development plans found for this year.</p>
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh] bg-white rounded border border-gray-200">
          <table className="min-w-full text-sm border border-gray-200 border-collapse">
            <colgroup>
              <col className="w-48" />
              <col className="w-64" />
              <col className="w-56" />
              <col className="w-40" />
              <col className="w-20" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-56" />
              <col className="w-32" />
            </colgroup>
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b border-gray-200">
                <th className="px-3 py-2 text-left align-bottom border border-gray-200" rowSpan={2}>GENDER ISSUE OR<br />GAD MANDATE</th>
                <th className="px-3 py-2 text-left align-bottom border border-gray-200" rowSpan={2}>GAD PROGRAM/ PROJECT/ ACTIVITY</th>
                <th className="px-3 py-2 text-left align-bottom border border-gray-200" rowSpan={2}>PERFORMANCE INDICATOR AND TARGET</th>
                <th className="px-3 py-2 text-center align-bottom border border-gray-200" colSpan={4}>GAD BUDGET</th>
                <th className="px-3 py-2 text-left align-bottom border border-gray-200" rowSpan={2}>RESPONSIBLE PERSON</th>
                <th className="px-3 py-2 text-center align-bottom border border-gray-200" rowSpan={2}>STATUS</th>
              </tr>
              <tr className="bg-blue-50 text-blue-900 font-semibold border-b border-blue-100">
                <td className="bg-sky-100 px-3 py-2 border border-blue-200" colSpan={1}>CLIENT FOCUSED</td>
                <th className="bg-sky-100 px-3 py-1 text-center border border-gray-200">pax</th>
                <th className="bg-sky-100 px-3 py-1 text-center border border-gray-200">amount (PHP)</th>
                <th className="bg-sky-100 px-3 py-1 text-center border border-gray-200">total</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.dev_id}>
                  <td className="px-3 py-2 align-top border border-gray-200">
                    <div>
                      <div className="font-semibold text-blue-900">{plan.dev_client}</div>
                      <div className="text-xs mt-2 text-gray-700 mb-5">{plan.dev_issue}</div>
                      {(() => {
                        const proposal = proposalByDevId.get(plan.dev_id);
                        const resolution = proposal ? resolutionByGprId.get(proposal.gprId as number) : null;
                        
                        return (
                          <div className="mt-2 space-y-1">
                            {proposal && (
                              <div 
                                className="text-xs text-yellow-600 font-medium cursor-pointer hover:text-yellow-800 hover:underline"
                                onClick={() => handleViewProject(proposal)}
                              >
                                View Project Proposal
                              </div>
                            )}
                            {resolution && (
                              <div 
                                className="text-xs text-blue-600 font-medium cursor-pointer hover:text-blue-800 hover:underline"
                                onClick={() => handleViewResolution(resolution)}
                              >
                                Resolution #{resolution.res_num}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top border border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900 mb-2">
                        {(() => {
                          try {
                            // Parse dev_project if it's a JSON string
                            if (typeof plan.dev_project === 'string' && plan.dev_project.startsWith('[')) {
                              const parsed = JSON.parse(plan.dev_project);
                              return Array.isArray(parsed) ? parsed[0] : plan.dev_project;
                            }
                            return plan.dev_project;
                          } catch (error) {
                            return plan.dev_project;
                          }
                        })()}
                      </div>
                      {plan.dev_activity && Array.isArray(plan.dev_activity) && plan.dev_activity.length > 0 && (
                        <div className="text-sm text-gray-600 mt-2">
                          <ul className="list-disc list-inside space-y-1">
                            {plan.dev_activity.map((activity: any, idx: number) => (
                              <li key={idx} className="text-xs">{activity.activity}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top border border-gray-200">
                    <div>
                      {(() => {
                        const raw = plan.dev_indicator as unknown as any;
                        let items: any[] = [];
                        try {
                          if (Array.isArray(raw)) {
                            items = raw;
                          } else if (typeof raw === 'string') {
                            const trimmed = raw.trim();
                            // Try strict JSON first
                            if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
                              try {
                                const parsed = JSON.parse(trimmed);
                                items = Array.isArray(parsed) ? parsed : [parsed];
                              } catch {
                      
                              }
                            }
                            if (!items.length) {
                             
                              const objectMatches = trimmed.match(/\{[\s\S]*?\}/g);
                              if (objectMatches && objectMatches.length) {
                                const parsedObjects = objectMatches.map((block) => {
                                  const countMatch = block.match(/['\"]count['\"]\s*:\s*(\d+)/);
                                  const categoryMatch = block.match(/['\"]category['\"]\s*:\s*['\"]([^'\"]+)['\"]/);
                                  const obj: any = {};
                                  if (categoryMatch) obj.category = categoryMatch[1];
                                  if (countMatch) obj.count = Number(countMatch[1]);
                                  return obj;
                                }).filter(o => o.category || o.count != null);
                                if (parsedObjects.length) items = parsedObjects;
                              }
                            }
                            if (!items.length) {
                              // fallback: comma or newline separated list of plain strings
                              items = trimmed.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
                            }
                          }
                        } catch (_e) {
                          // fallback to comma split on parse failure
                          items = String(raw || '').split(',').map(s => s.trim()).filter(Boolean);
                        }

                        if (!items || items.length === 0) {
                          return <div className="text-sm text-gray-500">-</div>;
                        }

                        return (
                          <ul className="list-disc list-inside">
                            {items.map((it, idx) => {
                              if (typeof it === 'string') {
                                return <li key={idx} className="text-sm">{it}</li>;
                              }
                              // object shape: { count, category } or similar
                              const category = (it && (it.category || it.name || it.type || 'Category')) as string;
                              const count = (it && (it.count ?? it.pax ?? it.value)) as number | string | undefined;
                              const text = count != null ? `${category}: ${count}` : String(category);
                              return <li key={idx} className="text-sm">{text}</li>;
                            })}
                          </ul>
                        );
                      })()}
                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(plan.dev_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                      plan.dev_gad_items.map((item, idx) => {
                        const amount = Number((item.amount ?? item.price) || 0);
                        return <div key={idx}>₱{isFinite(amount) ? amount.toFixed(2) : '0.00'}</div>;
                      })
                    ) : (
                      <span>₱{plan.total || '0'}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top border border-gray-200">
                    {plan.dev_gad_items && plan.dev_gad_items.length > 0 ? (
                      <div>
                        ₱{
                          plan.dev_gad_items
                            .reduce((sum, item) => {
                              const pax = Number(item.pax || 0);
                              const amount = Number((item.amount ?? item.price) || 0);
                              const total = (isFinite(pax) ? pax : 0) * (isFinite(amount) ? amount : 0);
                              return sum + total;
                            }, 0)
                            .toFixed(2)
                        }
                      </div>
                    ) : (
                      <span>₱{plan.total || '0'}</span>
                    )}
              </td>
                  <td className="px-3 py-2 align-top border border-gray-200">
                    <ul className="list-disc list-inside">
                      {plan.dev_res_person.split(',').map((person, idx) => (
                        <li key={idx} className="text-sm">{person.trim()}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-3 py-2 align-top border border-gray-200 text-center">
                    {(() => {
                      const proposal = proposalByDevId.get(plan.dev_id);
                      const hasProposal = Boolean(proposal && proposal.gprId);
                      const hasResolution = hasProposal && resolutionByGprId.has(proposal.gprId as number);

                      const badges: JSX.Element[] = [];

                      if (plan.dev_mandated) {
                        badges.push(
                          <span key="mandated" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1">
                            Mandated
                          </span>
                        );
                      }

                      if (hasProposal) {
                        badges.push(
                          <span key="with-proposal" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-1">
                            With Project Proposal
                          </span>
                        );
                      }

                      if (hasResolution) {
                        badges.push(
                          <span key="with-resolution" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            With Resolution
                          </span>
                        );
                      }

                      if (badges.length === 0) {
                        return <span className="text-sm text-gray-500">-</span>;
                      }

                      return <div className="flex flex-wrap gap-y-1 justify-center">{badges}</div>;
                    })()}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-3 py-2 text-right border border-gray-200" colSpan={6}>Total</td>
                <td className="px-3 py-2 border border-gray-200">
                  ₱{plans.reduce((sum, plan) => sum + parseFloat(plan.total || '0'), 0).toFixed(2)}
                </td>
                <td className="px-3 py-2 border border-gray-200"></td>
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

      <Dialog open={isViewDialogOpen} onOpenChange={closePreview}>
        <DialogContent className="max-w-[90vw] w-[90vw] h-[95vh] max-h-[95vh] p-0 flex flex-col">
          <DialogHeader className="p-4 bg-background border-b sticky top-0 z-50">
            <div className="flex items-center justify-between w-full">
              <DialogTitle className="text-left">
                {selectedProject?.projectTitle || "Project Proposal"}
              </DialogTitle>
              <div className="flex gap-2">
                <X
                  className="text-gray-500 cursor-pointer hover:text-gray-700"
                  size={20}
                  onClick={closePreview}
                />
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto relative">
            {selectedProject && (
              <ViewProjectProposal
                project={detailedProject || selectedProject}
                onLoad={() => setIsPdfLoading(false)}
                onError={() => setIsPdfLoading(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isResolutionDialogOpen} onOpenChange={closeResolutionPreview}>
        <DialogContent className="max-w-[90vw] w-[90vw] h-[95vh] max-h-[95vh] p-0 flex flex-col">
          <DialogHeader className="p-4 bg-background border-b sticky top-0 z-50">
            <div className="flex items-center justify-between w-full">
              <DialogTitle className="text-left">
                {selectedResolution?.res_title || "Resolution"}
              </DialogTitle>
              <div className="flex gap-2">
                <X
                  className="text-gray-500 cursor-pointer hover:text-gray-700"
                  size={20}
                  onClick={closeResolutionPreview}
                />
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto relative">
            {selectedResolution && (
              <ViewResolution
                resolution={selectedResolution}
                onLoad={() => setIsResolutionLoading(false)}
                onError={() => setIsResolutionLoading(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
} 