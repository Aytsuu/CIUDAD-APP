export type AIAnalysisResponse = {
  summary: string;
  keyPoints?: string[];
  keyDifferences?: string[];
  similarities?: string[];
  differences?: string[];
  recommendations?: string[];
  analysisType?: string;
  timestamp?: string;
  riskLevel?: "low" | "medium" | "high";
  complianceStatus?: "compliant" | "non_compliant" | "partial";
  confidence?: number;
  analysisTimestamp?: string;
  metadata?: {
    ordinanceCount?: number;
    categories?: string[];
    yearRange?: { min: number; max: number };
  };
};
