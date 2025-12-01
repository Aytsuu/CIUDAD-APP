import { useNCDHistory } from '../../pages/record/health-family-profiling/family-profling/queries/profilingHistoryQueries';
import { HistoryList } from '@/components/health-profiling/HistoryList';

interface NCDHistoryDisplayProps {
  ncdId: string;
}

export const NCDHistoryDisplay = ({ ncdId }: NCDHistoryDisplayProps) => {
  const { data: history, isLoading } = useNCDHistory(ncdId);

  return (
    <HistoryList
      history={history || []}
      entityType="ncd"
      entityTitle="NCD Record"
      isLoading={isLoading}
    />
  );
};
