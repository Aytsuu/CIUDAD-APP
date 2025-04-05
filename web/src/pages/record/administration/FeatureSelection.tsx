import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { FixedSizeList as List } from "react-window";
import { Assigned, Feature } from "./administrationTypes";
import { getAssignedFeatures } from "./restful-api/administrationGetAPI";
import { assignFeature, setPermissions } from "./restful-api/administrationPostAPI";
import { formatDate } from "@/helpers/dateFormatter";
import { deleteAssignedFeature } from "./restful-api/administrationDeleteAPI";
import { useAuth } from "@/context/AuthContext";

interface FeatureSelectionProps {
  selectedPosition: string;
  features: Feature[];
  assignedFeatures: Assigned[];
  setAssignedFeatures: React.Dispatch<React.SetStateAction<Assigned[]>>;
  featuresCache?: React.MutableRefObject<Record<string, Assigned[]>>;
}

export default function FeatureSelection({
  selectedPosition,
  features,
  assignedFeatures,
  setAssignedFeatures,
  featuresCache,
}: FeatureSelectionProps) {

  const { user } = React.useRef(useAuth()).current;

  // Group features by category
  const groupedFeatures = React.useMemo(() => {
    const groups: Record<string, Feature[]> = {};
    for (const feature of features) {
      if (!groups[feature.feat_category]) {
        groups[feature.feat_category] = [];
      }
      groups[feature.feat_category].push(feature);
    }
    return groups;
  }, [features]);

  // Create a set for quick lookup of assigned feature IDs
  const assignedFeatureIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const af of assignedFeatures) {
      ids.add(af.feat);
    }
    return ids;
  }, [assignedFeatures]);

  // Load assigned features with error handling
  const loadAssignedFeatures = React.useCallback(async () => {
    if (!selectedPosition) return;

    try {
      const res = await getAssignedFeatures(selectedPosition);
      setAssignedFeatures(res);
      if (featuresCache) {
        featuresCache.current[selectedPosition] = res;
      }
    } catch (error) {
      console.error("Failed to load assigned features:", error);
    }
  }, [selectedPosition, setAssignedFeatures, featuresCache]);

  // Initial load and cache check
  React.useEffect(() => {
    if (featuresCache?.current[selectedPosition]) {
      setAssignedFeatures(featuresCache.current[selectedPosition]);
    } else {
      loadAssignedFeatures();
    }
  }, [selectedPosition, loadAssignedFeatures, featuresCache, setAssignedFeatures]);

  // Optimistic update for feature assignment
  const handleAssignment = React.useCallback(async (featureId: string, checked: boolean) => {
    // Create a reference to the current state to avoid stale closures
    const currentAssignedFeatures = assignedFeatures;
    const currentCache = featuresCache?.current[selectedPosition] || [];
    
    try {
      if (checked) {
        // Generate a stable temporary ID
        const tempId = `temp-${featureId}-${Date.now()}`;
        
        // Create the optimistic update
        const newAssignment: Assigned = {
          assi_id: tempId,
          assi_date: formatDate(new Date()),
          feat: featureId,
          pos: selectedPosition,
          permissions: [{
            perm_id: `perm-${tempId}`,
            view: true,
            create: false,
            update: false,
            delete: false,
            assi_id: tempId
          }],
        };
  
        // Update state immediately
        setAssignedFeatures(prev => [...prev, newAssignment]);
        
        // Update cache immediately
        if (featuresCache) {
          featuresCache.current[selectedPosition] = [...currentCache, newAssignment];
        }
  
        // Make API calls to assign the feature
        const staffId = user?.staff.staff_id;
        const assignment = await assignFeature(selectedPosition, featureId, staffId);
        const perm_id = await setPermissions(assignment.assi_id);
        
        // Update with real data
        setAssignedFeatures(prev => 
          prev.map(item => 
            item.feat === featureId && item.assi_id === tempId
              ? { 
                  ...item, 
                  assi_id: assignment.assi_id,
                  permissions: [{
                    perm_id,
                    view: true,
                    create: false,
                    update: false,
                    delete: false,
                    assi_id: assignment.assi_id
                  }]
                } 
              : item
          )
        );
  
        // Update cache with real data
        if (featuresCache) {
          featuresCache.current[selectedPosition] = 
            featuresCache.current[selectedPosition].map(item => 
              item.feat === featureId && item.assi_id === tempId
                ? { 
                    ...item, 
                    assi_id: assignment.assi_id,
                    permissions: [{
                      perm_id,
                      view: true,
                      create: false,
                      update: false,
                      delete: false,
                      assi_id: assignment.assi_id
                    }]
                  } 
                : item
            );
        }
      } else {
        // Find the exact assignment to remove
        const assignmentToRemove = currentAssignedFeatures.find(af => af.feat === featureId);
        if (!assignmentToRemove) return;
  
        // Optimistic update - remove from state
        setAssignedFeatures(prev => prev.filter(item => item.feat !== featureId));
        
        // Optimistic update - remove from cache
        if (featuresCache) {
          featuresCache.current[selectedPosition] = 
            currentCache.filter(item => item.feat !== featureId);
        }
  
        // API call
        await deleteAssignedFeature(selectedPosition, featureId);
      }
    } catch (error) {
      console.error("Operation failed:", error);
      // Rollback to previous state
      setAssignedFeatures(currentAssignedFeatures);
      if (featuresCache) {
        featuresCache.current[selectedPosition] = currentCache;
      }
    }
  }, [selectedPosition, assignedFeatures, featuresCache]);

  // Check if a feature is assigned
  const isFeatureAssigned = React.useCallback((featureId: string) => {
    return assignedFeatureIds.has(featureId);
  }, [assignedFeatureIds]);

  // Memoized row component
  const Row = React.memo(({ index, style, data }: { index: number; style: React.CSSProperties; data: Feature[] }) => {
    const feature = data[index];
    const handleChange = (checked: boolean) => handleAssignment(feature.feat_id, checked);
    
    return (
      <div style={style}>
        <div className="flex items-center gap-3">
          <Checkbox
            id={feature.feat_id}
            checked={isFeatureAssigned(feature.feat_id)}
            onCheckedChange={handleChange}
          />
          <Label htmlFor={feature.feat_id} className="text-black/80 text-[14px] cursor-pointer">
            {feature.feat_name}
          </Label>
        </div>
      </div>
    );
  });

  return (
    <Accordion type="multiple" className="w-full">
      <Separator />
      {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
        <AccordionItem key={category} value={category}>
          <AccordionTrigger className="text-black/80 text-[15px] font-medium">
            {category}
          </AccordionTrigger>
          <AccordionContent>
            <List
              height={categoryFeatures.length * 35}
              itemCount={categoryFeatures.length}
              itemSize={35}
              width="100%"
              itemData={categoryFeatures}
              overscanCount={10}
            >
              {Row}
            </List>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}