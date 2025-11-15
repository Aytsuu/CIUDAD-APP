// Type definitions for Health Profiling Population Structure Report

export interface AgeGroupData {
  ageGroup: string;
  male: number;
  female: number;
  total: number;
}

export interface PopulationStructureData {
  totalPopulation: number;
  ageGroups: AgeGroupData[];
  numberOfFamilies: number;
  numberOfHouseholds: number;
  toiletTypes: {
    sanitary: number;
    unsanitary: number;
    none: number;
  };
  waterSources: {
    l1PointSource: number; // e.g., tabay, puso
    l2Communal: number; // e.g., hakot system/buying
    l3CompleteSource: number; // e.g., MCWD - direct to house
  };
}

export interface PopulationReportResponse {
  success: boolean;
  message: string;
  data: PopulationStructureData;
}

export interface SitioOption {
  id: string;
  name: string;
}
