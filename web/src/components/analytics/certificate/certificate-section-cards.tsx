import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetCertificateCardAnalytics, useGetBusinessPermitAnalytics } from "./certificate-analytics-queries";
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router";

// Memoized card component that rerenders when props change
const CertificateCard = React.memo(({ 
  title, 
  value, 
  isLoading,
  onClick,
  suffix = ""
}: { 
  title: string; 
  value?: number | string; 
  isLoading: boolean;
  onClick?: () => void;
  suffix?: string;
}) => (
  <Card 
    className="relative cursor-pointer transition-all duration-300 hover:shadow-md group overflow-hidden"
    onClick={onClick}
  >
    <CardHeader>
      <CardDescription className="truncate">{title}</CardDescription>
      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        {!isLoading && value !== undefined ? `${value}${suffix}` : "..."}
      </CardTitle>
    </CardHeader>
    <CardFooter className="flex-col items-start gap-1.5 text-sm" />
    
    {/* Animated Arrow */}
    <div className="absolute top-4 right-4 opacity-0 -translate-x-2 -translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <ArrowUpRight className="w-4 h-4 text-primary" />
      </div>
    </div>
  </Card>
));

CertificateCard.displayName = "CertificateCard";

export const useCertificateSectionCards = () => {
  const navigate = useNavigate();
  const { data: certificateCardAnalytics, isLoading: certificateLoading } = useGetCertificateCardAnalytics();
  const { data: businessPermitAnalytics, isLoading: businessLoading } = useGetBusinessPermitAnalytics();

  const isLoading = certificateLoading || businessLoading;

  return {
    totalCertificates: (
      <CertificateCard 
        title="Total Certificates" 
        value={certificateCardAnalytics?.overview?.total_certificates} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/record/clearances/certification")
        }}
      />
    ),
    totalIssued: (
      <CertificateCard 
        title="Total Issued Certificates" 
        value={certificateCardAnalytics?.overview?.total_issued} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/record/clearances/issuedcertificates")
        }}
      />
    ),
    totalPending: (
      <CertificateCard 
        title="Pending Certificates" 
        value={certificateCardAnalytics?.overview?.total_pending} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/treasurer-personal-and-others?status=Pending")
        }}
      />
    ),
    totalCompleted: (
      <CertificateCard 
        title="Completed Certificates" 
        value={certificateCardAnalytics?.overview?.total_completed} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/record/clearances/certification?status=Completed")
        }}
      />
    ),
    totalRejected: (
      <CertificateCard 
        title="Rejected Certificates" 
        value={certificateCardAnalytics?.overview?.total_rejected} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/treasurer-personal-and-others?status=Rejected")
        }}
      />
    ),
    completionRate: (
      <CertificateCard 
        title="Completion Rate" 
        value={certificateCardAnalytics?.overview?.completion_rate} 
        isLoading={isLoading}
        suffix="%"
        onClick={() => {
          navigate("/record/clearances/certification")
        }}
      />
    ),
    avgProcessingDays: (
      <CertificateCard 
        title="Avg Processing Days" 
        value={certificateCardAnalytics?.overview?.avg_processing_days} 
        isLoading={isLoading}
        suffix=" days"
        onClick={() => {
          navigate("/record/clearances/certification")
        }}
      />
    ),
    // Business Permit Cards
    totalBusinessPermits: (
      <CertificateCard 
        title="Total Business Permits" 
        value={businessPermitAnalytics?.overview?.total_permits} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/record/clearances/businesspermits")
        }}
      />
    ),
    totalIssuedPermits: (
      <CertificateCard 
        title="Total Issued Permits" 
        value={businessPermitAnalytics?.overview?.total_issued} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/record/clearances/businesspermits?status=Issued")
        }}
      />
    ),
    totalPendingPermits: (
      <CertificateCard 
        title="Pending Permits" 
        value={businessPermitAnalytics?.overview?.total_pending} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/record/clearances/businesspermits?status=Pending")
        }}
      />
    ),
    totalCompletedPermits: (
      <CertificateCard 
        title="Completed Permits" 
        value={businessPermitAnalytics?.overview?.total_completed} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/record/clearances/businesspermits?status=Completed")
        }}
      />
    ),
    totalRejectedPermits: (
      <CertificateCard 
        title="Rejected Permits" 
        value={businessPermitAnalytics?.overview?.total_rejected} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/record/clearances/businesspermits?status=Rejected")
        }}
      />
    ),
    permitCompletionRate: (
      <CertificateCard 
        title="Permit Completion Rate" 
        value={businessPermitAnalytics?.overview?.completion_rate} 
        isLoading={isLoading}
        suffix="%"
        onClick={() => {
          navigate("/record/clearances/businesspermits")
        }}
      />
    ),
    avgPermitProcessingDays: (
      <CertificateCard 
        title="Avg Permit Processing Days" 
        value={businessPermitAnalytics?.overview?.avg_processing_days} 
        isLoading={isLoading}
        suffix=" days"
        onClick={() => {
          navigate("/record/clearances/businesspermits")
        }}
      />
    ),
  };
};
